import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const COMMANDS = {
  1: {
    label: "WATER",
    message: "I need water",
    icon: "☝️",
  },
  2: {
    label: "FOOD",
    message: "I need food",
    icon: "✌️",
  },
  3: {
    label: "MEDICINES",
    message: "I need my medicines",
    icon: "🤟",
  },
  4: {
    label: "WASHROOM",
    message: "I want to use the washroom",
    icon: "🖐️",
  },
  5: {
    label: "HELP",
    message: "I need help",
    icon: "✋",
  },
};

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/*
  Simple five-finger counter.

  For index/middle/ring/pinky:
  fingertip farther from the wrist than the PIP joint = extended.

  For thumb:
  fingertip farther from the wrist than the IP joint = extended.

  This intentionally stays simple. We can make it more advanced later
  if we need to handle difficult hand angles.
*/
function fingerExtended(landmarks, tip, joint) {
  return (
    distance(landmarks[tip], landmarks[0]) >
    distance(landmarks[joint], landmarks[0]) * 1.08
  );
}

function countFingers(landmarks) {
  if (!landmarks || landmarks.length !== 21) return 0;

  const thumb = fingerExtended(landmarks, 4, 3);
  const index = fingerExtended(landmarks, 8, 6);
  const middle = fingerExtended(landmarks, 12, 10);
  const ring = fingerExtended(landmarks, 16, 14);
  const pinky = fingerExtended(landmarks, 20, 18);

  return [thumb, index, middle, ring, pinky].filter(Boolean).length;
}

function classifyGesture(landmarks) {
  const count = countFingers(landmarks);

  if (count >= 1 && count <= 5) {
    return count;
  }

  return 0;
}

export default function CommunicationVision({ onEvent }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const fpsSamplesRef = useRef([]);

  // Gesture stability
  const candidateRef = useRef(0);
  const candidateFramesRef = useRef(0);
  const spokenCommandRef = useRef(0);
  const lastSpeechTimeRef = useRef(0);

  const [status, setStatus] = useState("VISION OFFLINE");
  const [loading, setLoading] = useState(false);
  const [hands, setHands] = useState(0);
  const [landmarks, setLandmarks] = useState(0);
  const [fingerCount, setFingerCount] = useState(0);
  const [gesture, setGesture] = useState("NO GESTURE");
  const [confidence, setConfidence] = useState("--");
  const [fps, setFps] = useState(0);
  const [error, setError] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const speakCommand = (commandNumber) => {
    const command = COMMANDS[commandNumber];

    if (!command || !voiceEnabled) return;

    if (!("speechSynthesis" in window)) {
      setError("Voice output is not supported by this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(command.message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Prefer an English/Indian English voice if the browser provides one.
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) =>
        /en-IN/i.test(voice.lang)
      ) ||
      voices.find((voice) =>
        /en-US|en-GB/i.test(voice.lang)
      );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);

    if (onEvent) {
      onEvent(`Communication voice: "${command.message}".`);
    }
  };

  const testSpeaker = () => {
    if (!("speechSynthesis" in window)) {
      setError("Voice output is not supported by this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      "NEXUS communication speaker is working."
    );
    utterance.rate = 0.9;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => /en-IN/i.test(voice.lang)) ||
      voices.find((voice) => /en-US|en-GB/i.test(voice.lang));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const stopVision = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    candidateRef.current = 0;
    candidateFramesRef.current = 0;
    spokenCommandRef.current = 0;

    setStatus("VISION OFFLINE");
    setHands(0);
    setLandmarks(0);
    setFingerCount(0);
    setGesture("NO GESTURE");
    setConfidence("--");
    setFps(0);
  };

  const drawResults = (result) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    const detectedHands = result.landmarks || [];

    detectedHands.forEach((hand) => {
      ctx.lineWidth = Math.max(2, width / 500);
      ctx.strokeStyle = "rgba(105, 167, 255, 0.9)";
      ctx.fillStyle = "rgba(105, 167, 255, 1)";

      CONNECTIONS.forEach(([a, b]) => {
        const start = hand[a];
        const end = hand[b];

        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      });

      hand.forEach((point) => {
        ctx.beginPath();
        ctx.arc(
          point.x * width,
          point.y * height,
          Math.max(3, width / 250),
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    });
  };

  const processFrame = () => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();

    try {
      const result = landmarker.detectForVideo(video, now);
      const detectedHands = result.landmarks || [];
      const handCount = detectedHands.length;

      setHands(handCount);
      setLandmarks(handCount * 21);

      const score = result.handednesses?.[0]?.[0]?.score;

      setConfidence(
        typeof score === "number"
          ? `${Math.round(score * 100)}%`
          : "--"
      );

      drawResults(result);

      if (handCount > 0) {
        const detectedCount = countFingers(detectedHands[0]);

        setFingerCount(detectedCount);

        const detectedCommand = classifyGesture(detectedHands[0]);

        // Require the same finger count for several frames.
        if (detectedCommand === candidateRef.current) {
          candidateFramesRef.current += 1;
        } else {
          candidateRef.current = detectedCommand;
          candidateFramesRef.current = 1;
        }

        if (candidateFramesRef.current >= 8 && detectedCommand > 0) {
          const command = COMMANDS[detectedCommand];

          setGesture(command.label);

          // Speak only once when a new gesture is confirmed.
          const enoughTimePassed =
            now - lastSpeechTimeRef.current > 1200;

          if (
            detectedCommand !== spokenCommandRef.current &&
            enoughTimePassed
          ) {
            spokenCommandRef.current = detectedCommand;
            lastSpeechTimeRef.current = now;

            if (onEvent) {
              onEvent(
                `Hand communication detected: ${command.message}.`
              );
            }

            speakCommand(detectedCommand);
          }
        }

        if (candidateFramesRef.current < 8) {
          setGesture("DETECTING...");
        }
      } else {
        candidateRef.current = 0;
        candidateFramesRef.current = 0;
        spokenCommandRef.current = 0;

        setFingerCount(0);
        setGesture("NO GESTURE");
      }

      if (lastTimeRef.current) {
        const instantFps =
          1000 / (now - lastTimeRef.current);

        fpsSamplesRef.current.push(instantFps);

        if (fpsSamplesRef.current.length > 12) {
          fpsSamplesRef.current.shift();
        }

        const average =
          fpsSamplesRef.current.reduce(
            (sum, value) => sum + value,
            0
          ) / fpsSamplesRef.current.length;

        setFps(Math.round(average));
      }

      lastTimeRef.current = now;
    } catch (frameError) {
      console.error("MediaPipe frame error:", frameError);
    }

    animationRef.current = requestAnimationFrame(processFrame);
  };

  const startVision = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");
      setStatus("INITIALIZING VISION");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      if ("speechSynthesis" in window) {
        // Load browser voices early.
        window.speechSynthesis.getVoices();
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;

      await video.play();

      setStatus("LOADING MODEL");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      const landmarker =
        await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "/models/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55,
          }
        );

      landmarkerRef.current = landmarker;

      setStatus("VISION ACTIVE");

      if (onEvent) {
        onEvent(
          "Computer vision initialized. Five-finger communication active."
        );
      }

      animationRef.current =
        requestAnimationFrame(processFrame);
    } catch (visionError) {
      console.error("Vision startup error:", visionError);

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      setStatus("VISION ERROR");

      if (visionError.name === "NotAllowedError") {
        setError("Camera permission was denied.");
      } else if (visionError.name === "NotFoundError") {
        setError("No camera was detected.");
      } else {
        setError(
          visionError.message ||
            "Unable to initialize computer vision."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentCommand = COMMANDS[fingerCount];

  return (
    <div className="communicationPanel">
      <div className="communicationStatus">
        <span className="statusDot"></span>
        {status}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.6fr) minmax(260px, 0.8fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "420px",
            background: "#070b12",
            border: "1px solid #202c3d",
            borderRadius: "12px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              minHeight: "420px",
              objectFit: "cover",
              display: "block",
              transform: "scaleX(-1)",
              background: "#070b12",
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              pointerEvents: "none",
            }}
          />

          {status !== "VISION ACTIVE" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(7, 11, 18, 0.82)",
                textAlign: "center",
                padding: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "42px",
                    marginBottom: "10px",
                  }}
                >
                  ✋
                </div>

                <strong
                  style={{
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {loading
                    ? "INITIALIZING COMPUTER VISION"
                    : "VISION READY"}
                </strong>

                <small
                  style={{
                    display: "block",
                    color: "#8190a5",
                    marginBottom: "18px",
                  }}
                >
                  {loading
                    ? "Loading webcam and MediaPipe hand model..."
                    : "Use 1–5 fingers to communicate."}
                </small>

                {!loading && (
                  <button
                    className="toggleButton"
                    onClick={startVision}
                  >
                    START VISION
                  </button>
                )}

                {error && (
                  <p
                    style={{
                      color: "#ff6262",
                      marginTop: "14px",
                      fontSize: "13px",
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === "VISION ACTIVE" && (
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "16px",
                right: "16px",
                display: "flex",
                justifyContent: "space-between",
                pointerEvents: "none",
                fontSize: "12px",
                letterSpacing: "0.08em",
              }}
            >
              <span>VISION-01</span>
              <span>● HAND COMMUNICATION</span>
            </div>
          )}
        </div>

        <div
          style={{
            border: "1px solid #202c3d",
            borderRadius: "12px",
            padding: "20px",
            background: "#0d131d",
          }}
        >
          <p className="eyebrow">HAND COMMUNICATION</p>
          <h2 style={{ marginTop: "6px" }}>
            Five-Finger Control
          </h2>

          <div
            className="healthRows"
            style={{ marginTop: "18px" }}
          >
            <div>
              <span>HANDS</span>
              <strong>{hands}</strong>
            </div>

            <div>
              <span>FINGERS</span>
              <strong>{fingerCount}</strong>
            </div>

            <div>
              <span>LANDMARKS</span>
              <strong>{landmarks}</strong>
            </div>

            <div>
              <span>CONFIDENCE</span>
              <strong>{confidence}</strong>
            </div>

            <div>
              <span>FPS</span>
              <strong>{fps || "--"}</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: "22px",
              padding: "18px",
              border: "1px solid #202c3d",
              borderRadius: "10px",
              background: "#111925",
            }}
          >
            <p className="eyebrow">DETECTED REQUEST</p>

            <strong
              style={{
                display: "block",
                fontSize: "24px",
                marginTop: "8px",
              }}
            >
              {gesture}
            </strong>

            <small
              style={{
                display: "block",
                color: "#8190a5",
                marginTop: "6px",
              }}
            >
              {currentCommand
                ? currentCommand.message
                : "Show 1–5 fingers clearly to communicate."}
            </small>
          </div>

          <div
            style={{
              marginTop: "18px",
              fontSize: "12px",
              lineHeight: 1.8,
              color: "#8190a5",
            }}
          >
            <strong
              style={{
                color: "#edf3fb",
                display: "block",
                marginBottom: "6px",
              }}
            >
              COMMUNICATION MAP
            </strong>

            ☝️ 1 — I need water
            <br />
            ✌️ 2 — I need food
            <br />
            🤟 3 — I need my medicines
            <br />
            🖐️ 4 — I want to use the washroom
            <br />
            ✋ 5 — I need help
          </div>

          <div
            style={{
              marginTop: "18px",
              paddingTop: "16px",
              borderTop: "1px solid #202c3d",
            }}
          >
            <p className="eyebrow">VOICE OUTPUT</p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              <button
                className="toggleButton"
                onClick={() => setVoiceEnabled((value) => !value)}
              >
                {voiceEnabled
                  ? "VOICE ON"
                  : "VOICE OFF"}
              </button>

              <button
                className="toggleButton"
                onClick={testSpeaker}
              >
                TEST SPEAKER
              </button>
            </div>

            <small
              style={{
                display: "block",
                color: "#8190a5",
                marginTop: "8px",
              }}
            >
              Confirmed gestures are spoken through the computer speaker.
            </small>
          </div>

          {status === "VISION ACTIVE" && (
            <button
              className="toggleButton"
              style={{ marginTop: "20px" }}
              onClick={stopVision}
            >
              STOP VISION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

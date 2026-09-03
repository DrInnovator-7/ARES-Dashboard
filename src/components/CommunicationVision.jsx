import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],

  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],

  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],

  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],

  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],

  [5, 9],
  [9, 13],
  [13, 17],
];

function CommunicationVision() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);

  const lastVideoTimeRef = useRef(-1);

  const [cameraActive, setCameraActive] = useState(false);
  const [cvReady, setCvReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [cvStatus, setCvStatus] = useState(
    "INITIALIZING VISION ENGINE"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    initializeVision();

    return () => {
      stopVision();
    };
  }, []);

  const initializeVision = async () => {
    try {
      setError("");
      setCvStatus("LOADING MEDIAPIPE");

      const vision = await FilesetResolver.forVisionTasks(
        WASM_PATH
      );

      const landmarker =
        await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: MODEL_PATH,
            },

            runningMode: "VIDEO",

            numHands: 2,

            minHandDetectionConfidence: 0.5,

            minHandPresenceConfidence: 0.5,

            minTrackingConfidence: 0.5,
          }
        );

      landmarkerRef.current = landmarker;

      setCvReady(true);
      setCvStatus("VISION ENGINE READY");
    } catch (err) {
      console.error(err);

      setCvReady(false);

      setCvStatus("VISION ENGINE ERROR");

      setError(
        "Unable to initialize the MediaPipe vision engine."
      );
    }
  };

  const startCamera = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Camera access is not supported by this browser."
        );
        return;
      }

      if (!landmarkerRef.current) {
        setError(
          "Vision engine is still loading. Please wait."
        );
        return;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
            facingMode: "user",
          },

          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraActive(true);
      setCvStatus("VISION TRACKING ACTIVE");

      requestAnimationFrame(processFrame);
    } catch (err) {
      console.error(err);

      setCameraActive(false);

      if (err.name === "NotAllowedError") {
        setError(
          "Camera permission was denied."
        );
      } else if (err.name === "NotFoundError") {
        setError(
          "No camera was detected on this device."
        );
      } else {
        setError(
          "Unable to access the camera."
        );
      }
    }
  };

  const stopVision = () => {
    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setHandDetected(false);
    setHandCount(0);

    drawEmptyCanvas();
  };

  const drawEmptyCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (
      !video ||
      !canvas ||
      !landmarker ||
      video.readyState <
        HTMLMediaElement.HAVE_ENOUGH_DATA
    ) {
      animationRef.current =
        requestAnimationFrame(processFrame);

      return;
    }

    if (
      video.currentTime !==
      lastVideoTimeRef.current
    ) {
      lastVideoTimeRef.current =
        video.currentTime;

      const results =
        landmarker.detectForVideo(
          video,
          performance.now()
        );

      drawLandmarks(results);

      const count =
        results.landmarks?.length || 0;

      setHandCount(count);
      setHandDetected(count > 0);
    }

    animationRef.current =
      requestAnimationFrame(processFrame);
  };

  const drawLandmarks = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      return;
    }

    const rect =
      video.getBoundingClientRect();

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (!results.landmarks) {
      return;
    }

    results.landmarks.forEach(
      (landmarks) => {
        ctx.lineWidth = 3;

        ctx.beginPath();

        CONNECTIONS.forEach(
          ([start, end]) => {
            const first =
              landmarks[start];

            const second =
              landmarks[end];

            if (!first || !second) {
              return;
            }

            ctx.moveTo(
              first.x * width,
              first.y * height
            );

            ctx.lineTo(
              second.x * width,
              second.y * height
            );
          }
        );

        ctx.stroke();

        landmarks.forEach(
          (point) => {
            ctx.beginPath();

            ctx.arc(
              point.x * width,
              point.y * height,
              5,
              0,
              Math.PI * 2
            );

            ctx.fill();
          }
        );
      }
    );
  };

  return (
    <div className="largeCard">
      <div className="cardHeader">
        <div>
          <span className="cardLabel">
            COMPUTER VISION
          </span>

          <h3>
            Hand Tracking Engine
          </h3>
        </div>

        <div className="cameraFeedStatus">
          <span
            className={`statusDot ${
              cvReady
                ? ""
                : "statusOffline"
            }`}
          ></span>

          {cvStatus}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          background: "#05080d",
          border:
            "1px solid var(--line)",
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
            objectFit: "cover",
            transform:
              "scaleX(-1)",
            display: "block",
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            transform:
              "scaleX(-1)",
            pointerEvents: "none",
          }}
        />

        {!cameraActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "10px",
              background:
                "rgba(5, 8, 13, 0.86)",
            }}
          >
            <strong>
              VISION CAMERA READY
            </strong>

            <small>
              Start the camera to begin
              hand tracking.
            </small>

            <button
              onClick={startCamera}
              disabled={!cvReady}
            >
              {cvReady
                ? "START VISION"
                : "LOADING ENGINE"}
            </button>
          </div>
        )}
      </div>

      <div
        className="cameraStats"
        style={{
          marginTop: "18px",
        }}
      >
        <div>
          <span>
            VISION ENGINE
          </span>

          <b>
            {cvReady
              ? "READY"
              : "LOADING"}
          </b>
        </div>

        <div>
          <span>
            CAMERA
          </span>

          <b>
            {cameraActive
              ? "ONLINE"
              : "OFFLINE"}
          </b>
        </div>

        <div>
          <span>
            HAND STATUS
          </span>

          <b>
            {handDetected
              ? "DETECTED"
              : "NOT DETECTED"}
          </b>
        </div>

        <div>
          <span>
            HANDS
          </span>

          <b>
            {handCount}
          </b>
        </div>

        <div>
          <span>
            LANDMARKS
          </span>

          <b>
            {handDetected
              ? handCount * 21
              : 0}
          </b>
        </div>
      </div>

      {error && (
        <p
          style={{
            marginTop: "14px",
            color: "var(--red)",
          }}
        >
          {error}
        </p>
      )}

      {cameraActive && (
        <div
          className="cameraControls"
          style={{
            marginTop: "16px",
          }}
        >
          <button
            onClick={stopVision}
          >
            STOP VISION
          </button>
        </div>
      )}
    </div>
  );
}

export default CommunicationVision;
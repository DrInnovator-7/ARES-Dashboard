import { useEffect, useRef } from "react";

function CameraFeed() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        videoRef.current.srcObject = stream;
      } catch (error) {
        console.log("Camera Error:", error);
      }
    }

    startCamera();
  }, []);

  return (
    <div className="card">

      <h3>📹 Surveillance Camera</h3>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="cameraVideo"
      ></video>

    </div>
  );
}

export default CameraFeed;
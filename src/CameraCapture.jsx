import { useEffect, useRef, useState } from "react";

function CameraCapture({ label, name, onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
            });

            streamRef.current = stream;
            setIsCameraOpen(true); // render <video>
        } catch (err) {
            alert(`${err.name}: ${err.message}`);
        }
    };

    const closeCamera = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(blob => {
            const file = new File([blob], `${name}.jpg`, {
                type: "image/jpeg",
            });

            onCapture(name, file);
            closeCamera();
        }, "image/jpeg");
    };

    useEffect(() => {
        return () => closeCamera();
    }, []);
    useEffect(() => {
        if (isCameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play();
        }
    }, [isCameraOpen]);

    return (
        <div className="camera-box">
            <button type="button" onClick={openCamera}>
                📷 Open Camera ({label})
            </button>

            {isCameraOpen && (
                <div className="camera-preview">
                    <video ref={videoRef} autoPlay playsInline />
                    <button type="button" onClick={capturePhoto}>Capture</button>
                    <button type="button" onClick={closeCamera}>Cancel</button>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}

export default CameraCapture;

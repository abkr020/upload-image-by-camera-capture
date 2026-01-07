import { useEffect, useRef, useState } from "react";

function CameraCapture({ label, name, onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [preview, setPreview] = useState(null);

    // Open camera
    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
            });

            streamRef.current = stream;
            setIsOpen(true);
        } catch (err) {
            alert(`${err.name}: ${err.message}`);
        }
    };

    // Safe camera close (prevents AbortError)
    const closeCamera = () => {
        try {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.srcObject = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    if (track.readyState === "live") track.stop();
                });
                streamRef.current = null;
            }
        } catch (e) {
            console.warn("Camera cleanup warning:", e);
        }

        setPreview(null);
        setIsOpen(false);
    };

    // Capture image from video
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg");
        setPreview(dataUrl);
    };

    // Confirm captured photo
    const usePhoto = async () => {
        try {
            const res = await fetch(preview);
            const blob = await res.blob();

            const file = new File([blob], `${name}.jpg`, {
                type: "image/jpeg",
            });

            onCapture(name, file);
            closeCamera();
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error(err);
            }
        }
    };

    // Attach stream to video
    useEffect(() => {
        if (isOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play();
        }
    }, [isOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => closeCamera();
    }, []);

    return (
        <>
            <button type="button" onClick={openCamera}>
                📷 Open Camera ({label})
            </button>

            {isOpen && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3>{label}</h3>

                        {!preview ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                        marginBottom: "8px",
                                    }}
                                />
                                <button type="button" onClick={capturePhoto}>Capture</button>
                            </>
                        ) : (
                            <>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                        marginBottom: "8px",
                                    }}
                                />
                                <button type="button" onClick={usePhoto}>Use Photo</button>
                                <button type="button" onClick={() => setPreview(null)}>Retake</button>
                            </>
                        )}

                        <button type="button" onClick={closeCamera}>Cancel</button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
    );
}

export default CameraCapture;

/* =========================
   Minimal Inline Styles
========================= */

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalStyle = {
    background: "#fff",
    padding: "16px",
    width: "320px",
    borderRadius: "10px",
    textAlign: "center",
};

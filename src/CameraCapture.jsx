import { useEffect, useRef, useState } from "react";

function CameraCapture({ label, name, onCapture, existingFile }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [preview, setPreview] = useState(null); // captured or existing photo
    const [showVideo, setShowVideo] = useState(true); // show camera stream

    // Open camera
    const openCamera = async () => {
        try {
            // If existing file, show it first as preview
            if (existingFile) {
                setPreview(URL.createObjectURL(existingFile));
                setShowVideo(false); // show preview, not live video initially
            } else {
                setShowVideo(true);
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
            });

            streamRef.current = stream;
            setIsOpen(true);
        } catch (err) {
            alert(`${err.name}: ${err.message}`);
        }
    };

    // Safe camera close
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

        setIsOpen(false);
        setShowVideo(true);
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
        setShowVideo(false); // hide video after capture
    };

    // Confirm captured photo
    const usePhoto = async () => {
        try {
            const res = await fetch(preview);
            const blob = await res.blob();

            const file = new File([blob], `${name}.jpg`, { type: "image/jpeg" });

            onCapture(name, file);
            closeCamera();
        } catch (err) {
            if (err.name !== "AbortError") console.error(err);
        }
    };

    // Attach stream to video when showVideo = true
    useEffect(() => {
        if (showVideo && isOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play();
        }
    }, [showVideo, isOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
            closeCamera();
        };
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

                        {showVideo ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }}
                                />
                                <button type="button" onClick={capturePhoto}>
                                    Capture
                                </button>
                            </>
                        ) : preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }}
                                />
                                <button type="button" onClick={usePhoto}>
                                    Use Photo
                                </button>
                                <button type="button" onClick={() => setShowVideo(true)}>
                                    Retake
                                </button>
                            </>
                        ) : null}

                        <button type="button" onClick={closeCamera}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
    );
}

export default CameraCapture;

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

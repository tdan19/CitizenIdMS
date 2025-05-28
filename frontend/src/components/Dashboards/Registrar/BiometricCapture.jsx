import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

const BiometricCapture = ({ onComplete }) => {
  const webcamRef = useRef(null);
  const fingerprintInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  const [data, setData] = useState({
    photo: null,
    fingerprint: null,
    signature: null,
    photoPreview: "",
    fingerprintPreview: "",
    signaturePreview: "",
  });

  const [activeTab, setActiveTab] = useState("photo");
  const hasCompletedRef = useRef(false); // 🛑 prevent infinite loop

  // Notify parent when all biometrics are ready (but only once)
  useEffect(() => {
    const { photo, fingerprint, signature } = data;
    if (photo && fingerprint && signature && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete(data);
    }
  }, [data.photo, data.fingerprint, data.signature, onComplete]);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setData((prev) => ({
          ...prev,
          photo: file,
          photoPreview: imageSrc,
        }));
      });
  };

  const clearPhoto = () => {
    setData((prev) => ({
      ...prev,
      photo: null,
      photoPreview: "",
    }));
  };

  const handleFingerprintUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({
        ...prev,
        fingerprint: file,
        fingerprintPreview: URL.createObjectURL(file),
      }));
    }
  };

  const clearFingerprint = () => {
    setData((prev) => ({
      ...prev,
      fingerprint: null,
      fingerprintPreview: "",
    }));
    if (fingerprintInputRef.current) {
      fingerprintInputRef.current.value = null;
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({
        ...prev,
        signature: file,
        signaturePreview: URL.createObjectURL(file),
      }));
    }
  };

  const clearSignature = () => {
    setData((prev) => ({
      ...prev,
      signature: null,
      signaturePreview: "",
    }));
    if (signatureInputRef.current) {
      signatureInputRef.current.value = null;
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        {["photo", "fingerprint", "signature"].map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-4 py-2 rounded ${
              activeTab === type ? "bg-blue-700" : "bg-blue-500"
            } text-white`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Photo Capture */}
      {activeTab === "photo" && (
        <div className="mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="border rounded"
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={capturePhoto}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Capture Photo
            </button>
            <button
              onClick={clearPhoto}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Clear Photo
            </button>
          </div>
          {data.photoPreview && (
            <img
              src={data.photoPreview}
              alt="Photo Preview"
              className="mt-2"
              width={200}
            />
          )}
        </div>
      )}

      {/* Fingerprint Upload */}
      {activeTab === "fingerprint" && (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFingerprintUpload}
            ref={fingerprintInputRef}
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={clearFingerprint}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Clear Fingerprint
            </button>
          </div>
          {data.fingerprintPreview && (
            <img
              src={data.fingerprintPreview}
              alt="Fingerprint Preview"
              className="mt-2"
              width={200}
            />
          )}
        </div>
      )}

      {/* Signature Upload */}
      {activeTab === "signature" && (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleSignatureUpload}
            ref={signatureInputRef}
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={clearSignature}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Clear Signature
            </button>
          </div>
          {data.signaturePreview && (
            <img
              src={data.signaturePreview}
              alt="Signature Preview"
              className="mt-2"
              width={200}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BiometricCapture;

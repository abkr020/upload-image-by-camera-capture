import { useState } from "react";
import CameraCapture from "./CameraCapture";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    userName: "",
    aadharFrontPhoto: null,
    aadharBackPhoto: null,
  });

  // Handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files[0], // only first file
    }));
  };

  const handleCameraCapture = (fieldName, file) => {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { userName, aadharFrontPhoto, aadharBackPhoto } = formData;
    if (!userName || !aadharFrontPhoto || !aadharBackPhoto) {
      alert("All fields are required");
      return;
    }

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });

    for (let pair of formPayload.entries()) {
      console.log(pair[0], pair[1]);
    }

    console.log("FormData ready");
  };

  return (
    <div className="form-container">
      <h2>User KYC Form</h2>

      <form onSubmit={handleSubmit}>
        {/* User Name */}
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        {/* Aadhar Front */}
        <label>Aadhar Front</label>
        <input
          type="file"
          accept="image/*"
          name="aadharFrontPhoto"
          onChange={handleFileChange}
        />
        <CameraCapture
          label="Aadhar Front"
          name="aadharFrontPhoto"
          onCapture={handleCameraCapture}
        />

        {/* Aadhar Back */}
        <label>Aadhar Back</label>
        <input
          type="file"
          accept="image/*"
          name="aadharBackPhoto"
          onChange={handleFileChange}
        />
        <CameraCapture
          label="Aadhar Back"
          name="aadharBackPhoto"
          onCapture={handleCameraCapture}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;

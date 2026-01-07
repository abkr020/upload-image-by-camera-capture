import { useState } from "react";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.userName ||
      !formData.aadharFrontPhoto ||
      !formData.aadharBackPhoto
    ) {
      alert("All fields are required");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("userName", formData.userName);
    formPayload.append("aadharFrontPhoto", formData.aadharFrontPhoto);
    formPayload.append("aadharBackPhoto", formData.aadharBackPhoto);

    for (let [key, value] of formPayload.entries()) {
  console.log(key, value);
}

    console.log("FormData ready",formPayload);

    // fetch("/api/upload", {
    //   method: "POST",
    //   body: formPayload, // ✅ FormData
    // });
  };


  return (
    <div className="form-container">
      <h2>User KYC Form</h2>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="form-group">
          <label htmlFor="userName">User Name</label>
          <input
            id="userName"
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Aadhar Front */}
        <div className="form-group">
          <label htmlFor="aadharFrontPhoto">Aadhar Front Photo</label>
          <input
            id="aadharFrontPhoto"
            type="file"
            name="aadharFrontPhoto"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        {/* Aadhar Back */}
        <div className="form-group">
          <label htmlFor="aadharBackPhoto">Aadhar Back Photo</label>
          <input
            id="aadharBackPhoto"
            type="file"
            name="aadharBackPhoto"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;

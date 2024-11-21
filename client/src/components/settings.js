import axios from "axios";
import React, { useState } from "react";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");

  // Update API key
  const updateApiKey = () => {
    axios
      .post("http://localhost:8000/settings", { apiKey })
      .then(() => {
        alert("API Key updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating API Key:", error);
      });
  };

  return (
    <div>
      <h2>Bot Settings</h2>
      <div>
        <label>API Key: </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button onClick={updateApiKey}>Update</button>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from "react";

const SettingsPage = () => {
  const [idFormat, setIdFormat] = useState("");
  const [validationRules, setValidationRules] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle save logic here (e.g., send to backend)
    console.log("Saved Settings:", { idFormat, validationRules });
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Number Format
          </label>
          <input
            type="text"
            value={idFormat}
            onChange={(e) => setIdFormat(e.target.value)}
            placeholder="e.g., ID-####"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validation Rules
          </label>
          <textarea
            value={validationRules}
            onChange={(e) => setValidationRules(e.target.value)}
            placeholder="Describe your validation rules"
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;

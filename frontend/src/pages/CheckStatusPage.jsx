import React, { useState } from "react";
import axios from "axios";

const CheckStatusPage = () => {
  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setComplaint(null);

    try {
      const res = await axios.get(`/api/complaints/status/${trackingId}`);
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Complaint not found");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-semibold mb-4">Check Complaint Status</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-600"
          required
        />
        <button type="submit" className="p-2 bg-purple-600 rounded hover:bg-purple-700">
          Check Status
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {complaint && (
        <div className="mt-6 p-4 bg-gray-800 rounded w-full max-w-md">
          <h2 className="font-semibold text-lg mb-2">{complaint.title}</h2>
          <p><strong>Status:</strong> {complaint.status}</p>
          <p><strong>Category:</strong> {complaint.category}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Submitted By:</strong> {complaint.submittedBy?.name || "Anonymous"}</p>
          <p><strong>Submitted At:</strong> {new Date(complaint.submittedAt).toLocaleString()}</p>
          {complaint.resolutionDate && (
            <p><strong>Resolved At:</strong> {new Date(complaint.resolutionDate).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckStatusPage;

import React, { useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../../services/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ApplyToTeamModal = ({ teamId, onClose }) => {
  const { authState } = useContext(AuthContext);
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const address = getIpAddress();

  function getIpAddress() {
      const hostname = window.location.hostname;
      const indexOfColon = hostname.indexOf(':');
      return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://${address}:8080/student/apply`,
        {
          teamId,
          uid: authState.uid, // User ID from auth state
          role,
          reason,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      toast.success("Application submitted successfully!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply. Please try again.");
      console.error("Error applying to the team:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <>
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Apply to Team</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mt-2 mb-4"
            placeholder="Enter role (e.g., Developer, Designer)"
            required
          />

          <label className="block text-sm font-medium">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mt-2 mb-4"
            placeholder="Why do you want to join?"
            required
          />

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default ApplyToTeamModal;
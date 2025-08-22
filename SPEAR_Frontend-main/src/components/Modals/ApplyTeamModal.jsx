import React, { useState, useContext } from "react";
import AuthContext from "../../services/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ApplyTeamModal = ({ teamId, onClose }) => {
  const { authState } = useContext(AuthContext);
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!authState.uid) {
      toast.error("Error: User ID is missing. Please log in again.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(`http://${address}:8080/student/apply`, {
        teamId: teamId,
        uid: authState.uid,
        role: role,
        reason: reason,
      });
  
      if (response.status === 200) {
        toast.success("Application submitted successfully!");
        setTimeout(onClose, 1000);
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred while applying. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <ToastContainer position="top-right" autoClose={3000}/> 
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-teal font-semibold mb-4">Apply to Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 mb-4"
          >
            ✖
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Role Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Role</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Specify the role you are applying for."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          {/* Reason Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Reason</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 h-40 rounded-md"
              placeholder="Provide a brief statement on why you are interested. If you have a portfolio, please include a link."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Close
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition"
              disabled={loading}
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyTeamModal;

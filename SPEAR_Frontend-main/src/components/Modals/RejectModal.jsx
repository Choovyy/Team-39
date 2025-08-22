import React, { useState } from "react";

const RejectModal = ({ onClose, onSubmit, rejectReason, setRejectReason }) => {
  const [error, setError] = useState("");
  const [confirmReject, setConfirmReject] = useState(false); // New state for confirmation

  const handleSubmit = () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setConfirmReject(true); // Show confirmation message
  };

  const handleFinalReject = () => {
    onSubmit(); // Call the parent function to submit rejection
    setConfirmReject(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] animate-fadeIn z-50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Reject Application</h2>
        <button
         className="text-gray-500 hover:text-gray-700 mb-4"
          onClick={onClose}
          >
          ✖
          </button>
        </div>
        {/* Show Confirmation Prompt Instead */}
        {confirmReject ? (
          <>
            <p className="text-gray-800 font-medium text-lg">Are you sure you want to reject this application?</p>
            <p className="text-gray-600 text-sm">This action cannot be undone.</p>

            {/* Confirmation Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                onClick={() => setConfirmReject(false)}
              >
                Cancel
              </button>
              <button
                className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition"
                onClick={handleFinalReject}
              >
                Yes, Reject
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-3 font-medium">Reason for rejection:</p>

            {/* Rejection Input */}
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter the reason for rejection..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setError(""); // Clear error when typing
              }}
            ></textarea>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition"
                onClick={handleSubmit}
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RejectModal;
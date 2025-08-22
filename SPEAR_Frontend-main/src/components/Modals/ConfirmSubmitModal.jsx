import React from "react";

const ConfirmSubmitModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Submit Evaluation?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to submit your evaluation? You won’t be able to make changes afterward.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
           className="px-4 py-2 text-sm text-white rounded bg-[#323c47] hover:bg-gray-900 transition"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubmitModal;

import React, { useState } from "react";
import { toast } from "react-toastify";

const JoinClassModal = ({ isOpen, onClose, onEnroll }) => {
  const [classCode, setClassCode] = useState(""); // State to store the class code
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null; // Don't render the modal if it's not open

  // Handle the input change
  const handleInputChange = (event) => {
    setClassCode(event.target.value);
  };

  // Handle enrollment
  const handleEnrollClick = async (e) => {
    e.preventDefault();
    if (!classCode) {
      toast.error("Please enter a valid class key.");
      return;
    }

    setLoading(true);
    try {
      await onEnroll(classCode); // Call the enroll function passed as a prop
      setClassCode(""); // Clear input after successful enrollment
      onClose(); // Close modal after enrollment
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll in the class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl relative p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Join Class</h2>
        <p>Please fill in the details to join the class.</p>
        <form className="mt-4" onSubmit={handleEnrollClick}>
          <input
            type="text"
            placeholder="Enter Class Code"
            value={classCode}
            onChange={handleInputChange}
            className="border rounded-lg p-2 w-full mb-4"
          />
          <button
            type="submit"
            className={`bg-teal text-white rounded-lg p-2 w-full ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClassModal;

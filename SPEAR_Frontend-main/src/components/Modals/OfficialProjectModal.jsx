import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AuthContext from "../../services/AuthContext";

const OfficialProjectModal = ({ isOpen, onClose, teamId }) => {
  const { getDecryptedId, authState } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(""); // Input rating state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // Success/Error message state

  const address = window.location.hostname;
  const userId = getDecryptedId("uid"); // Explicitly pass "uid"


  useEffect(() => {
    if (!isOpen || !teamId) return;

    const fetchOfficialProject = async () => {
      try {
        const response = await axios.get(`http://${address}:8080/team/${teamId}/official-project`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setProject(response.data);
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOfficialProject();
  }, [isOpen, teamId]);

  const handleRatingSubmit = async () => {
    // Validate rating format (must be a number with up to 2 decimal places)
    if (!rating.match(/^\d(\.\d{1,2})?$/)) {
      setMessage({ type: "error", text: "Invalid rating format. Must be a number (e.g., 1, 2.5, 4.0, 5)." });
      return;
    }
  
    const numericRating = parseFloat(rating);
    
    // Ensure the rating is between 1 and 5
    if (numericRating < 1 || numericRating > 5) {
      setMessage({ type: "error", text: "Rating must be between 1 and 5." });
      return;
    }
  
    // Ensure userId exists
    if (!userId) {
      setMessage({ type: "error", text: "User ID is missing. Please log in again." });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const requestBody = {
        userId: userId,  
        rating: numericRating.toString() // Ensure rating is stored as a valid number string
      };
  
      const response = await axios.put(
        `http://${address}:8080/teacher/rate-project/${project.projectId}`,
        requestBody,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
  
      setMessage({ type: "success", text: "Project rated successfully!" });
      setProject((prev) => ({ ...prev, rating: numericRating })); // Update displayed rating
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Failed to submit rating." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Official Project Details</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="text-lg font-semibold">Project Name: {project.projectName}</p>
            <p className="text-gray-700 mb-2">Description: {project.description}</p>
            <h3 className="mt-4 text-md font-semibold">Objectives:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {project.features.length > 0 ? (
                project.features.map((feature, index) => (
                  <li key={index}>
                    <strong>{feature.featureTitle}:</strong> {feature.featureDescription}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No objectives listed.</p>
              )}
            </ul>
            <br />
            <p className="text-sm font-medium">Status: <span className="font-bold">{project.status}</span></p>
            <p className="text-sm font-medium">Adviser: <span className="font-bold">{project.adviserName}</span></p>

           

            {/* Success/Error Message */}
            {message && (
              <p className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {message.text}
              </p>
            )}
          </>
        )}
        <div className="mt-4 flex justify-end">
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficialProjectModal;
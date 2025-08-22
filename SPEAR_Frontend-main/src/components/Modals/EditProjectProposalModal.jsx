import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../services/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProjectProposalModal = ({ isOpen, proposalId, onClose, refreshProposals }) => {
  const { authState } = useContext(AuthContext);
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [projectNameError, setProjectNameError] = useState("");
  
  // Character limit states
  const [charCount, setCharCount] = useState({
    projectName: 0,
    description: 0,
    featureTitles: {},
    featureDescriptions: {}
  });
  
  // Character limits constants
  const CHAR_LIMITS = {
    projectName: 50,
    description: 150,
    featureTitle: 50,
    featureDescription: 150
  };
  
  const address = window.location.hostname;

  useEffect(() => {
    if (isOpen && proposalId) {
      fetchProposalDetails();
    }
  }, [isOpen, proposalId]);

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const response = await axios.get(`http://${address}:8080/proposals/${proposalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = {
        projectName: response.data.projectName || "",
        description: response.data.description || "",
        features: response.data.features || [],
      };
      
      setProposalData(data);
      
      // Initialize character counts
      setCharCount({
        projectName: data.projectName.length,
        description: data.description.length,
        featureTitles: data.features.reduce((acc, feature, index) => {
          acc[index] = feature.featureTitle.length;
          return acc;
        }, {}),
        featureDescriptions: data.features.reduce((acc, feature, index) => {
          acc[index] = feature.featureDescription.length;
          return acc;
        }, {})
      });
      
    } catch (error) {
      setErrorMessage("Failed to load proposal data. Please try again.");
      console.error("Error fetching proposal:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update character count
    setCharCount(prev => ({
      ...prev,
      [name]: value.length
    }));
    
    // Enforce character limits
    if (CHAR_LIMITS[name] && value.length <= CHAR_LIMITS[name]) {
      setProposalData({ ...proposalData, [name]: value });
    } else if (CHAR_LIMITS[name]) {
      // If over limit, truncate the input
      setProposalData({ 
        ...proposalData, 
        [name]: value.slice(0, CHAR_LIMITS[name]) 
      });
      setCharCount(prev => ({
        ...prev,
        [name]: CHAR_LIMITS[name]
      }));
    } else {
      // For inputs without character limits
      setProposalData({ ...proposalData, [name]: value });
    }
    
    // Clear project name error if user is typing
    if (name === "projectName" && value.trim() !== "") {
      setProjectNameError("");
    }
  };

  const handleFeatureChange = (index, field, value) => {
    const fieldKey = field === "featureTitle" ? "featureTitles" : "featureDescriptions";
    const charLimit = CHAR_LIMITS[field];
    
    // Update character count
    setCharCount(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        [index]: value.length
      }
    }));
    
    // Enforce character limits
    if (value.length <= charLimit) {
      setProposalData((prev) => {
        const updatedFeatures = [...prev.features];
        updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
        return { ...prev, features: updatedFeatures };
      });
    } else {
      // If over limit, truncate the input
      setProposalData((prev) => {
        const updatedFeatures = [...prev.features];
        updatedFeatures[index] = { 
          ...updatedFeatures[index], 
          [field]: value.slice(0, charLimit) 
        };
        return { ...prev, features: updatedFeatures };
      });
      
      setCharCount(prev => ({
        ...prev,
        [fieldKey]: {
          ...prev[fieldKey],
          [index]: charLimit
        }
      }));
    }
  };

  const handleAddFeature = () => {
    const newIndex = proposalData.features.length;
    
    setProposalData((prev) => ({
      ...prev,
      features: [...prev.features, { featureTitle: "", featureDescription: "" }],
    }));
    
    // Initialize character count for new feature
    setCharCount(prev => ({
      ...prev,
      featureTitles: {
        ...prev.featureTitles,
        [newIndex]: 0
      },
      featureDescriptions: {
        ...prev.featureDescriptions,
        [newIndex]: 0
      }
    }));
  };

  const handleRemoveFeature = (index) => {
    setProposalData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
    
    // Update character counts after removal
    setCharCount(prev => {
      const updatedTitles = { ...prev.featureTitles };
      const updatedDescriptions = { ...prev.featureDescriptions };
      
      delete updatedTitles[index];
      delete updatedDescriptions[index];
      
      // Reindex remaining features
      const reindexedTitles = {};
      const reindexedDescriptions = {};
      
      Object.keys(updatedTitles).forEach(key => {
        const numKey = parseInt(key, 10);
        if (numKey > index) {
          reindexedTitles[numKey - 1] = updatedTitles[key];
        } else {
          reindexedTitles[numKey] = updatedTitles[key];
        }
      });
      
      Object.keys(updatedDescriptions).forEach(key => {
        const numKey = parseInt(key, 10);
        if (numKey > index) {
          reindexedDescriptions[numKey - 1] = updatedDescriptions[key];
        } else {
          reindexedDescriptions[numKey] = updatedDescriptions[key];
        }
      });
      
      return {
        ...prev,
        featureTitles: reindexedTitles,
        featureDescriptions: reindexedDescriptions
      };
    });
  };

  const handleUpdateProposal = async () => {
    if (!proposalData.projectName.trim()) {
      setProjectNameError("Project name is required!"); 
      return; 
    }
    try {
        const token = authState.token;
        if (!token) throw new Error("No auth token");

        const payload = {
            userId: parseInt(authState.uid, 10),
            projectName: proposalData.projectName,
            description: proposalData.description,
            features: proposalData.features.map(f => ({
                featureTitle: f.featureTitle,
                featureDescription: f.featureDescription,
            })),
        };

        const proposalIdInt = parseInt(proposalId, 10);

        await axios.put(
            `http://${address}:8080/student/update-proposal/${proposalIdInt}`,
            payload,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        toast.success("Proposal updated successfully!");
        setTimeout(() => {
          refreshProposals();
          onClose();
      }, 1000);
      
    } catch (error) {
        console.error("Error updating proposal:", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to update proposal.");
    }
};

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 sm:p-0">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-full sm:max-w-3xl md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Proposal</h2>
        <button
                className="text-gray-500 hover:text-gray-700"
                onClick={onClose}
              >
                ✖
              </button>
              </div>
        {loading ? (
          <p className="text-gray-600">Loading proposal data...</p>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <>
           <div className="flex items-center justify-between mt-4">
             <label className="block text-sm font-medium">Project Name</label>
             <span className={`text-xs ${charCount.projectName >= CHAR_LIMITS.projectName ? 'text-red-500' : 'text-gray-500'}`}>
               {charCount.projectName}/{CHAR_LIMITS.projectName}
             </span>
           </div>
            <input
              type="text"
              name="projectName"
              value={proposalData.projectName}
              onChange={handleChange}
              maxLength={CHAR_LIMITS.projectName}
              className={`w-full p-2 border rounded-md mb-4 ${
                projectNameError ? 'border-red-500' : ''
              }`}
            />
            {projectNameError && (
              <span className="text-red-500 text-xs">{projectNameError}</span>
            )}

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Description</label>
              <span className={`text-xs ${charCount.description >= CHAR_LIMITS.description ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount.description}/{CHAR_LIMITS.description}
              </span>
            </div>
            <textarea
              name="description"
              value={proposalData.description}
              onChange={handleChange}
              maxLength={CHAR_LIMITS.description}
              className={`w-full p-2 border rounded-md mb-5 ${
                charCount.description >= CHAR_LIMITS.description ? 'border-red-500' : ''
              }`}
              rows="4"
            ></textarea>

            <div className="mb-4">
              <label className="block text-sm font-medium">Features</label>
            </div>
            
            {proposalData.features.map((feature, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-start mb-2">
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700 mr-2 mt-1"
                  >
                    ✖
                  </button>
                  <div className="flex-1">
                    <div className="font-medium">Feature {index + 1}</div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <label className="block text-sm">Title</label>
                      <span className={`text-xs ${charCount.featureTitles[index] >= CHAR_LIMITS.featureTitle ? 'text-red-500' : 'text-gray-500'}`}>
                        {charCount.featureTitles[index] || 0}/{CHAR_LIMITS.featureTitle}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={feature.featureTitle}
                      onChange={(e) => handleFeatureChange(index, "featureTitle", e.target.value)}
                      maxLength={CHAR_LIMITS.featureTitle}
                      className={`w-full p-2 border rounded-md mb-2 ${
                        charCount.featureTitles[index] >= CHAR_LIMITS.featureTitle ? 'border-red-500' : ''
                      }`}
                    />
                    
                    <div className="flex items-center justify-between">
                      <label className="block text-sm">Description</label>
                      <span className={`text-xs ${charCount.featureDescriptions[index] >= CHAR_LIMITS.featureDescription ? 'text-red-500' : 'text-gray-500'}`}>
                        {charCount.featureDescriptions[index] || 0}/{CHAR_LIMITS.featureDescription}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={feature.featureDescription}
                      onChange={(e) => handleFeatureChange(index, "featureDescription", e.target.value)}
                      maxLength={CHAR_LIMITS.featureDescription}
                      className={`w-full p-2 border rounded-md ${
                        charCount.featureDescriptions[index] >= CHAR_LIMITS.featureDescription ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleAddFeature}
              className="text-green-500 font-medium py-2 px-4 rounded-md border border-green-500 hover:bg-green-50 transition mb-4"
            >
              + Add feature
            </button>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition font-medium"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition font-medium"
                onClick={handleUpdateProposal}
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default EditProjectProposalModal;
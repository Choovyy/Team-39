import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Trash2 } from "lucide-react"

const ProjectProposalPage = () => {
  const { authState, getDecryptedId } = useContext(AuthContext);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectOverview, setProjectOverview] = useState("");
  const [features, setFeatures] = useState([{ title: "", description: "" }]);
  const navigate = useNavigate();
  
  // Get the required IDs
  const storedClassId = getDecryptedId("cid");
  const teamId = getDecryptedId("tid"); // Get the Team ID
  
  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storedClassId) {
      toast.error("Class ID not found. Please return to the class page and try again.");
      return;
    }

    const proposalData = {
      proposedById: parseInt(authState.uid, 10),
      projectName: projectTitle.trim(),
      description: projectOverview.trim(),
      classId: parseInt(storedClassId, 10),
      teamId: teamId ? parseInt(teamId, 10) : null, // Include team ID if available
      features: features
        .filter((feature) => feature.title.trim() && feature.description.trim())
        .map((feature) => ({
          featureTitle: feature.title.trim(),
          featureDescription: feature.description.trim(),
        })),
    };

    console.log("Submitting Proposal Data:", proposalData);

    try {
      const response = await axios.post(
        `http://${address}:8080/student/create-proposal`,
        proposalData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      toast.success("Proposal submitted successfully!");
      navigate("/student/view-project-proposal");
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error(error.response?.data?.message || "Failed to submit the proposal.");
    }
  };

  const handleAddFeature = () => {
    setFeatures([...features, { title: "", description: "" }]);
  };

  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="p-8 bg-white shadow-md rounded-md w-full">
      <button
          onClick={() => navigate(-1)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 hover:bg-gray-500 transition"
        >
          Back
        </button>
        <h1 className="text-3xl font-semibold my-6">Propose New Project</h1>
        <p className="mb-8 text-muted-foreground">
        Please provide details about your project below.
        </p>

        
      
        <form className="space-y-10" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-semibold font-medium text-teal">
              Project Title
            </label>
            <input
              type="text"
              maxLength={50}
              className="block w-full border border-gray-300 rounded-md p-3 mt-1.5"
              placeholder="Enter your project title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />
            <div className="text-sm text-gray-500 mt-1 text-right">
              {projectTitle.length}/50 characters
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold font-medium text-teal">
              Project Overview
            </label>
            <textarea
              rows="4"
              maxLength={150}
              className="block w-full border border-gray-300 rounded-md p-3 mt-1.5"
              placeholder="Provide an overview of your project"
              value={projectOverview}
              onChange={(e) => setProjectOverview(e.target.value)}
              required
            ></textarea>
            <div className="text-sm text-gray-500 mt-1 text-right">
              {projectOverview.length}/150 characters
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-teal mb-4">Objectives</h3>
            <button
              type="button"
              onClick={handleAddFeature}
              className="bg-green-500 text-white px-4 py-3 rounded-lg mb-4 hover:bg-green-700 transition"
            >
              + Add Objective
            </button>
            </div>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 sm:flex-1">
                      <input
                        type="text"
                        maxLength={50}
                        placeholder="Enter an Objective"
                        className="w-full border border-gray-300 rounded-md p-3"
                        value={feature.title}
                        onChange={(e) => {
                          const updatedFeatures = [...features];
                          updatedFeatures[index].title = e.target.value;
                          setFeatures(updatedFeatures);
                        }}
                      />
                      <div className="text-sm text-gray-500 mt-1 text-right">
                        {feature.title.length}/50 characters
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-1">
                      <input
                        type="text"
                        maxLength={150}
                        placeholder="Describe this objective"
                        className="w-full border border-gray-300 rounded-md p-3"
                        value={feature.description}
                        onChange={(e) => {
                          const updatedFeatures = [...features];
                          updatedFeatures[index].description = e.target.value;
                          setFeatures(updatedFeatures);
                        }}
                      />
                      <div className="text-sm text-gray-500 mt-1 text-right">
                        {feature.description.length}/150 characters
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-500 border border-red-500 px-4 py-3 rounded-md hover:bg-red-500 hover:text-white transition flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-500 transition"
          >
            Submit Proposal
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectProposalPage;
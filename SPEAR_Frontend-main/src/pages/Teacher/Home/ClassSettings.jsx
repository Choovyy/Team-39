import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClassSettings = () => {
  const navigate = useNavigate();
  const { authState, getDecryptedId } = useContext(AuthContext);
  const [classData, setClassData] = useState({
    courseDescription: "",
    courseCode: "",
    section: "",
    schoolYear: "",
    semester: "",
    maxTeamSize: 5,
    needsAdvisory: true,
  });
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); 


  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    const fetchClassData = async () => {
      const classId = getDecryptedId("cid");
      if (!classId) return console.error("Class ID is missing.");

      try {
        const { data } = await axios.get(
          `http://${address}:8080/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
          }
        );
        setClassData(data);
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };

    fetchClassData();
  }, [authState.token, getDecryptedId]);

  const handleUpdateClass = async (event) => {
    if (event) event.preventDefault();

    const classId = getDecryptedId("cid");
    if (!classId) return console.error("Class ID is missing.");

    // Validate section format
    const sectionPattern = /^[a-zA-Z0-9-_]+$/;
    if (!sectionPattern.test(classData.section)) {
      setError(
        "Invalid section format. Use only letters, numbers, '-' or '_'."
      );
      return;
    }

    try {
      const response = await axios.put(
        `http://${address}:8080/teacher/updateClass/${classId}`,
        classData,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
            "Content-Type": "application/json",
          },
        }
      );
    
      if (response.data.statusCode === 200) {
        toast.success("Class updated successfully!");
        navigate(`/class-settings`);
      } else {
        toast.error(response.data.message || "Failed to update class.");
      }
    } catch (error) {
      const res = error.response;
    
      if (res?.status === 409) {
        alert(res.data.message); // Backend sends a list of team names that violate maxTeamSize
      } else {
        console.error("Error updating class:", error);
        toast.error("Failed to update class. Please try again.");
      }
    }
  };

  const handleDeleteClass = async () => {
    const classId = getDecryptedId("cid");
    if (!classId) return console.error("Class ID is missing.");

    try {
      const { data } = await axios.delete(
        `http://${address}:8080/teacher/deleteClass/${classId}`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      if (data.statusCode === 200) {
        toast.success("Class deleted successfully!");
        navigate("/teacher-dashboard");
      } else {
        toast.error(data.message || "Failed to delete class.");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "section") {
      // Validate section field in real-time
      const sectionPattern = /^[a-zA-Z0-9-_]*$/;
      if (!sectionPattern.test(value)) {
        setError(
          "Invalid section format. Use only letters, numbers, '-' or '_'."
        );
      } else {
        setError(null);
      }
    }

    setClassData({ ...classData, [id]: value });
  };

  const handleConfirm = async () => {
    if (confirmAction === "update") {
      await handleUpdateClass();
    } else if (confirmAction === "delete") {
      await handleDeleteClass();
    }
    setShowConfirmModal(false); 
  };
  
  return (
<>
<ToastContainer position="top-right" autoClose={3000} />
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar />

      <div className="main-content bg-white text-teal px-4 sm:px-6 md:px-20 lg:px-28 pt-8 md:pt-12">
        {/* Header */}
        <div className="header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-lg font-semibold">Class Settings</h1>
          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach transition-all duration-300 w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-gray-100 shadow-md rounded-lg p-6">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleUpdateClass}
          >
            {/* Course Description */}
            <div>
              <label
                htmlFor="courseDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Course Description
              </label>
              <input
                type="text"
                id="courseDescription"
                value={classData.courseDescription}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>

            {/* Course Code */}
            <div>
              <label
                htmlFor="courseCode"
                className="block text-sm font-medium text-gray-700"
              >
                Course Code
              </label>
              <input
                type="text"
                id="courseCode"
                value={classData.courseCode}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>

            {/* Section */}
            <div>
              <label
                htmlFor="section"
                className="block text-sm font-medium text-gray-700"
              >
                Section
              </label>
              <input
                type="text"
                id="section"
                value={classData.section}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* School Year */}
            <div>
              <label
                htmlFor="schoolYear"
                className="block text-sm font-medium text-gray-700"
              >
                School Year
              </label>
              <input
                type="text"
                id="schoolYear"
                value={classData.schoolYear}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>

            {/* Semester */}
            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700"
              >
                Semester
              </label>
              <input
                type="text"
                id="semester"
                value={classData.semester}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>

            {/* Max Team Size */}
            <div>
              <label
                htmlFor="maxTeamSize"
                className="block text-sm font-medium text-gray-700"
              >
                Max Team Size
              </label>
              <input
                type="number"
                id="maxTeamSize"
                min="1"
                max="20"
                value={classData.maxTeamSize}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>

            {/* Advisory Toggle */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Class Needs Advisory?
              </label>
              <div
                onClick={() =>
                  setClassData((prev) => ({
                    ...prev,
                    needsAdvisory: !prev.needsAdvisory,
                  }))
                }
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  classData.needsAdvisory ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
                    classData.needsAdvisory ? "translate-x-6" : ""
                  }`}
                ></div>
              </div>
              <span className="text-sm mt-1 text-gray-700">
                {classData.needsAdvisory
                  ? "This class requires advisory."
                  : "No advisory needed."}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <button
              type="button"
              onClick={() => {
              setConfirmAction("update");
              setShowConfirmModal(true);
             }}
                className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-peach transition-all duration-300 w-full sm:w-auto"
              >
                Update Class
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmAction("delete");
                  setShowConfirmModal(true);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 w-full sm:w-auto"
              >
                Delete Class
              </button>
            </div>
          </form>
        </div>
        {showConfirmModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-11/12 sm:w-auto max-w-md">
    <div className="flex items-center justify-between">
      <h2 className="text-xl text-teal font-semibold mb-2">
        {confirmAction === "update"
          ? "Save Changes"
          : "You're about to delete this class!"}
      </h2>
      <button
              className="text-gray-500 hover:text-gray-700 mb-4"
              onClick={() => setShowConfirmModal(false)}
            >
              ✖
            </button>
      </div>
      <p>
      {confirmAction === "update"
          ? "Are you sure you want to update the class details?"
          : "Are you sure you want to delete this class? This action cannot be undone."}
      </p>
      <div className="flex justify-end space-x-2 mt-4">
      <button
          onClick={() => setShowConfirmModal(false)}
          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="bg-teal text-white px-4 py-2 rounded hover:bg-peach transition-all"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
    </>
  );
};

export default ClassSettings;

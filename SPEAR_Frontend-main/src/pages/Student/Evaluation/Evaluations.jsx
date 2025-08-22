import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import { Eye , ChevronLeft, ChevronRight } from "lucide-react"

const Evaluations = () => {
  const { getDecryptedId, storeEncryptedId } = useContext(AuthContext);
  const studentId = getDecryptedId("uid"); // Get student ID from AuthContext
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const evaluationsPerPage = 10;


  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const getEvaluationTypeLabel = (type) => {
    const typeMapping = {
      STUDENT_TO_STUDENT: "Team Evaluation",
      STUDENT_TO_ADVISER: "Adviser Evaluation",
    };
    return typeMapping[type] || type.replace(/_/g, " ");
  };

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!studentId) {
        setError("User ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://${address}:8080/student/${studentId}/available-evaluations`
        );
        setEvaluations(response.data);
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        setError("Failed to fetch evaluations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [studentId]);

  const handleViewStatus = async (evaluationId, classId, evaluationType) => {
    storeEncryptedId("cid", classId);
    storeEncryptedId("eid", evaluationId);
  
    if (evaluationType === "STUDENT_TO_ADVISER") {
      try {
        const response = await axios.get(
          `http://${address}:8080/evaluation/${studentId}/class/${classId}/adviser`
        );
  
        if (response.data) {
          storeEncryptedId("adviserId", response.data.adviserId);
          storeEncryptedId("adviserName", response.data.adviserName);
          navigate("/student/student-teacher-status"); // Redirect to teacher evaluation page
        } else {
          alert("No adviser found for this evaluation.");
        }
      } catch (error) {
        console.error("Error fetching adviser:", error);
        alert("Failed to fetch adviser details.");
      }
    } else {
      navigate("/student/evaluation-status"); // Default route for team evaluations
    }
  };

const totalPages = Math.ceil(evaluations.length / evaluationsPerPage);
const startIndex = (currentPage - 1) * evaluationsPerPage;
const currentEvaluations = evaluations.slice(startIndex, startIndex + evaluationsPerPage);


  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen bg-white">
      <Navbar userRole="STUDENT" />
      <div className="p-8 bg-white shadow-md rounded-md w-full">
        <h1 className="text-3xl font-bold text-teal mb-6 pt-8">Available Evaluations</h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500">Loading evaluations...</div>
        ) : evaluations.length === 0 ? (
          <div className="text-center text-gray-500">No open evaluations available.</div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden rounded-lg">
            <div className="min-w-[800px]">
            <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden table-fixed">
              <thead className="bg-gray-700 text-white text-center">
                <tr>
                  <th className="border p-3 text-center font-semibold w-1/6">Evaluation Type</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Course Description</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Period</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Date Open</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Date Close</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Availability</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {currentEvaluations.map((evalItem, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100 transition-colors">
                    <td className="border border-gray-300 p-3 text-center">{getEvaluationTypeLabel(evalItem.evaluationType)}</td>
                    <td className="border border-gray-300 p-3 text-center">{evalItem.courseDescription || "N/A"}</td>
                    <td className="border border-gray-300 p-3 text-center">{evalItem.period || "N/A"}</td>
                    <td className="border border-gray-300 p-3 text-center">{evalItem.dateOpen || "N/A"}</td>
                    <td className="border border-gray-300 p-3 text-center">{evalItem.dateClose || "N/A"}</td>
                    <td className="border border-gray-300 p-3 text-center">
                    <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                    evalItem.availability === "Open" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                   >
                {evalItem.availability || "N/A"}
                </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <button
                        className="border border-gray-300 text-black px-3 py-1 rounded-lg hover:bg-gray-200 transition"
                        onClick={() => handleViewStatus(evalItem.eid, evalItem.classId, evalItem.evaluationType)}
                      >
                        <Eye className="h-4 w-4 inline mr-1" />  
                        View Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="flex justify-center items-center mt-3 space-x-2">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="text-gray-700 px-1 py-1 rounded-lg flex items-center opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
  >
    <ChevronLeft />
    Previous
  </button>

  <span className="text-base font-medium">Page {currentPage} of {totalPages}</span>

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="text-gray-700 px-1 py-1 rounded-lg flex items-center opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
  >
    Next
    <ChevronRight />
  </button>
</div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Evaluations;
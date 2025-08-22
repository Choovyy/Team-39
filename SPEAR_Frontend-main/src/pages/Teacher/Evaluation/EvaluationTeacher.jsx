import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";

const EvaluationTeacher = () => {
  const { getDecryptedId, storeEncryptedId } = useContext(AuthContext);
  const teacherId = getDecryptedId("uid"); // Get logged-in teacher ID
  const [evaluations, setEvaluations] = useState([]);
  const [submissions, setSubmissions] = useState([]); // New state for submissions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);
  const [teamDetailsMap, setTeamDetailsMap] = useState({});

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const fetchEvaluations = async () => {
    if (!teacherId) {
      setError("User ID is missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://${address}:8080/teacher/${teacherId}/available-evaluations`
      );

      const filteredEvaluations = response.data.filter(
        (evaluation) => evaluation.evaluationType === "ADVISER_TO_STUDENT"
      );

      setEvaluations(filteredEvaluations);
    } catch (error) {
      console.error("Error fetching advisory teams:", error);
      setError("Failed to fetch advisory teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetailsByAdviser = async () => {
    try {
      const response = await axios.get(`http://${address}:8080/teacher/teams/adviser/${teacherId}`);
      const detailsMap = {};
      response.data.forEach(team => {
        detailsMap[team.groupName] = team;
      });
      setTeamDetailsMap(detailsMap);
    } catch (err) {
      console.error("Failed to fetch team details:", err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
        `http://${address}:8080/submissions/by-evaluator/${teacherId}`
      );
      // Make sure we're getting valid data and log it
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    fetchEvaluations();
    fetchTeamDetailsByAdviser();
    fetchSubmissions(); // Fetch submissions when component loads
  }, [teacherId]);

  const handleEvaluateTeam = (teamId, classId, eid) => {
    if (!eid) {
      alert("Evaluation ID is missing.");
      return;
    }

    // Only proceed if not already submitted
    if (!hasSubmitted(eid)) {
      storeEncryptedId("tid", teamId);
      storeEncryptedId("cid", classId);
      storeEncryptedId("eid", eid);
      navigate("/teacher/adviser-evaluation");
    }
  };

 // Fix the hasSubmitted function to properly compare numeric IDs
const hasSubmitted = (evaluationId) => {
  // Convert IDs to numbers for comparison to avoid type mismatches
  const numericEvalId = Number(evaluationId);
  const numericTeacherId = Number(teacherId);
  
  return submissions.some(sub => {
    const submissionEvalId = Number(sub.evaluationId);
    const submissionTeacherId = Number(sub.evaluatorId);
    
    return submissionEvalId === numericEvalId && submissionTeacherId === numericTeacherId;
  });
};


const checkSubmissionStatus = (evaluationId) => {
  const numericEvalId = Number(evaluationId);
  const numericTeacherId = Number(teacherId);
  
  const submission = submissions.find(sub => {
    const submissionEvalId = Number(sub.evaluationId);
    const submissionTeacherId = Number(sub.evaluatorId);
    
    return submissionEvalId === numericEvalId && submissionTeacherId === numericTeacherId;
  });
  
  return submission ? (submission.status === "Submitted" ? "Submitted" : "Not Submitted") : "Not Submitted";
};

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="TEACHER" />

      <div className="p-4 sm:p-6 md:p-8 bg-white shadow-md rounded-md w-full">
        <h1 className="text-lg sm:text-xl font-semibold text-teal text-center mb-6">
          Advisory Teams
        </h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500">
            Loading advisory teams...
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center text-gray-500">
            No advisory teams available.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full text-sm sm:text-base border border-gray-300">
              <thead className="sticky top-0 bg-[#323c47] text-white shadow-md text-xs sm:text-sm">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                    Course Description
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                    Period
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                    Date Open
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                    Date Close
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                    Availability
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                    Submission Status
                  </th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">
                  </th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evalItem, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2">{evalItem.courseDescription}</td>
                      <td className="px-3 sm:px-4 py-2">{evalItem.period}</td>
                      <td className="px-3 sm:px-4 py-2">{evalItem.dateOpen}</td>
                      <td className="px-3 sm:px-4 py-2">{evalItem.dateClose}</td>
                      <td className="px-3 sm:px-4 py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                            evalItem.availability === "Open"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {evalItem.availability}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                            checkSubmissionStatus(evalItem.eid) === "Submitted"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {checkSubmissionStatus(evalItem.eid)}
                        </span>
                      </td>
                      <td className="px-4 py-3 border">
                      <button
                          className={`px-4 py-2 rounded-md transition w-full ${
                            hasSubmitted(evalItem.eid) || evalItem.availability !== "Open"
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : "bg-[#323c47] hover:bg-gray-900 text-white"
                          }`}
                          onClick={() =>
                            handleEvaluateTeam(
                              teamDetailsMap[evalItem.teamName]?.tid,
                              evalItem.classId,                      
                              evalItem.eid                
                            )
                          }
                          disabled={hasSubmitted(evalItem.eid) || evalItem.availability !== "Open"}
                        >
                          {hasSubmitted(evalItem.eid) ? "Submitted" : "Evaluate Teams"}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === index && (
                      <tr className="bg-gray-50">
                        <td colSpan="8" className="px-4 py-4 text-sm text-gray-700">
                          {teamDetailsMap[evalItem.teamName] ? (
                            <div className="space-y-3">
                              <p><strong>Project Name:</strong> {teamDetailsMap[evalItem.teamName].projectName}</p>
                              <p><strong>Project Description:</strong> {teamDetailsMap[evalItem.teamName].projectDescription}</p>
                              <p><strong>Leader:</strong> {teamDetailsMap[evalItem.teamName].leaderName}</p>

                              <div>
                                <strong>Members:</strong>
                                <ul className="list-disc list-inside ml-4">
                                  {teamDetailsMap[evalItem.teamName].memberNames.map((name, i) => (
                                    <li key={i}>{name}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <strong>Features:</strong>
                                <ul className="list-disc list-inside ml-4">
                                  {teamDetailsMap[evalItem.teamName].features.map((f, i) => (
                                    <li key={i}>
                                      <span className="font-medium">{f.featureTitle}:</span> {f.featureDescription}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500">Loading team details...</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationTeacher;
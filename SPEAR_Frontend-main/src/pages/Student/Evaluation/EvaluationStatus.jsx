import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import { format } from "date-fns";

const EvaluationStatus = () => {
  const { getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();

  const classId = getDecryptedId("cid");
  const studentId = parseInt(getDecryptedId("uid"), 10);  

  const [team, setTeam] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const address = window.location.hostname;

  useEffect(() => {
    if (!classId || !studentId) {
      setError("Missing class ID or user ID.");
      setLoading(false);
      return;
    }
    fetchTeamDetails();
    fetchSubmissions();
  }, []);

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(`http://${address}:8080/evaluation/${studentId}/class/${classId}/team`);
      const members = response.data.memberNames || [];
      const sortedMembers = members.filter((m) => m === studentId).concat(members.filter((m) => m !== studentId));
      setTeam(sortedMembers);
    } catch (error) {
      console.error("Error fetching team details:", error);
      setError("Failed to load team details.");
    } finally {
      setLoading(false);
    }
  };

  const hasSubmitted = () => {
    if (submissions.length === 0) return false; 
    return submissions.some(sub => sub.evaluatorId === studentId);
};

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`http://${address}:8080/submissions/by-evaluation/${getDecryptedId("eid")}`);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const getSubmissionDateByName = (memberName) => {
    const submission = submissions.find(sub => sub.evaluatorName === memberName);
    if (!submission) return "Not Yet Submitted";
    return format(new Date(submission.submittedAt), "MMM d, yyyy - h:mm a");
  };

  const getStatusByName = (memberName) => {
    const submission = submissions.find(sub => sub.evaluatorName === memberName);
    if (!submission) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold inline-block bg-yellow-500 text-white">
          INC
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-semibold inline-block bg-green-500 text-white">
        Completed
      </span>
    );
  };

  const handleEvaluate = () => {
    navigate("/student/student-evaluation");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="STUDENT" />
      <div className="p-8 bg-white shadow-md rounded-md w-full">

        <div className="flex justify-between mb-6">
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-5 pt-8">Evaluation Team Tracker</h1>
          <button
          className={`px-4 py-2 rounded-md transition ${
            hasSubmitted() ? "bg-gray-400 cursor-not-allowed" : "bg-[#323c47] hover:bg-gray-900 text-white"
          }`}
          onClick={() => {
            if (!hasSubmitted()) navigate("/student/student-evaluation");
          }}
          disabled={hasSubmitted()}
        >
          Evaluate
        </button>
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500">Loading team details...</div>
        ) : (
          <div className="overflow-y-auto max-h-96 rounded-lg shadow-md">
            <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden table-fixed">
              <thead className="bg-gray-700 text-white text-center">
                <tr>
                  <th className="border p-3 text-center font-semibold w-1/6">Member Name</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Date Submitted</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {team.map((member, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100 transition-colors">
                    <td className={`border border-gray-300 p-3 text-center ${member === studentId ? "font-bold text-blue-600" : ""}`}>
                      {member === studentId ? `${member} (You)` : member}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">{getSubmissionDateByName(member)}</td>
                    <td className="border border-gray-300 p-3 text-center">{getStatusByName(member)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationStatus;
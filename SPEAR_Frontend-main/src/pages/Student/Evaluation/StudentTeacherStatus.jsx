import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import { format } from "date-fns";

const StudentTeacherStatus = () => {
  const { getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();

  const classId = getDecryptedId("cid");
  const studentId = parseInt(getDecryptedId("uid"), 10);
  const evaluationId = parseInt(getDecryptedId("eid"), 10);

  const [adviserName, setAdviserName] = useState("");
  const [memberNames, setMemberNames] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const address = window.location.hostname;

  useEffect(() => {
    fetchTeamData();
    fetchSubmissions();
  }, []);

  const fetchTeamData = async () => {
    try {
        const teamRes = await axios.get(`http://${address}:8080/evaluation/${studentId}/class/${classId}/team`);
        const teamId = teamRes.data.tid;  // Use 'tid' here instead of 'teamId'

        const res = await axios.get(`http://${address}:8080/team/${teamId}/members-and-adviser`);
        setAdviserName(res.data.adviserName || "Unknown Adviser");
        setMemberNames(res.data.memberNames || []);
    } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch team or adviser details.");
    } finally {
        setLoading(false);
    }
};

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`http://${address}:8080/submissions/by-evaluation/${evaluationId}`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const hasSubmitted = () => {
    return submissions.some((s) => s.evaluatorId === studentId);
  };

  const getSubmissionDate = (name) => {
    const sub = submissions.find((s) => s.evaluatorName === name);
    return sub ? format(new Date(sub.submittedAt), "MMM d, yyyy - h:mm a") : "Not Yet Submitted";
  };

  const getStatusBadge = (name) => {
    const sub = submissions.find((s) => s.evaluatorName === name);
    return sub ? (
      <span className="px-3 py-1 rounded-full text-sm font-semibold inline-block bg-green-500 text-white">
        Completed
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-sm font-semibold inline-block bg-yellow-500 text-white">
        INC
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="STUDENT" />
      <div className="p-8 bg-white w-full">
        <div className="flex justify-between mb-6">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 pt-8">Adviser & Team Evaluation Tracker</h1>
          <button
            className={`px-4 py-2 rounded-md transition ${
              hasSubmitted() ? "bg-gray-400 cursor-not-allowed" : "bg-[#323c47] hover:bg-gray-900 text-white"
            }`}
            onClick={() => !hasSubmitted() && navigate("/student/student-teacher-evaluation")}
            disabled={hasSubmitted()}
          >
            Evaluate
          </button>
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500">Loading details...</div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-md font-semibold text-gray-700 mb-2">Adviser</h2>
              <div className="border border-gray-300 p-4 rounded bg-gray-50 font-semibold text-blue-700 shadow-sm">
                {adviserName}
              </div>
            </div>

            <h2 className="text-md font-semibold text-gray-700 mb-2">Team Members</h2>
            <div className="overflow-y-auto max-h-96 rounded-lg shadow-md">
              <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-700 text-white text-center">
                  <tr>
                    <th className="border p-3 text-center font-semibold w-1/3">Member Name</th>
                    <th className="border p-3 text-center font-semibold w-1/3">Date Submitted</th>
                    <th className="border p-3 text-center font-semibold w-1/3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {memberNames.length > 0 ? (
                    memberNames.map((name, i) => (
                      <tr key={i} className="border-b hover:bg-gray-100 transition-colors">
                        <td className="border border-gray-300 p-3 text-center">
                          {name.includes(getDecryptedId("fullName")) ? `${name} (You)` : name}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">{getSubmissionDate(name)}</td>
                        <td className="border border-gray-300 p-3 text-center">{getStatusBadge(name)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">
                        No members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentTeacherStatus;
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import ViewProposalAdviserModal from "../../../components/Modals/ViewProposalsAdviserModal";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherAdvisories = () => {
  const { authState, storeEncryptedId } = useContext(AuthContext);
  const [advisoryTeams, setAdvisoryTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showDropModal, setShowDropModal] = useState(false);
  const [dropTeamId, setDropTeamId] = useState(null);
  const [dropReason, setDropReason] = useState("");
  const { getDecryptedId } = useContext(AuthContext);

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    const fetchAdvisoryTeams = async () => {
      if (!authState.uid) {
        console.error("Adviser ID is missing. Ensure you are logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://${address}:8080/teacher/teams/adviser/${authState.uid}`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
          }
        );

        if (response.status === 200) {
          setAdvisoryTeams(response.data);
        }
      } catch (error) {
        console.error("Error fetching advisory teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisoryTeams();
  }, [authState]);

  const handleViewProposals = (teamId) => {
    storeEncryptedId("tid", teamId);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-teal">Loading advisories...</p>
      </div>
    );
  }

  const openDropModal = (teamId) => {
    setDropTeamId(teamId);
    setDropReason("");
    setShowDropModal(true);
  };

  const submitDropTeam = async () => {
    if (!dropTeamId || !dropReason.trim()) {
      return toast.error("Please provide a reason.");
    }

    try {
      const decryptedAdviserId = getDecryptedId("uid");

      const res = await axios.post(
        `http://${address}:8080/adviser-drop/team/${dropTeamId}`,
        {
          adviserId: decryptedAdviserId,
          reason: dropReason.trim(),
        }
      );

      toast.success(res.data.message || "Team adviser and schedule dropped successfully.");
      setAdvisoryTeams((prev) =>
        prev.filter((team) => team.tid !== dropTeamId)
      );
    } catch (err) {
      console.error("Error dropping adviser:", err);
      toast.error(err.response?.data?.error || "Failed to drop adviser.");
    } finally {
      setShowDropModal(false);
      setDropReason("");
      setDropTeamId(null);
    }
  };

  return (
   <>
   <ToastContainer position="top-right" autoClose={3000} />
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState?.role} />

      <div className="main-content bg-white text-gray-900 p-4 sm:p-6 md:px-20 lg:px-28 pt-8 md:pt-12">
        {/* Back Button */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          My Advisories
        </h1>

        <div className="flex justify-end mb-6">
          <button
            className="bg-[#323c47] text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
            onClick={() => navigate("/teacher/advisory-request")}
          >
            Teams Advisory Requests
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto rounded-lg shadow-md">
          {advisoryTeams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-lg shadow-md">
                <thead className="sticky top-0 bg-teal text-white z-20 shadow-lg">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Group Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Leader
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {advisoryTeams.map((team) => (
                    <tr key={team.tid} className="hover:bg-gray-100">
                      {/* Group Name */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.groupName}
                      </td>

                      {/* Leader Name */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.leaderName || "N/A"}
                      </td>

                      {/* Members (Bullet List) */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.memberNames.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {team.memberNames.map((member, index) => (
                              <li key={index}>{member}</li>
                            ))}
                          </ul>
                        ) : (
                          "No Members"
                        )}
                      </td>

                      {/* Course Description */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.courseDescription || "No Course Info"}
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="font-semibold">
                          {team.scheduleDay}
                        </span>{" "}
                        <br />
                        {team.scheduleTime}
                      </td>

                      {/* View proposals and drop team */}
                      <td className="px-6 py-4 text-sm text-gray-900 space-y-2">
                        <button
                          className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-all block w-full"
                          onClick={() => handleViewProposals(team.tid)}
                        >
                          View Proposals
                        </button>

                        <button
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-all block w-full"
                          onClick={() => openDropModal(team.tid)}
                        >
                          Drop Team
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No advisories assigned.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ViewProposalAdviserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {showDropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-md p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowDropModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Drop Team</h2>
            <p className="mb-2 text-gray-700">
              Please provide a reason for dropping this team:
            </p>
            <textarea
              value={dropReason}
              onChange={(e) => setDropReason(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Type reason here..."
            />
            <button
              onClick={submitDropTeam}
              disabled={!dropReason.trim()}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Confirm Drop
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default TeacherAdvisories;

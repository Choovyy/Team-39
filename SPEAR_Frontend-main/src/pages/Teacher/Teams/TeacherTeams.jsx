import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import OfficialProjectModal from "../../../components/Modals/OfficialProjectModal";
import axios from "axios";
import { Eye } from "lucide-react"

const TeacherTeams = () => {
  const { authState, getDecryptedId, storeEncryptedId } =
    useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const navigate = useNavigate();

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    const fetchTeamsByClass = async () => {
      const classId = getDecryptedId("cid");
      if (!classId) {
        console.error("Class ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://${address}:8080/teams/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
          }
        );

        setTeams(response.data || []);
      } catch (error) {
        console.error("Error fetching teams data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsByClass();
  }, [authState, getDecryptedId]);

  const handleViewProject = (teamId, projectId) => {
    if (!teamId) {
      console.error("Invalid team ID.");
      return;
    }

    // Store encrypted team ID
    storeEncryptedId("tid", teamId);

    // Store encrypted project ID only if it exists
    if (projectId) {
      storeEncryptedId("pid", projectId);
    }

    setSelectedTeamId(teamId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeamId(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-teal">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState?.role} />

      <div className="main-content bg-white text-gray-900 px-4 sm:px-6 md:px-20 lg:px-28 pt-6 sm:pt-8 md:pt-12">
        {/* Back Button */}
        <div className="flex justify-start mb-4">
          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white mb-4 w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Teams
        </h1>

        <div className="overflow-x-auto overflow-y-auto rounded-lg shadow-md">
          {teams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
                      Recruitment Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Adviser & Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {teams.map((team) => (
                    <tr key={team.tid} className="hover:bg-gray-100">
                      {/* Group Name */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.groupName}
                      </td>

                      {/* Leader Name */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.leaderName || "N/A"}
                      </td>

                      {/* Members */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {team.memberNames.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {team.memberNames.map((member, index) => (
                              <li key={index}>{member}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No Members</p>
                        )}
                      </td>

                      {/* Recruitment Status */}
                      <td className="px-6 py-4 text-sm font-bold">
                        <span
                          className={`px-3 py-1 rounded-lg ${
                            team.recruitmentOpen
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {team.recruitmentOpen ? "Open" : "Closed"}
                        </span>
                      </td>

                      {/* Adviser & Schedule */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <p className="font-semibold">
                          {team.adviserName || "No Adviser Assigned"}
                        </p>
                        <p>
                          {team.scheduleDay !== "No Day Set"
                            ? `${team.scheduleDay}`
                            : "No Schedule"}
                        </p>
                        <p>
                          {team.scheduleTime !== "No Time Set"
                            ? `${team.scheduleTime}`
                            : ""}
                        </p>
                      </td>

                      {/* View Details Button */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          className="border border-gray-300 text-black px-3 py-1 rounded-lg hover:bg-gray-200 transition"
                          onClick={() =>
                            handleViewProject(team.tid, team.projectId)
                          }
                        >
                          <Eye className="h-4 w-4 inline mr-1" />  
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No teams available for this class.</p>
          )}
        </div>
      </div>

      <OfficialProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        teamId={selectedTeamId}
      />
    </div>
  );
};

export default TeacherTeams;

import React, { useEffect, useState, useContext } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../services/AuthContext";
import ApplyTeamModal from "../../../components/Modals/ApplyTeamModal";
import axios from "axios";
import { Check } from "lucide-react";

const ApplyTeam = () => {
  const { authState, getDecryptedId } = useContext(AuthContext);
  const [openTeams, setOpenTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();

  const address = getIpAddress();

  // Decrypt the class ID (cid) or fall back to authState.classId
  const classId = (() => {
    try {
      const raw = getDecryptedId("cid");
      return raw ? Number(JSON.parse(raw)) : authState.classId;
    } catch {
      return authState.classId;
    }
  })();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const idx = hostname.indexOf(":");
    return idx !== -1 ? hostname.substring(0, idx) : hostname;
  }

  useEffect(() => {
    const fetchOpenTeams = async () => {
      setLoading(true);
      try {
        // Use the class-scoped endpoint
        const url = `http://${address}:8080/teams/class/${classId}/open-for-recruitment`;
        const response = await axios.get(url);
        if (response.status === 200 && response.data) {
          setOpenTeams(response.data);
        }
      } catch (error) {
        console.error("Error fetching open teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenTeams();
  }, [address, classId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-teal">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-gray-900 md:px-20 lg:px-28 pt-8 md:pt-12 flex flex-col min-h-screen">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Back
          </button>
        </div>

        {/* Header */}
        <div className="header mb-8">
          <h1 className="text-3xl font-bold text-gray-700">Apply Team</h1>
          <p className="text-lg font-semibold text-gray-600 mt-2">
            Open Teams for Recruitment
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-700 text-center">
              <tr className="bg-teal-600 text-white">
                <th className="border border-gray-300 px-6 py-3">Team Name</th>
                <th className="border border-gray-300 px-6 py-3">Leader</th>
                <th className="border border-gray-300 px-6 py-3">Members</th>
                <th className="border border-gray-300 px-6 py-3">Project Name</th>
                <th className="border border-gray-300 px-6 py-3">Description</th>
                <th className="border border-gray-300 px-6 py-3"> </th>
              </tr>
            </thead>
            <tbody className="text-center">
              {openTeams.length > 0 ? (
                openTeams.map((team) => (
                  <tr key={team.tid} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-6 py-3 text-gray-900">
                      {team.groupName}
                    </td>
                    <td className="border border-gray-300 px-6 py-3 text-gray-900">
                      {team.leaderName}
                    </td>
                    <td className="border border-gray-300 px-6 py-3 text-gray-900">
                      {team.memberIds
                        ? `${team.memberIds.length}/${team.maxMembers || "N/A"}`
                        : `0/${team.maxMembers || "N/A"}`}
                    </td>
                    <td className="border border-gray-300 px-6 py-3 text-gray-900">
                      {team.projectName || "No Project Assigned"}
                    </td>
                    <td className="border border-gray-300 px-6 py-3 text-gray-900">
                      {team.projectDescription || "No Description Available"}
                    </td>
                    <td className="border border-gray-300 px-6 py-3 text-center">
                      <button
                        className="bg-white border border-green-500 px-4 py-2 rounded-lg hover:bg-green-100 transition-all flex items-center space-x-2 group"
                        onClick={() => setSelectedTeam(team.tid)}
                      >
                        <Check className="h-4 w-4 text-green-500 group-hover:text-gray-800 transition-colors" />
                        <span className="text-green-500 group-hover:text-gray-800 transition-colors">
                          Apply Team
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center border border-gray-300 px-6 py-3 text-gray-900"
                  >
                    No open teams available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      {selectedTeam && (
        <ApplyTeamModal
          teamId={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
};

export default ApplyTeam;
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../services/AuthContext";
import Navbar from "../../../components/Navbar/Navbar";
import EditProjectProposalModal from "../../../components/Modals/EditProjectProposalModal";
import axios from "axios";
import { Pencil, BadgeX, BadgeCheck, Trash2, PackageOpen, Crown, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProjectProposal = () => {
  const { authState, getDecryptedId, storeEncryptedId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teamProposals, setTeamProposals] = useState([]);
  const [openProposals, setOpenProposals] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [officialProjectId, setOfficialProjectId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeTab, setActiveTab] = useState("team");

  const openEditModal = (proposalId) => {
    storeEncryptedId("pid", proposalId);
    setSelectedProposalId(proposalId);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    localStorage.removeItem("pid");
    setIsEditModalOpen(false);
    setSelectedProposalId(null);
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 rounded-full text-white text-sm font-semibold";

    switch (status) {
      case "APPROVED":
        return <span className={`${baseClass} bg-green-500`}>Approved</span>;
      case "DENIED":
        return <span className={`${baseClass} bg-red-500`}>Denied</span>;
      case "PENDING":
        return <span className={`${baseClass} bg-yellow-500`}>Pending</span>;
      case "OPEN":
        return <span className={`${baseClass} bg-purple-500`}>Open</span>;
      default:
        return <span className={`${baseClass} bg-gray-500`}>{status}</span>;
    }
  };

  const address = window.location.hostname;

  const classId = getDecryptedId("cid");
  const teamId = getDecryptedId("tid");

  useEffect(() => {
    if (authState.uid && teamId) {
      fetchTeamProposals();
    }
  }, [authState.uid, teamId]);

  useEffect(() => {
    if (authState.uid && classId) {
      fetchOpenProposals();
    }
  }, [authState.uid, classId]);

  const fetchTeamProposals = async () => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const response = await axios.get(`http://${address}:8080/proposals/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeamProposals(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error("Error fetching team proposals:", error.response?.data || error.message);
    }
  };

  const fetchOpenProposals = async () => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const response = await axios.get(`http://${address}:8080/proposals/class/${classId}/open-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpenProposals(response.data || []);
    } catch (error) {
      console.error("Error fetching open proposals:", error.response?.data || error.message);
    }
  };

  const handleDeleteProposal = async (proposalId) => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const userId = authState.uid;
      await axios.delete(`http://${address}:8080/student/delete-proposal/${proposalId}`, {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Proposal deleted successfully");
      fetchTeamProposals();
    } catch (error) {
      console.error("Error deleting proposal:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to delete proposal.");
    }
  };

  const handleSetToOpenProject = async (proposalId) => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const userId = authState.uid;
      await axios.put(`http://${address}:8080/student/set-to-open-project/${proposalId}`, null, {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Proposal set to Open Project successfully");
      fetchTeamProposals();
      window.location.reload();
    } catch (error) {
      console.error("Error setting proposal to Open Project:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to set proposal to Open Project.");
    }
  };

  const handleTakeOwnership = async (proposalId) => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const userId = authState.uid;
      await axios.put(`http://${address}:8080/student/take-ownership/${proposalId}?userId=${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("You have successfully claimed and accepted this project.");
      fetchOpenProposals();
      window.location.reload();
    } catch (error) {
      console.error("Error taking ownership of project:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to claim project.");
    }
  };

  const fetchOfficialProject = async () => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      const response = await axios.get(`http://${address}:8080/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.projectId) {
        setOfficialProjectId(response.data.projectId);
      } else {
        setOfficialProjectId(null); // No official project assigned
      }
    } catch (error) {
      console.error("Error fetching official project:", error.response?.data || error.message);
      setOfficialProjectId(null);
    }
  };

  useEffect(() => {
    if (authState.uid && teamId) {
      fetchOfficialProject();
    }
  }, [authState.uid, teamId]);

  const handleSetOfficialProject = async (proposalId) => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      await axios.put(`http://${address}:8080/team/set-official/${teamId}`, null, {
        params: { proposalId, leaderId: authState.uid },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Project successfully set as the official project!");
      fetchOfficialProject(); // Refresh after setting
    } catch (error) {
      console.error("Error setting official project:", error.response?.data || error.message);
      
      toast.error(error.response?.data?.error || "Failed to set official project.");
    }
  };

  const handleUnsetOfficialProject = async () => {
    try {
      const token = authState.token;
      if (!token) throw new Error("No auth token");

      await axios.put(`http://${address}:8080/team/unset-official/${teamId}`, null, {
        params: { leaderId: authState.uid },
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Official project removed successfully");
      fetchOfficialProject(); // Refresh after unsetting
    } catch (error) {
      console.error("Error unsetting official project:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to remove official project.");
    }
  };

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-700 text-xl font-semibold">Confirmation</h2>
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              ✖
            </button>
          </div>
          <p className="text-gray-600 mt-4">{message}</p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
              onClick={onClose}
            >
              Cancel
            </button>
                          <button
                className="bg-[#323c47] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
                onClick={onConfirm}
              >
                Confirm
              </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
        <Navbar userRole={authState.role} />

        <div className="p-8 bg-white shadow-md w-full">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition"
          >
            Back
          </button>
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Project Proposals</h1>
            <button
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-500 transition flex items-center space-x-2"
              onClick={() => navigate(`/student/project-proposal`)}
            >
              <Plus className="h-4 w-4" />
              <span>Create Proposal</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="inline-flex bg-gray-100 p-1 rounded-lg">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  activeTab === "team"
                    ? "bg-white shadow text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("team")}
              >
                Team Proposals
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition ml-1 ${
                  activeTab === "suggested"
                    ? "bg-white shadow text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("suggested")}
              >
                Suggested Proposals
              </button>
            </div>
          </div>

          {activeTab === "team" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">My Team Proposals</h2>
                <p className="text-sm text-gray-500">Review and manage project proposals from your team.</p>
              </div>
              
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-700 text-white">
                    <tr>
                      <th className="p-3 text-left text-sm font-semibold">Project Name</th>
                      <th className="p-3 text-left text-sm font-semibold">Description</th>
                      <th className="p-3 text-left text-sm font-semibold">Objectives</th>
                      <th className="p-3 text-left text-sm font-semibold">Proposed By</th>
                      <th className="p-3 text-left text-sm font-semibold">Status</th>
                      <th className="p-3 text-left text-sm font-semibold">Reason</th>
                      <th className="p-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 divide-y divide-gray-200">
                    {teamProposals.length > 0 ? (
                      teamProposals.map((proposal) => (
                        <tr
                          key={proposal.pid}
                          className={`hover:bg-gray-50 transition-colors ${
                            proposal.pid === officialProjectId ? "bg-gray-100 text-gray-900" : ""
                          }`}
                        >
                          <td className="p-3 text-sm">
                            {proposal.projectName}{" "}
                            {proposal.pid === officialProjectId && (
                              <span className="text-xs font-medium text-gray-500">(Official Project)</span>
                            )}
                          </td>
                          <td className="p-3 text-sm">{proposal.description}</td>
                          <td className="p-3 text-sm">
                            {proposal.features?.length > 0 ? (
                              <ul className="list-disc pl-5">
                                {proposal.features.map((f, i) => (
                                  <li key={i} className="whitespace-normal mb-1">
                                    {f.featureTitle} - {f.featureDescription}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              "No Objectives"
                            )}
                          </td>
                          <td className="p-3 text-sm">{proposal.proposedByName}</td>
                          <td className="p-3 text-sm">
                            <div className="flex flex-col items-start gap-2">
                              {getStatusBadge(proposal.status)}
                              {proposal.pid === officialProjectId && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white mt-1">
                                  Official
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm">{proposal.reason || "No reason provided"}</td>
                          <td className="p-3">
                            <div className="flex flex-col gap-2">
                              <button
                                className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition flex items-center space-x-1 text-sm"
                                onClick={() => openEditModal(proposal.pid)}
                              >
                                <Pencil className="h-3 w-3 text-cyan-500" />
                                <span className="text-cyan-500">Edit</span>
                              </button>

                              {proposal.pid !== officialProjectId ? (
                                <button
                                  className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition flex items-center space-x-1 text-sm"
                                  onClick={() => {
                                    setModalMessage("Are you sure you want to set this project as the official project?");
                                    setConfirmAction(() => () => handleSetOfficialProject(proposal.pid));
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <BadgeCheck className="h-3 w-3 text-green-500" />
                                  <span className="text-green-500">Set Official</span>
                                </button>
                              ) : (
                                <button
                                  className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition flex items-center space-x-1 text-sm"
                                  onClick={() => {
                                    setModalMessage("Are you sure you want to unset this project as the official project?");
                                    setConfirmAction(() => handleUnsetOfficialProject);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <BadgeX className="h-3 w-3 text-red-500" />
                                  <span className="text-red-500">Unset Official</span>
                                </button>
                              )}

                              {proposal.pid !== officialProjectId && (
                                <>
                                  <button
                                    className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition flex items-center space-x-1 text-sm"
                                    onClick={() => {
                                      setModalMessage("Are you sure you want to delete this project?");
                                      setConfirmAction(() => () => handleDeleteProposal(proposal.pid));
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                    <span className="text-red-500">Delete</span>
                                  </button>
                                  <button
                                    className="bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition flex items-center space-x-1 text-sm"
                                    onClick={() => {
                                      setModalMessage("Are you sure you want to give this project?");
                                      setConfirmAction(() => () => handleSetToOpenProject(proposal.pid));
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    <PackageOpen className="h-3 w-3 text-violet-500" />
                                    <span className="text-violet-500">Give Project</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-500">
                          No project proposals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "suggested" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Suggested Project Proposals</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Explore abandoned projects available for reassignment and ownership.
                </p>
              </div>
              
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-700 text-white">
                    <tr>
                      <th className="p-3 text-left text-sm font-semibold w-1/4">Project Name</th>
                      <th className="p-3 text-left text-sm font-semibold w-1/4">Description</th>
                      <th className="p-3 text-left text-sm font-semibold w-1/3">Objectives</th>
                      <th className="p-3 text-left text-sm font-semibold w-1/6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 divide-y divide-gray-200">
                    {openProposals.length > 0 ? (
                      openProposals.map((proposal) => (
                        <tr key={proposal.pid} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-sm">{proposal.projectName}</td>
                          <td className="p-3 text-sm">{proposal.description}</td>
                          <td className="p-3 text-sm">
                            {proposal.features?.length > 0 ? (
                              <ul className="list-disc pl-5">
                                {proposal.features.map((f, i) => (
                                  <li key={i} className="mb-1">
                                    {f.featureTitle} - {f.featureDescription || "No description provided"}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              "No objectives"
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition"
                              onClick={() => {
                                setModalMessage("Are you sure you want to take ownership of this project?");
                                setConfirmAction(() => () => handleTakeOwnership(proposal.pid));
                                setIsModalOpen(true);
                              }}
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              Take Over
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500">
                          No open project proposals available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            if (confirmAction) confirmAction();
            setIsModalOpen(false);
          }}
          message={modalMessage}
        />
      )}

      <EditProjectProposalModal
        proposalId={selectedProposalId}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        refreshProposals={fetchTeamProposals}
      />
    </>
  );
};

export default ViewProjectProposal;
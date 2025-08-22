import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeft, ChevronRight , Check, X  } from "lucide-react"

const ProjectProposals = () => {
  const { authState, getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [error, setError] = useState("");

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login");
      return;
    }

    const cid = getDecryptedId("cid");
    if (!cid) {
      console.error(
        "Class ID is not available. Please navigate to a class page first."
      );
      setLoading(false);
      return;
    }
    setClassId(cid);

    const fetchProposals = async () => {
      try {
        const { data } = await axios.get(
          `http://${address}:8080/teacher/proposals/${cid}`, // Fixed API endpoint
          { headers: { Authorization: `Bearer ${authState.token}` } }
        );
        setProposals(data || []);
      } catch (error) {
        console.error("Error fetching project proposals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [authState, navigate, getDecryptedId]);

  const handleApprove = async (proposalId) => {
    const proposal = proposals.find((p) => p.pid === proposalId);
    if (proposal?.status === "APPROVED") {
      toast.error("This proposal is already approved.");
      return;
    }

    try {
      await axios.put(
        `http://${address}:8080/teacher/status-proposal/${proposalId}`,
        { status: "APPROVED", reason: null },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      toast.success("Proposal approved successfully.");
      setProposals((prev) =>
        prev.map((p) =>
          p.pid === proposalId ? { ...p, status: "APPROVED", reason: null } : p
        )
      );
    } catch (error) {
      console.error("Error approving proposal:", error);
    }
  };

  const handleReject = async () => {
    const proposal = proposals.find((p) => p.pid === selectedProposalId);
    if (proposal?.status === "DENIED") {
      toast.error("This proposal has already been rejected.");
      return;
    }

    try {
      await axios.put(
        `http://${address}:8080/teacher/status-proposal/${selectedProposalId}`,
        { status: "DENIED", reason: rejectReason },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      toast.success("Proposal rejected successfully.");
      setProposals((prev) =>
        prev.map((p) =>
          p.pid === selectedProposalId
            ? { ...p, status: "DENIED", reason: rejectReason }
            : p
        )
      );
      setShowModal(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting proposal:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-teal">Loading...</p>
      </div>
    );
  }

  return (
<>
<ToastContainer position="top-right" autoClose={3000} />
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-teal md:px-20 lg:px-28 pt-8 md:pt-12 font-medium">
        {/* Back Button */}
        <div className="flex justify-start mb-4">
          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <h1 className="text-lg sm:text-2xl font-semibold mb-6 text-center text-teal">
          Project Proposals
        </h1>

        {/* Proposals Table */}
        <div className="overflow-x-auto overflow-y-hidden rounded-lg shadow-md">
          {proposals.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="sticky top-0 bg-teal text-white z-20 shadow-lg">
                <tr className="bg-teal-500 text-white">
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Team Name
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Project Name
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Description
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Features
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Created By
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Reason
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-white">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr key={proposal.pid}>
                    {/* Team Name */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.teamName || "N/A"}
                    </td>

                    {/* Project Name */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.projectName}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.description}
                    </td>

                    {/* Features */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.features.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {proposal.features.map((feature, index) => (
                            <li key={index}>
                              <strong>{feature.featureTitle}:</strong>{" "}
                              {feature.featureDescription}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No features"
                      )}
                    </td>

                    {/* Created By */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.proposedByName || "N/A"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.status}
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-900">
                      {proposal.reason || "N/A"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 sm:px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        {/* Approve Button */}
                        <button
                        onClick={() => handleApprove(proposal.pid)}
                        disabled={proposal.status === "OPEN"}
                        className={`border border-green-500 px-2 py-1 rounded-lg transition-all flex items-center space-x-2 group 
                          ${
                            proposal.status === "OPEN"
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white hover:bg-green-100"
                          }`}
                      >
                        <Check className="h-4 w-4 text-green-500 group-hover:text-gray-800 transition-colors" />
                        <span className="text-green-500 group-hover:text-gray-800 transition-colors">Approve</span>
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => {
                          setSelectedProposalId(proposal.pid);
                          setShowModal(true);
                        }}
                        disabled={proposal.status === "OPEN"}
                        className={`border border-red-500 px-2 py-1 rounded-lg transition-all flex items-center space-x-2 group ${
                          proposal.status === "OPEN"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white hover:bg-red-100"
                        }`}
                      >
                        <X className="h-4 w-4 text-red-500 group-hover:text-gray-800 transition-colors" />
                        <span className="text-red-500 group-hover:text-gray-800 transition-colors">Reject</span>
                      </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">
              No project proposals available.
            </p>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-[90%] sm:w-[550px] animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center text-gray-800">
              Reason for Rejection
            </h2>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 mb-4"
            >
              ✖
            </button>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              placeholder="Enter reason for rejection..."
            ></textarea>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition"
                onClick={handleReject}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ProjectProposals;

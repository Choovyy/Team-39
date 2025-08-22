import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import { FiX } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherAdvisoryRequest = () => {
  const { authState } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declineModal, setDeclineModal] = useState(null); // holds requestId
  const [declineReason, setDeclineReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const address = window.location.hostname;

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const statusParam =
        statusFilter === "ALL" ? "all-requests" : `requests/${statusFilter}`;
      const res = await axios.get(
        `http://${address}:8080/adviser/${authState.uid}/${statusParam}`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );
      setRequests(res.data || []);
    } catch (error) {
      console.error("Failed to fetch advisory requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        `http://${address}:8080/advisory-requests/${requestId}/accept`
      );
      toast.success("Request accepted");
      fetchRequests();
    } catch (err) {
      console.error("Accept error:", err);
      toast.error("Failed to accept request.");
    }
  };

  const handleDecline = async () => {
    try {
      await axios.post(
        `http://${address}:8080/advisory-requests/${declineModal}/decline`,
        { reason: declineReason }
      );
      toast.success("Request declined.");
      setDeclineModal(null);
      setDeclineReason("");
      fetchRequests();
    } catch (err) {
      console.error("Decline error:", err);
      toast.error("Failed to decline request.");
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const [hour, minute] = timeStr.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
  };

  const filteredRequests =
    statusFilter === "ALL"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const handleApproveLeave = async (requestId) => {
    try {
      await axios.post(
        `http://${address}:8080/advisory-requests/${requestId}/handle-leave`,
        {
          approve: true,
        }
      );
      toast.success("Adviser dropped. Team is now unassigned.");
      fetchRequests();
    } catch (err) {
      console.error("Error dropping team:", err);
      toast.error("Failed to drop adviser and schedule.");
    }
  };

  const handleDeclineLeave = async (requestId) => {
    try {
      await axios.post(
        `http://${address}:8080/advisory-requests/${requestId}/handle-leave`,
        {
          approve: false,
          reason: "Leave request denied. Adviser remains assigned.",
        }
      );
      toast.success("Leave request rejected. Adviser remains.");
      fetchRequests();
    } catch (err) {
      console.error("Error declining leave:", err);
      toast.error("Failed to decline leave request.");
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await axios.delete(
        `http://${address}:8080/advisory-requests/${requestId}`
      );
      toast.success("Request deleted successfully.");
      fetchRequests();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete request.");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex bg-white min-h-screen">
        {/* Sidebar Navigation */}
        <Navbar userRole={authState?.role} />

        {/* Main Content - adjusted with margin to avoid sidebar overlap */}
        <div className="flex-1 ml-[250px] p-6">
          <button
            onClick={() => window.history.back()}
            className="mb-6 bg-[#323c47] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Back
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Team Advisory Requests
          </h1>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
              <button
                key={status}
                className={`px-6 py-2 rounded-md ${
                  statusFilter === status
                    ? "bg-[#323c47] text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-400">No requests found.</p>
          ) : (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-[#323c47] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Class Description</th>
                    <th className="px-4 py-3 text-left">Group Name</th>
                    <th className="px-4 py-3 text-left">Leader</th>
                    <th className="px-4 py-3 text-left">Members</th>
                    <th className="px-4 py-3 text-left">Schedule</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.requestId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{req.classDescription}</td>
                      <td className="px-4 py-3">{req.groupName}</td>
                      <td className="px-4 py-3">{req.leaderName}</td>
                      <td className="px-4 py-3">
                        <ul className="list-disc ml-4">
                          {req.memberNames.map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3">
                        {req.scheduleDay} -{" "}
                        {formatTime(req.scheduleTime?.split(" - ")[0])} -{" "}
                        {formatTime(req.scheduleTime?.split(" - ")[1])}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            req.status === "PENDING"
                              ? "bg-yellow-500 text-white"
                              : req.status === "ACCEPTED"
                              ? "bg-green-600 text-white"
                              : req.status === "REJECTED"
                              ? "bg-red-500 text-white"
                              : req.status === "REQUEST_TO_LEAVE"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-400 text-white"
                          }`}
                        >
                          {req.status === "REQUEST_TO_LEAVE"
                            ? "Request to Leave"
                            : req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{req.reason || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {req.status === "PENDING" && (
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                              onClick={() => handleAccept(req.requestId)}
                            >
                              Accept
                            </button>
                            <button
                              className="border border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition"
                              onClick={() => setDeclineModal(req.requestId)}
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {req.status === "REQUEST_TO_LEAVE" && (
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-orange-600 text-white px-3 py-2 rounded-md hover:bg-orange-700"
                              onClick={() => handleApproveLeave(req.requestId)}
                            >
                              Drop Team
                            </button>
                            <button
                              className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                              onClick={() => handleDeclineLeave(req.requestId)}
                            >
                              Decline Leave
                            </button>
                          </div>
                        )}

                        {["REJECTED", "DROP"].includes(req.status) && (
                          <button
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            onClick={() => handleDelete(req.requestId)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Decline Reason Modal */}
          {declineModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md relative">
                <button
                  onClick={() => setDeclineModal(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                  <FiX size={20} />
                </button>
                <h2 className="text-lg font-semibold mb-4">Reason for Decline</h2>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 rounded-md p-2 mb-4"
                  placeholder="Enter your reason here..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
                <button
                  onClick={handleDecline}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Submit Decline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherAdvisoryRequest;
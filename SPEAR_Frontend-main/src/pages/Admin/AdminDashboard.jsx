import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header";
import axios from "axios";

const getStatusBadge = (status) => {
  const baseClass = "px-3 py-1 rounded-full text-white text-sm font-semibold"; 

  switch (status) {
    case "APPROVED":
      return <span className={`${baseClass} bg-green-500`}>Approved</span>;
    case "DENIED":
      return <span className={`${baseClass} bg-red-500`}>Denied</span>;
    case "OPEN":
      return <span className={`${baseClass} bg-purple-500`}>Open</span>;
    default:
      return <span className={`${baseClass} bg-gray-500`}>{status}</span>;
  }
};

const AdminDashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState("approved"); // Default status filter
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); 

  const address = getIpAddress();

  function getIpAddress() {
      const hostname = window.location.hostname;
      const indexOfColon = hostname.indexOf(':');
      return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  // Fetch proposals by status
  const fetchProposals = async (selectedStatus) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`http://${address}:8080/proposals/status/${selectedStatus}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProposals(response.data || []);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      toast.error("Failed to load proposals. Please try again.");
      setError(err.message || "Failed to load proposals.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProposals(status);
  }, [status]);

  return (
<div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
  <Navbar userRole={"ADMIN"} />
  <div className="main-content bg-white text-teal p-11">
    {/* Header Section */}
    <div className="header flex justify-between items-center mb-6">
      <h1 className="text-lg font-semibold">Welcome, Admin</h1>
      <Header />
    </div>

    {/* Filter by Status Section */}
    <div className="flex justify-between items-center mb-4">
      <label htmlFor="statusFilter" className="font-medium text-gray-700">
        Filter by Status:
      </label>
      <select
        id="statusFilter"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-gray-300 rounded-md px-4 py-2 bg-white"
      >
        <option value="open">Open</option>
        <option value="approved">Approved</option>
        <option value="denied">Denied</option>
      </select>
    </div>

    {/* Conditional Content (Loading, Error, Proposals) */}
    {isLoading ? (
      <p className="text-center text-gray-500">Loading proposals...</p>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : (
      <ProposalsTable proposals={proposals} />
    )}
  </div>
</div>

  );
};

const ProposalsTable = ({ proposals }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="p-2 min-w-full inline-block align-middle">
          <div className="overflow-hidden rounded-lg">
            <table className="min-w-full border border-gray-300 border-collapse shadow-md overflow-hidden">
              <thead className="bg-gray-700 text-white text-center">
                <tr>
                  <th className="border p-3 text-center font-semibold w-1/6">Project Name</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Description</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Status</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Reason</th>
                  <th className="border p-3 text-center font-semibold w-1/6">Objectives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposals.length > 0 ? (
                  proposals.map((proposal) => (
                    <tr key={proposal.pid} className="hover:bg-gray-100">
                      <td className="px-6 py-2 border border-gray-300 whitespace-normal break-words font-medium text-teal-800">
                        {proposal.projectName || "N/A"}
                      </td>
                      <td className="px-6 py-2 border border-gray-300 whitespace-normal break-words text-teal-800">
                        {proposal.description || "N/A"}
                      </td>
                      <td className="px-6 py-2 border border-gray-300 whitespace-normal break-words text-teal-800">
                      <div className="flex justify-center">
                      {getStatusBadge(proposal.status || "N/A")}
                      </div>
                      </td>
                      <td className="px-6 py-2 border border-gray-300 whitespace-normal break-words text-teal-800">
                        {proposal.reason || (proposal.status === "DENIED" ? "No reason provided" : "N/A")}
                      </td>
                      <td className="px-6 py-2 border border-gray-300 whitespace-normal break-words text-teal-800">
                        {proposal.features.length > 0 ? (
                          <ul className="list-disc ml-4">
                            {proposal.features.map((feature, index) => (
                              <li key={index}>
                                <strong>{feature.featureTitle}:</strong> {feature.featureDescription}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No features"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">
                      No proposals available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;

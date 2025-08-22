import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../services/AuthContext";
import axios from "axios";

const ViewProposalAdviserModal = ({ isOpen, onClose }) => {
  const { authState, getDecryptedId } = useContext(AuthContext);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const address = window.location.hostname;

  useEffect(() => {
    const fetchProposals = async () => {
      const teamId = getDecryptedId("tid");
      if (!teamId) {
        console.error("Team ID is missing or invalid.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://${address}:8080/proposals/team/${teamId}`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });

        setProposals(response.data || []);
      } catch (error) {
        console.error("Error fetching proposals:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setLoading(true);
      fetchProposals();
    }
  }, [isOpen, authState.token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Team Proposals</h2>

        {loading ? (
          <p className="text-gray-500 text-center">Loading project proposals...</p>
        ) : proposals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-md rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="border p-3 text-left font-semibold">Project Name</th>
                  <th className="border p-3 text-left font-semibold">Description</th>
                  <th className="border p-3 text-left font-semibold">Objectives</th>
                  <th className="border p-3 text-left font-semibold">Proposed By</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-800">
                {proposals.map((proposal, index) => (
                  <tr key={proposal.pid} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                    <td className="border p-3">{proposal.projectName}</td>
                    <td className="border p-3">{proposal.description}</td>
                    <td className="border p-3">
                      {proposal.features?.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {proposal.features.map((feature, i) => (
                            <li key={i} className="whitespace-normal">
                              <span className="font-semibold">{feature.featureTitle}</span>: {feature.featureDescription}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No features"
                      )}
                    </td>
                    <td className="border p-3">{proposal.proposedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No project proposals found.</p>
        )}

        <div className="flex justify-end mt-4">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProposalAdviserModal;
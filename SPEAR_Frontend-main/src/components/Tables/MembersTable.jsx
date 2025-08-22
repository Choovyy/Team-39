import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../services/AuthContext";
import FormTeamModal from "../Modals/FormTeamModal";
import axios from "axios";

const MembersTable = () => {
  const { authState, getDecryptedId, storeEncryptedId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormTeamModalOpen, setIsFormTeamModalOpen] = useState(false);

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  // Retrieve required IDs
  const classId = getDecryptedId("cid");
  const userId = authState.uid;
  
  // Get teamId from LocalStorage or API response
  const [teamId, setTeamId] = useState(getDecryptedId("tid") || authState.teamId || null);

  const fetchTeamDetails = async () => {
    if (!classId || !userId) {
      console.error("Class ID or User ID is missing.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = authState.token;
      if (!token) {
        console.error("Auth token is missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://${address}:8080/team/my/${classId}/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 && response.data) {
        setTeamDetails(response.data);
        const latestTeamId = response.data.tid;
        if (latestTeamId) {
          setTeamId(latestTeamId);
          storeEncryptedId("tid", latestTeamId);
        }
      } else {
        console.warn("No team data received.");
        setTeamDetails(null);
      }
    } catch (error) {
      //console.error("Error fetching team details:", error.response?.data || error.message);
      setTeamDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [authState.uid, classId]);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!classId || !userId) {
        console.error("Class ID or User ID is missing.");
        setLoading(false);
        return;
      }
    
      setLoading(true);
      try {
        const token = authState.token;
        if (!token) {
          console.error("Auth token is missing.");
          setLoading(false);
          return;
        }
    
        const response = await axios.get(
          `http://${address}:8080/team/my/${classId}/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        if (response.status === 200 && response.data) {
          setTeamDetails(response.data);
          const latestTeamId = response.data.tid;
          if (latestTeamId) {
            setTeamId(latestTeamId);
            storeEncryptedId("tid", latestTeamId);
          }
        } else {
          // Suppress warnings by not logging anything
          setTeamDetails(null);
        }
      } catch (error) {
        if (error.response?.status !== 404) { // Only log actual errors, not "not found"
          //console.error("Error fetching team details:", error.response?.data || error.message);
        }
        setTeamDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [authState.uid, classId]);

  const handleTeamSettingsClick = () => {
    let latestTeamId = getDecryptedId("tid") || teamId;
  
    if (!classId || !latestTeamId || !userId) {
      console.error("Missing parameters for navigation:", { classId, latestTeamId, userId });
      return;
    }
  
    // Store `teamId` securely before navigating
    storeEncryptedId("tid", latestTeamId);
  
    navigate(`/student-team-settings/${classId}/${latestTeamId}/${userId}`);
  };

  const handleAddMembersClick = () => {
    setIsAddMemberModalOpen(true);
  };

  const TABLE_HEAD = ["Group Name", "Recruitment Status", "Leader", "Members", "Adviser & Schedule", " ", " "];

  return (
  <div className="overflow-hidden rounded-2xl border border-gray-300 shadow-sm shadow-gray-200 mt-8 p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-teal-500">Team Information</h1>
      {/* {proposal.pid === officialProjectId && (
      <span className="px-3 py-1 rounded-full text-sm font-semibold inline-block bg-gray-700 text-white">
        Official
      </span>
      )} */}
    </div>
  
    {loading ? (
      <p className="text-center text-gray-500 p-4">Loading...</p>
    ) : teamDetails ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Group Name</h3>
            <p className="text-lg font-medium">{teamDetails.groupName || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Recruitment</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                teamDetails.recruitmentOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              {teamDetails.recruitmentOpen ? "Open" : "Closed"}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Leader</h3>
            <p className="font-medium">{teamDetails.leaderName || "N/A"}</p>
          </div>
        </div>
  
        {/* Right Column - Members Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Members</h3>
            {teamDetails?.memberNames && teamDetails.memberNames.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {teamDetails.memberNames.map((member, index) => (
                  <li key={index} className="font-medium">{member}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No Members</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Adviser</h3>
            <p className="font-medium">{teamDetails.adviserName || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Schedule</h3>
            <p className="font-medium">
              {teamDetails.scheduleDay && teamDetails.scheduleTime
                ? `${teamDetails.scheduleDay}, ${teamDetails.scheduleTime}`
                : "Not Assigned"}
            </p>
          </div>
        </div>
      </div>
    ) : (
        <div className="text-gray-500 p-4">
          You have currently no team.{" "}
          <button
            onClick={() => setIsFormTeamModalOpen(true)}
            className="text-teal underline"
          >
            Create a Team
          </button>
          
          {/* Form Team Modal */}
          {isFormTeamModalOpen && (
            <FormTeamModal
              onClose={() => setIsFormTeamModalOpen(false)}
              refreshTeamData={fetchTeamDetails}
            />
          )}{" "}
          or{" "}
          <button
            onClick={() => navigate("/student/team-formation/apply-team")}
            className="text-teal underline"
          >
            Apply to a Team
          </button>
          </div>
      )}
    </div>
  );
};

export default MembersTable;
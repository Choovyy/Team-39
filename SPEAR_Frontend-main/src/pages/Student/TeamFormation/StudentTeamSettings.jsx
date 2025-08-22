import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import Navbar from "../../../components/Navbar/Navbar";
import {
  FiArrowLeft,
  FiEdit3,
  FiUserMinus,
  FiChevronDown,
  FiUserCheck,
} from "react-icons/fi";
import { Crown, UserMinus } from "lucide-react";
import StudentAdvisoryRequestModal from "../../../components/Modals/StudentAdvisoryRequestModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentTeamSettings = () => {
  const { authState, getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();

  const classId = getDecryptedId("cid") || authState.classId;
  const userId = authState.uid;

  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adviser, setAdviser] = useState("");
  const [schedule, setSchedule] = useState("");
  const [advisers, setAdvisers] = useState([]);
  const [adviserLoading, setAdviserLoading] = useState(false);
  const [selectedAdviser, setSelectedAdviser] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showAdviserDropdown, setShowAdviserDropdown] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [error, setError] = useState("");
  const [showDropModal, setShowDropModal] = useState(false);
  const [dropReason, setDropReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [userData, setUserData] = useState({ firstname: "", lastname: "" });
  const [classDetails, setClassDetails] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    if (!classId || !userId) {
      setLoading(false);
      return;
    }

    const fetchTeamDetails = async () => {
      try {
        const response = await axios.get(
          `http://${address}:8080/team/my/${classId}/${userId}`
        );
        if (response.status === 200 && response.data) {
          const teamData = response.data;
          setTeamDetails(teamData);
          setGroupName(teamData.groupName || "");
          setRecruitmentOpen(teamData.recruitmentOpen);
          console.log("Fetched team details:", teamData);

          if (teamData.adviserId) {
            setSelectedAdviser(teamData.adviserId);
            fetchSchedules(teamData.adviserId);
          }

          if (teamData.scheduleId) {
            setSelectedSchedule(teamData.scheduleId);
          }
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
        setTeamDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [classId, userId]);

  const fetchAdvisers = async () => {
    setShowAdviserDropdown((prev) => !prev);
    setError("");

    if (advisers.length > 0) return;

    try {
      const response = await axios.get(
        `http://${address}:8080/class/${classId}/qualified-teachers`
      );
      if (response.status === 200) {
        setAdvisers(response.data);
      }
    } catch (error) {
      console.error("Error fetching advisers:", error);
      setError("Failed to fetch advisers.");
    }
  };

  const fetchSchedules = async (adviserId) => {
    setError("");
    setShowScheduleDropdown(false);
    setSchedules([]);

    if (!adviserId || !classId) {
      console.error("Invalid adviser ID or class ID");
      setError("Invalid adviser or class information.");
      return;
    }

    try {
      const response = await axios.get(
        `http://${address}:8080/adviser/${adviserId}/available-schedules/${classId}`
      );
      if (response.status === 200 && response.data.length > 0) {
        setSchedules(response.data);
      } else {
        setSchedules([]);
        setError("No schedules available for this adviser.");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError(error.response?.data?.message || "Failed to fetch schedules.");
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    const [hour, minute] = timeString.split(":");
    let formattedHour = parseInt(hour, 10);
    const ampm = formattedHour >= 12 ? "PM" : "AM";

    if (formattedHour > 12) formattedHour -= 12;
    if (formattedHour === 0) formattedHour = 12;

    return `${formattedHour}:${minute} ${ampm}`;
  };

  // Fixed dropAdviser function
const dropAdviser = async () => {
  if (!dropReason.trim()) {
    toast.error("Please provide a reason before submitting.");
    return;
  }

  try {
    const res = await axios.post(
      `http://${address}:8080/team/${teamDetails.tid}/leave-adviser`,
      {
        requesterId: userId,
        reason: dropReason,
      }
    );

    // Use toast instead of alert for consistent UX
    toast.success(res.data.message || "Successfully submitted request to leave adviser");
    
    // Close the modal
    setShowDropModal(false);
    setDropReason("");
    
    // Delay page refresh to ensure toast is visible
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err) {
    console.error("Error submitting leave adviser request:", err);
    toast.error(err.response?.data?.error || "Failed to submit leave request.");
  }
};

  const toggleRecruitment = async () => {
    if (!teamDetails?.tid) return;
    setIsUpdating(true);
    try {
      await axios.put(
        `http://${address}:8080/student/${teamDetails.tid}/${
          recruitmentOpen ? "close-recruitment" : "open-recruitment"
        }`,
        { requesterId: userId } // Include the leader's ID
      );
      setRecruitmentOpen(!recruitmentOpen);
    } catch (error) {
      console.error("Error updating recruitment status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateGroupName = async () => {
    if (!teamDetails?.tid || !groupName.trim()) return;
    setIsUpdating(true);
    try {
      await axios.put(
        `http://${address}:8080/student/${teamDetails.tid}/update-group-name`,
        {
          groupName,
          requesterId: userId,
        }
      );
      toast.success("Group name updated successfully!");
    } catch (error) {
      console.error("Error updating group name:", error);
      toast.error("Failed to update group name.");
    } finally {
      setIsUpdating(false);
    }
  };

  const kickMember = async (memberId) => {
    if (!teamDetails?.tid) return;
  
    try {
      // Store the member name for the toast message
      const memberIndex = teamDetails.memberIds.indexOf(memberId);
      const memberName = teamDetails.memberNames[memberIndex];
      
      // Call the API to kick the member
      await axios.delete(
        `http://${address}:8080/student/${teamDetails.tid}/kick-member/${memberId}`,
        {
          data: { requesterId: userId },
        }
      );
  
      // First show the toast
      toast.success(`${memberName} removed successfully!`);
      
      // Then update local state
      setTeamDetails((prev) => {
        // Find the index of the member to remove
        const idx = prev.memberIds.indexOf(memberId);
        
        // Create new arrays without the kicked member
        const newMemberIds = [...prev.memberIds];
        const newMemberNames = [...prev.memberNames];
        
        // Only remove if the member is found
        if (idx !== -1) {
          newMemberIds.splice(idx, 1);
          newMemberNames.splice(idx, 1);
        }
        
        return {
          ...prev,
          memberIds: newMemberIds,
          memberNames: newMemberNames
        };
      });
      
      // Refresh the page after a delay to ensure toast is seen
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Failed to remove member.");
      console.error("Error removing member:", error);
    }
  };

  const leaveTeam = async () => {
    if (!teamDetails?.tid) return;
  
    try {
      const response = await axios.delete(
        `http://${address}:8080/team/${teamDetails.tid}/leave`,
        {
          params: { userId },
        }
      );
  
      // First show success message
      toast.success(response.data.message || "Successfully left the team!");
      
      // Delay page refresh to ensure toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(
        "Error leaving team:",
        error.response?.data?.error || error.message
      );
      toast.error(error.response?.data?.error || "Failed to leave the team.");
    }
  };

  const deleteTeam = async () => {
    if (!teamDetails?.tid) return;
  
    try {
      const response = await axios.delete(
        `http://${address}:8080/student/delete-team/${teamDetails.tid}/requester/${userId}`
      );
  
      toast.success("Team deleted successfully!");
      setTimeout(() => {
        navigate("/student-dashboard");
      }, 1500);
    } catch (error) {
      console.error(
        "Error deleting team:",
        error.response?.data?.message || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to delete the team."
      );
    }
  };

  const transferLeadership = async (newLeaderId) => {
    if (!teamDetails?.tid) return;
    setIsTransferring(true);
  
    // Check if the current user is the team leader before proceeding
    const isLeader = userId === teamDetails.leaderId;
    if (!isLeader) {
      toast.error("Only the current leader can transfer leadership.");
      setIsTransferring(false);
      return;
    }
  
    // figure out the new leader's name from our arrays
    const idx = teamDetails.memberIds.indexOf(newLeaderId);
    const newLeaderName = teamDetails.memberNames[idx] || "";
  
    try {
      const response = await axios.put(
        `http://${address}:8080/team/${teamDetails.tid}/transfer-leadership`,
        {
          requesterId: userId,
          newLeaderId: newLeaderId,
        }
      );
      
      // Only update UI and show toast if the API call was successful
      if (response.status === 200) {
        setTeamDetails(td => ({ 
          ...td, 
          leaderName: newLeaderName,
          leaderId: newLeaderId
        }));
        
        toast.success("Leadership transferred successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1500); 
      }
    } catch (error) {
      console.error("Error transferring leadership:", error);
      toast.error(
        error.response?.data?.message || "Failed to transfer leadership."
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(
        `http://${address}:8080/get-student/${authState.uid}`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );
      const { firstname, lastname } = response.data;
      setUserData({ firstname, lastname });

      console.log("Student Info:", response.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Error fetching student data. Please try again.");
    }
  };

  useEffect(() => {
    if (!classId) return;
    const fetchClassDetails = async () => {
      try {
        const res = await axios.get(`http://${address}:8080/class/${classId}`);
        setClassDetails(res.data);
      } catch (error) {
        console.error("Failed to fetch class info", error);
      }
    };
    fetchClassDetails();
  }, [classId]);
  

  useEffect(() => {
    if (authState?.uid) {
      fetchStudentData();
    }
  }, [authState]);

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl w-96 max-w-[90%] mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-700 text-xl font-bold">
              Confirmation
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700 text-xl"
              onClick={onClose}
            >
              ✖
            </button>
          </div>
          <p className="text-gray-600 mt-3 text-lg">{message}</p>
          <div className="flex justify-end gap-4 mt-8">
            <button
              className="border border-gray-300 px-5 py-3 rounded-md hover:bg-gray-200 transition text-md font-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="text-white px-5 py-3 rounded-md transition text-md font-medium"
              style={{ backgroundColor: "#323c47" }}
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
    <div className="flex flex-col bg-gray-50 text-gray-900 min-h-screen">
      {/* Navbar */}
      <Navbar userRole={authState.role} />

      <div className="w-full flex-1">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 hover:bg-gray-500 transition"
          >
            <FiArrowLeft />
          </button>

          <h2 className="text-2xl md:text-3xl font-bold text-teal-700 mb-8 text-center">
            Team Settings
          </h2>

          {teamDetails ? (
            <div className="flex flex-col gap-6 w-full md:flex-row">
              <div className="w-full md:w-1/2 flex flex-col gap-6">

                <div className="border-b pb-6">
                  <h3 className="text-xl font-semibold mb-3">Change Group Name</h3>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="border p-3 w-full rounded-md text-lg"
                    />
                    <button
                      onClick={updateGroupName}
                      className="bg-gray-200 px-5 py-3 rounded-md hover:bg-gray-300 transition whitespace-nowrap text-lg font-medium"
                      disabled={isUpdating}
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Team Leader */}
                <div className="my-4">
                  <p className="text-lg">
                    <strong className="font-semibold">Team Leader:</strong>{" "}
                    <span className="text-gray-800">{teamDetails.leaderName || "Unknown Leader"}</span>
                  </p>
                </div>

                {/* Team Members */}
                <div className="w-full overflow-x-auto my-6">
                  <h3 className="text-xl font-semibold mb-4">Team Members</h3>
                  {teamDetails.memberNames?.length > 0 ? (
                    <div className="rounded-md overflow-hidden shadow-md">
                      <table className="w-full border-collapse min-w-full">
                        <thead className="bg-gray-700 text-white">
                          <tr>
                            <th className="border border-gray-300 px-5 py-3 text-left text-lg">Member Name</th>
                            <th className="border border-gray-300 px-5 py-3 text-center text-lg">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamDetails.memberNames.map((member, index) => (
                            <tr key={teamDetails.memberIds[index]} className="hover:bg-gray-100">
                              <td className="border border-gray-300 px-5 py-4 text-gray-800 text-lg">
                                {member}
                              </td>
                              <td className="border border-gray-300 px-4 py-4">
                                <div className="flex flex-wrap gap-3 justify-center">
                                  <button
                                    className="group border border-red-300 text-gray-800 px-4 py-3 rounded-md hover:bg-red-600 hover:text-white transition flex items-center gap-2"
                                    onClick={() => {
                                      setModalMessage("Are you sure you want to remove this member from the team?");
                                      setConfirmAction(() => () => kickMember(teamDetails.memberIds[index]));
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    <UserMinus className="h-6 w-6 text-red-600 group-hover:text-white transition" />
                                  </button>
                                  <button
                                    className="group border border-amber-300 text-gray-800 px-4 py-3 rounded-md hover:bg-amber-500 hover:text-white transition flex items-center gap-2"
                                    onClick={() => {
                                      setModalMessage("Are you sure you want to transfer leadership?");
                                      setConfirmAction(() => () =>
                                        transferLeadership(teamDetails.memberIds[index])
                                      );
                                      setIsModalOpen(true);
                                    }}
                                    disabled={isTransferring}
                                    style={isTransferring ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                  >
                                    <Crown className="h-6 w-6 text-amber-500 group-hover:text-white transition" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-lg text-gray-600 p-4 bg-gray-50 rounded-md">No members in the team.</p>
                  )}
                </div>

                {/* Adviser & Schedule */}
                <div className="w-full">
                  {teamDetails.adviserName !== "No Adviser Assigned" &&
                  teamDetails.scheduleDay !== "No Day Set" &&
                  teamDetails.scheduleTime !== "No Time Set" ? (
                    <div className="p-4 border rounded-md bg-gray-50">
                      <h3 className="text-lg font-semibold mb-2">Team Adviser & Schedule</h3>
                      <p className="text-gray-700"><strong>Adviser:</strong> {teamDetails.adviserName}</p>
                      <p className="text-gray-700">
                        <strong>Schedule:</strong> {`${teamDetails.scheduleDay}, ${teamDetails.scheduleTime}`}
                      </p>
                      <button
                        onClick={() => setShowDropModal(true)}
                        className="mt-4 px-4 py-2 rounded text-white w-full transition bg-red-500 hover:bg-red-600"
                      >
                        Request to Leave Adviser
                      </button>
                    </div>
                  ) : (
                    classDetails?.needsAdvisory && (
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="px-4 py-2 w-full bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                      >
                        Request Adviser & Schedule
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col gap-6">
                {/* Recruitment */}
                <div className="p-6 border rounded-md bg-gray-50 w-full shadow-md">
                  <h2 className="text-xl font-semibold text-black mb-3">Recruitment Status</h2>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-black">Open Recruitment</p>
                      <p className="text-md text-gray-600">Allow new members to join your team</p>
                    </div>
                    <button
                      onClick={toggleRecruitment}
                      disabled={isUpdating}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ${
                        recruitmentOpen ? "bg-green-500" : "bg-gray-300"
                      } ${
                        isUpdating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          recruitmentOpen ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Leave & Delete */}
                <div className="flex flex-row gap-4 w-full">
                 <button
                   className="w-1/2 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-lg font-medium"
                   onClick={() => {
                     setModalMessage("Are you sure you want to leave the team?");
                     setConfirmAction(() => () => leaveTeam());
                     setIsModalOpen(true);
                   }}
                 >
                   Leave Team
                 </button>

                 {`${userData.firstname} ${userData.lastname}` === teamDetails?.leaderName && (
                  <button
                    className="w-1/2 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-lg font-medium"
                     onClick={() => {
                       setModalMessage("Are you sure you want to delete this team? This action cannot be undone.");
                       setConfirmAction(() => () => deleteTeam());
                       setIsModalOpen(true);
                     }}
                   >
                     Delete Team
                   </button>
                 )}
               </div>

              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">You are not in a team.</p>
          )}
        </div>
      </div>
    </div>

    {/* Modals */}
    {showRequestModal && (
      <StudentAdvisoryRequestModal
        teamId={teamDetails?.tid}
        requesterId={authState.userId}
        closeModal={() => setShowRequestModal(false)}
      />
    )}

    {showDropModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md mx-4 relative">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Drop Adviser</h2>
            <button
              onClick={() => setShowDropModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>
          </div>
          <p className="text-gray-700 mb-3 text-lg">Please provide a reason:</p>
          <textarea
            rows="4"
            value={dropReason}
            onChange={(e) => setDropReason(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
            placeholder="Explain why you want to drop your adviser..."
          />
          <button
            onClick={dropAdviser}
            disabled={!dropReason.trim()}
            className="mt-5 w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    )}

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
  </>
  );
};

export default StudentTeamSettings;
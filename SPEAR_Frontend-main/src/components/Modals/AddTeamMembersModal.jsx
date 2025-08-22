import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../services/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddTeamMembersModal = ({ isOpen, onClose, teamId, classId }) => {
  const { authState } = useContext(AuthContext);
  const userId = authState.uid; 
  const [searchTerm, setSearchTerm] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState("");

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  // Sorting State
  const [sortOption, setSortOption] = useState("firstname");

  useEffect(() => {
    if (isOpen && classId) {
      fetchAvailableStudents();
    }
  }, [isOpen, classId]);

  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://${address}:8080/team/${classId}/available-students`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );
      setAvailableStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error("Error fetching available students:", error);
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = availableStudents.filter((student) =>
      `${student.firstname} ${student.lastname}`.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    sortStudents(e.target.value);
  };

  const sortStudents = (sortBy) => {
    const sorted = [...filteredStudents].sort((a, b) =>
      a[sortBy].toLowerCase() > b[sortBy].toLowerCase() ? 1 : -1
    );
    setFilteredStudents(sorted);
  };

  const refreshTeamData = async () => {
    try {
      const response = await axios.get(
        `http://${address}:8080/team/${teamId}`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
  
      if (response.status === 200) {
        setTeamData(response.data);
      }
    } catch (error) {
      console.error("Error refreshing team data:", error.response?.data || error);
    }
  };

  const addMember = async (memberId) => {
    if (!teamId || !userId) {
      console.error("Missing teamId or userId:", { teamId, userId });
      return;
    }
  
    const payload = {
      memberId: memberId, 
      requesterId: userId,
    };
    
    setAddingId(memberId);
    try {
      const response = await axios.post(
        `http://${address}:8080/team/${teamId}/add-member`,
        payload,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
  
      if (response.status === 200) {
        setAvailableStudents((prev) => prev.filter((student) => student.uid !== memberId));
        setFilteredStudents((prev) => prev.filter((student) => student.uid !== memberId));
  
        await refreshTeamData();
        toast.success("Student Invited Successfully!");
      }
    } catch (error) {
      console.error("Error adding member:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to add member.");
    } finally {
      setAddingId(null);
    }
  };
  
 

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredStudents.length / studentsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!isOpen) return null;

  return (
  <>
     <ToastContainer position="top-right" autoClose={3000} />  
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-4">Add Team Members</h2>
        <button 
          onClick={() => {
            onClose();
            window.location.reload();
          }} 
          className="text-gray-500 hover:text-gray-700 mb-4"
        >
          ✖
        </button>
        </div>
        <input
          type="text"
          placeholder="Search for students..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded-lg mb-3"
        />
        <div className="mb-3">
          <label className="block text-sm font-medium">Sort by:</label>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="firstname">First Name</option>
            <option value="lastname">Last Name</option>
            <option value="email">Email</option>
          </select>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : currentStudents.length > 0 ? (
          <>
            <ul className="max-h-60 overflow-y-auto">
              {currentStudents.map((student) => (
                <li key={student.uid} className="flex justify-between p-2 border-b">
                  {student.firstname} {student.lastname} ({student.email})
                  <button
                    onClick={() => addMember(student.uid)}
                    className="border border-green-500 text-gray-700 px-3 py-1 rounded-lg hover:bg-green-100 disabled:bg-gray-400"
                    disabled={addingId === student.uid}
                  >
                    {addingId === student.uid ? "Inviting..." : "Invite"}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center items-center mt-3 space-x-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1} 
                className="text-gray-700 px-1 py-1 rounded-lg flex items-center opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft  />
                Previous
              </button>
              
              <span className="text-base font-medium">Page {currentPage} of {Math.ceil(filteredStudents.length / studentsPerPage)}</span>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)} 
                className="text-gray-700 px-1 py-1 rounded-lg flex items-center opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight/>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
           <p className="text-gray-500 text-lg">No students found.</p>
         </div>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
    </>
  );
};

export default AddTeamMembersModal;
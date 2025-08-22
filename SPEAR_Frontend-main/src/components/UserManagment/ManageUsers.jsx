import React, { useState, useContext, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import AuthContext from "../../services/AuthContext";
import UsersTable from "../Tables/UsersTable";
import AddUsersModal from "../Modals/AddUsersModal";
import axios from "axios";
import { UserPlus, Search } from "lucide-react";
import { toast } from "react-toastify";

const ManageUsers = () => {
  const { authState } = useContext(AuthContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1
      ? hostname.substring(0, indexOfColon)
      : hostname;
  }

  // Fetch active users from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `http://${address}:8080/admin/users/active`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch active users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => 
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleUserDeleted = (deletedEmail) => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.email !== deletedEmail)
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-teal md:px-20 lg:px-28 pt-8 md:pt-12">
        <div className="header flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold">Welcome, Admin</h1>
          <Header />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 mb-6">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-teal text-white text-sm px-4 py-2 rounded-md hover:bg-peach flex items-center justify-between w-full md:w-auto"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Users
          </button>
        </div>
        {filteredUsers.length === 0 && searchTerm && (
          <div className="text-center py-4 text-gray-500">
            No users found matching "{searchTerm}"
          </div>
        )}
        {/* Pass filtered users to the table */}
        <UsersTable users={filteredUsers} onUserDeleted={handleUserDeleted} />
        <AddUsersModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onUserAdded={handleUserAdded}
        />
      </div>
    </div>
  );
};

export default ManageUsers;
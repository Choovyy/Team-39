import React, { useState } from "react";
import notifBell from "../../assets/icons/notification-icon.svg";
import userProfile from "../../assets/imgs/osaka.jpg";
import notificationContent from "../../statics/notification-content";
import NotificationModal from "../Modals/NotificationModal";
//might not be useful in the long run.... :(
const Header = () => {
  const [isModalOpen, setModalOpen] = useState(false); // State to control modal visibility

  const handleBellClick = () => {
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
  };

  return (
    <div className="flex items-center space-x-4">
      {/* <img
        src={notifBell}
        alt="notification-bell"
        className="w-8 h-8 cursor-pointer"
        onClick={handleBellClick} // Open modal on click
      /> */}
      {/* <img
        src={userProfile}
        alt="user-profile"
        className="w-8 h-8 rounded-full"
      /> */}

      {/* Notification Modal */}
      {/* <NotificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notifications={notificationContent} // Pass notifications to modal
      /> */}
    </div>
  );
};

export default Header;

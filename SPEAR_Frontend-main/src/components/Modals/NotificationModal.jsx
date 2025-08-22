import React from "react";

const NotificationModal = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null; // Don't render anything if not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-3xl relative p-8">
        {/* Close Button in Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
        >
          &times; {/* Close icon */}
        </button>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="border-b pb-2">
              <p>{notification.message}</p>
              <span className="text-xs text-gray-500">
                {notification.timestamp}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationModal;

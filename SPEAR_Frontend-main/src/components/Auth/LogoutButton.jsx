import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../services/AuthContext';

/* LogoutButton: clears auth state and returns user to login page */
const LogoutButton = ({ className = '' }) => {
  const { logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition ${className}`}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
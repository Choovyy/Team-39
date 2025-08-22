// src/services/PrivateRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import ErrorPage from "../pages/Common/ErrorPage";
import errorImage from "../assets/imgs/error2.jpeg";

const PrivateRoute = ({ children, requiredRoles }) => {
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Still initializing?
  if (authState.token === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
        <img
          src={errorImage}
          alt="Error Illustration"
          className="w-1/6 max-w-md mb-8 translate-x-7"
        />

        <div className="text-center px-4">
          <h1 className="text-4xl font-semibold text-gray-700 mb-4">
            Something’s wrong here…
          </h1>
          <p className="text-gray-500 text-lg mb-6">
            We can't find the page you're looking for. Please check the URL or
            go back to the login page.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition duration-300"
            onClick={() => navigate("/login")}
          >
            Back to Login Page
          </button>
        </div>
      </div>
    );
  }

  // 2. Not authenticated?
  if (!authState.isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Wrong role?
  if (!requiredRoles.includes(authState.role)) {
    return <ErrorPage />;
  }

  // 4. All good!
  return children;
};

export default PrivateRoute;
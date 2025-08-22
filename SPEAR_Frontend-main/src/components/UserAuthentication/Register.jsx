import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/imgs/logo-dark.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(null); // Can be true, false, or null.
  const [isEmailValid, setIsEmailValid] = useState(null); // Can be true, false, or null.
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));

    if (id === "email") {
      validateEmail(value);
    } else if (id === "password") {
      validatePassword(value);
      checkPasswordMatch(value, formData.confirmPassword);
    } else if (id === "confirmPassword") {
      checkPasswordMatch(formData.password, value);
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@cit\.edu$/;
    setIsEmailValid(emailPattern.test(email));
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
      hasMinLength: password.length >= 8,
    });
  };

  const checkPasswordMatch = (password, confirmPassword) => {
    setIsPasswordMatch(
      password && confirmPassword && password === confirmPassword
    );
  };

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      setError("Email must be a valid @cit.edu email address!");
      toast.error("Email must be a valid @cit.edu email address!");
      return;
    }

    // Password validation
    const {
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      hasMinLength,
    } = passwordValidation;
    if (
      !(
        hasUppercase &&
        hasLowercase &&
        hasNumber &&
        hasSpecialChar &&
        hasMinLength
      )
    ) {
      setError(
        "Password must meet all the requirements: 1 uppercase, 1 lowercase, 1 number, 1 special character, and at least 8 characters."
      );
      toast.error(
        "Password must meet all the requirements: 1 uppercase, 1 lowercase, 1 number, 1 special character, and at least 8 characters."
      );
      return;
    }

    if (!isPasswordMatch) {
      setError("Passwords do not match!");
      toast.error("Passwords do not match!");
      return;
    }

    setError(null);
    setIsLoading(true);

    const userData = {
      email: formData.email,
      firstname: formData.firstName,
      lastname: formData.lastName,
      password: formData.password,
      role: "STUDENT",
      interests: "N/A",
      department: "N/A",
    };

    try {
      const response = await axios.post(
        `http://${address}:8080/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check the status code from the response (might be different than HTTP status)
      if (response.data && response.data.statusCode === 400) {
        // This is for already registered email
        toast.error(response.data.message || "This email is already registered.");
      } else if (response.data && response.data.statusCode === 200) {
        // Check if this was an account revival
        if (response.data.message && response.data.message.includes("restored")) {
          toast.success("Your account has been restored successfully!");
        } else {
          toast.success("Registration successful!");
        }
        // Redirect after short delay to allow toast to be seen
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Generic success case
        toast.success("Registration successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Error during registration:", err);
      
      // Handle HTTP errors from the server
      if (err.response) {
        const errorMessage = err.response.data?.message || "Registration failed.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Network or other errors
        setError("Registration failed. Please check your connection and try again.");
        toast.error("Registration failed. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-center min-h-screen">
        <div className="main-content grid grid-cols-1 bg-teal w-[928px] h-[696px] rounded-lg items-center drop-shadow-2xl">
          {/* Header */}
          <div className="header flex items-center justify-center bg-white rounded-t-lg w-full h-full">
            <img src={logo} alt="logo" className="w-20 h-20 object-contain" />
            <p className="text-md font-medium pl-4">
              Student Peer Evaluation and Review System
            </p>
          </div>

          <div className="form-field w-full px-32 py-2">
            <h1 className="text-white text-2xl font-medium pb-2 text-center">
              Registration
            </h1>
            {error && (
              <div className="text-red-500 text-sm text-center mb-4 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              {/* Form Fields */}
              <div className="col-span-2">
                <label
                  className="block text-sm text-white mb-1"
                  htmlFor="email"
                >
                  University Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full p-2 rounded-md border ${
                    isEmailValid === false
                      ? "border-red-500"
                      : isEmailValid === true
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {isEmailValid === false && (
                  <p className="text-red-500 text-sm mt-2">
                    Email must be a valid @cit.edu email address.
                  </p>
                )}
                {isEmailValid === true && (
                  <p className="text-green-500 text-sm mt-2">Email is valid.</p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm text-white mb-1"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full p-2 rounded-md border border-gray-300"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm text-white mb-1"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full p-2 rounded-md border border-gray-300"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm text-white mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full p-2 rounded-md border border-gray-300"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setShowPasswordValidation(true)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <span className="text-gray-600">Hide</span>
                    ) : (
                      <span className="text-gray-600">Show</span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm text-white mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={`w-full p-2 rounded-md border ${
                      isPasswordMatch === false
                        ? "border-red-500"
                        : isPasswordMatch === true
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setShowPasswordValidation(true)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <span className="text-gray-600">Hide</span>
                    ) : (
                      <span className="text-gray-600">Show</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Password Validation */}
              {showPasswordValidation && (
                <div className="col-span-2 text-white text-sm bg-gray-800 p-3 rounded">
                  <p>Password Requirements:</p>
                  <ul className="list-disc ml-5">
                    <li
                      className={
                        passwordValidation.hasUppercase
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      At least 1 uppercase letter
                    </li>
                    <li
                      className={
                        passwordValidation.hasLowercase
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      At least 1 lowercase letter
                    </li>
                    <li
                      className={
                        passwordValidation.hasNumber
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      At least 1 number
                    </li>
                    <li
                      className={
                        passwordValidation.hasSpecialChar
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      At least 1 special character (@$!%*?&)
                    </li>
                    <li
                      className={
                        passwordValidation.hasMinLength
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      Minimum 8 characters
                    </li>
                  </ul>
                  {isPasswordMatch !== null && (
                    <p
                      className={`mt-2 text-sm ${
                        isPasswordMatch ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isPasswordMatch
                        ? "Passwords match."
                        : "Passwords do not match."}
                    </p>
                  )}
                </div>
              )}

              <div className="col-span-2">
                <button
                  type="submit"
                  className={`w-full py-2 rounded-md transition-colors ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : "bg-peach text-white font-semibold hover:bg-white hover:text-teal"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>

            {/* Link to log in */}
            <p className="mt-2 text-white text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-peach hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
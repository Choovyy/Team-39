import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/imgs/logo-dark.png";
import AuthContext from "../../services/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Forgot Password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState(1);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`http://${address}:8080/login`, { email, password });
      const data = response.data;
      if (!data || !data.token || !data.role) throw new Error("Invalid Credentials.");
      login(data.token, data.role, data.refreshToken, data.uid);
      if (data.role === "STUDENT") navigate("/student-dashboard");
      else if (data.role === "TEACHER") navigate("/teacher-dashboard");
      else if (data.role === "ADMIN") navigate("/admin-dashboard");
      else throw new Error("Invalid user role.");
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Save forgot password state to localStorage
  const saveResetState = () => {
    localStorage.setItem('forgotPasswordState', JSON.stringify({
      email: forgotEmail,
      step: resetStep,
      token: resetToken
    }));
  };

  // Step 1: send reset code
  const handleForgotRequest = async () => {
    setModalError("");
    setModalMessage("");
    if (!forgotEmail) {
      setModalError("Please enter your email.");
      return;
    }
    
    setSendingCode(true);
    
    try {
      const res = await axios.post(`http://${address}:8080/user/forgot-password`, { email: forgotEmail });
      if (res.data.statusCode === 200) {
        setModalMessage("Reset code sent. Check your email.");
        setResetStep(2);
        setTimer(180); // 3 minutes
        
        // Save state immediately after successful step transition
        // This ensures the user stays on step 2 even after refresh
        saveResetState();
        
        // Also store a flag that this email has started the reset process
        sessionStorage.setItem('passwordResetInProgress', 'true');
      } else {
        setModalError(res.data.message || "Error sending reset code.");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message);
    } finally {
      setSendingCode(false);
    }
  };

  // countdown effect
  useEffect(() => {
    if (resetStep === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resetStep, timer]);

  // Resend code button should also be disabled while sending
  const handleResendCode = () => {
    setResetToken("");  // Clear the token field for new code
    handleForgotRequest();
  };

  // Make sure "Reset Password" button is also disabled during operations
  const [resettingPassword, setResettingPassword] = useState(false);
  
  // Step 2: verify code and reset password
  const handlePasswordReset = async () => {
    setModalError("");
    setModalMessage("");
    if (!resetToken || !newPassword || !confirmPassword) {
      setModalError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError("Passwords do not match.");
      return;
    }
  
    setResettingPassword(true);
  
    try {
      const res = await axios.post(`http://${address}:8080/user/reset-password`, {
        email: forgotEmail,
        token: resetToken,
        newPassword,
      });
      if (res.data.statusCode === 200) {
        setModalMessage("Password reset successful. You can now log in.");
  
        // --- CLEAR ALL FORGOT-PW STATE HERE ---
        setForgotEmail("");
        setResetStep(1);
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setTimer(0);
        // also remove any saved localStorage
        localStorage.removeItem("forgotPasswordState");
  
        // close modal after a brief delay
        setTimeout(() => setShowForgotModal(false), 2000);
      } else {
        setModalError(res.data.message || "Error resetting password.");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message);
    } finally {
      setResettingPassword(false);
    }
  };

  // format timer mm:ss
  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Toggle modal and preserve state
  const toggleForgotModal = (show) => {
    if (show) {
      setShowForgotModal(true);
      
      // Check if there's an ongoing reset process
      const savedState = localStorage.getItem('forgotPasswordState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.step === 2) {
          // If there's a saved state with step 2, ensure we stay on step 2
          setResetStep(2);
          setForgotEmail(parsed.email || "");
          setResetToken(parsed.token || "");
        }
      }
    } else {
      // If we're at step 2, make sure to save state before closing
      if (resetStep === 2) {
        saveResetState();
      }
      setShowForgotModal(false);
    }
  };

  // Effect to save state whenever resetStep changes
  useEffect(() => {
    if (showForgotModal && resetStep === 2) {
      saveResetState();
      // Prevent going back to step 1
      const handleBeforeUnload = () => {
        saveResetState();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [resetStep, showForgotModal]);

  // Check for saved state when component mounts
  useEffect(() => {
    const savedState = localStorage.getItem('forgotPasswordState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      
      // If there's a saved state with step 2, automatically open the modal
      if (parsed.step === 2 && parsed.email) {
        setShowForgotModal(true);
        setForgotEmail(parsed.email || "");
        setResetStep(2);
        setResetToken(parsed.token || "");
      } else if (showForgotModal) {
        // Otherwise only populate if modal is open
        setForgotEmail(parsed.email || "");
        setResetStep(parsed.step || 1);
        setResetToken(parsed.token || "");
      }
    }
  }, [showForgotModal]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex items-center justify-center min-h-screen">
        <div className="main-content grid grid-cols-2 bg-teal w-[928px] h-[696px] rounded-lg items-center drop-shadow-2xl overflow-hidden">
          <div className="logo flex flex-col items-center justify-center bg-white h-full p-4 rounded-l-lg">
            <img src={logo} alt="logo" className="w-1/2 mb-6" />
            <p className="text-md font-medium p-4 text-center text-gray-700">
              Student Peer Evaluation and Review System
            </p>
            <div className="mt-4 w-3/4">
              <div className="bg-teal bg-opacity-10 p-4 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  "Empowering students through collaborative learning and meaningful feedback"
                </p>
              </div>
            </div>
          </div>

          <div className="form-field w-full h-full px-14 flex flex-col justify-center">
            <h1 className="text-white text-2xl font-medium text-center mb-8">Welcome Back</h1>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
              <p>{error}</p>
            </div>}
            
            <form className="grid gap-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm text-white mb-1" htmlFor="email">University Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-peach" 
                  placeholder="example@university.edu"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-white mb-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-peach" 
                    required 
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? (
                      <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                className="bg-peach text-white font-semibold py-3 rounded-md hover:bg-white hover:text-teal transition-all duration-300 shadow-md"
              >
                Log In
              </button>
            </form>
            
            <div className="mt-6 flex flex-col space-y-3 items-center">
              <button 
                type="button" 
                onClick={() => { 
                  toggleForgotModal(true); 
                  
                  // Check if there's a saved state first
                  const savedState = localStorage.getItem('forgotPasswordState');
                  if (!savedState) {
                    // Only reset if there's no saved state
                    setForgotEmail(""); 
                    setResetStep(1);
                  }
                  
                  setModalError(""); 
                  setModalMessage(""); 
                }} 
                className="text-white hover:text-peach focus:outline-none transition-colors"
              >
                Forgot Password?
              </button>
              
              <p className="text-white text-sm">
                Don't have an account? <Link to="/register" className="text-peach hover:underline">Create Account</Link>
              </p>
            </div>
          </div>
        </div>

        {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-2xl relative">
            <button 
              onClick={() => toggleForgotModal(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-teal">
                {resetStep === 1 ? "Find your account" : "Reset your password"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {resetStep === 1 
                  ? "Please enter your email to search for your account." 
                  : "Enter the code sent to your email and create a new password."}
              </p>
            </div>
            
            {modalError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
                <p className="text-sm">{modalError}</p>
              </div>
            )}
            
            {modalMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded">
                <p className="text-sm">{modalMessage}</p>
              </div>
            )}

            {resetStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-teal focus:outline-none" 
                    placeholder="example@university.edu"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleForgotRequest} 
                    disabled={sendingCode}
                    className="bg-peach text-white py-2 px-6 rounded-md hover:bg-teal transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingCode ? "Sending Code..." : "Send Reset Code"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
                  <input 
                    value={resetToken} 
                    onChange={(e) => setResetToken(e.target.value)} 
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-teal focus:outline-none" 
                    placeholder="Enter code from email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-teal focus:outline-none" 
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-teal focus:outline-none" 
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend code in <span className="font-medium">{formatTimer(timer)}</span>
                    </p>
                  ) : (
                    <button 
                      onClick={handleResendCode} 
                      disabled={sendingCode}
                      className="text-sm text-teal hover:text-peach transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {sendingCode ? "Sending..." : "Resend Code"}
                    </button>
                  )}
                  
                  <button 
                    onClick={handlePasswordReset}
                    disabled={resettingPassword} 
                    className="bg-peach text-white py-2 px-6 rounded-md hover:bg-teal transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resettingPassword ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Login;
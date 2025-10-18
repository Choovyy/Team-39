import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

const AuthContext = createContext();

const SECRET_KEY = "secret123hahalolxd";
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    role: null,
    uid: null,
    isAuthenticated: false,
  });


  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const role = localStorage.getItem("role");
    const encryptedUid = localStorage.getItem("uid");

    if (token && isTokenExpired(token)) {
      console.log("Token is expired, attempting to refresh...");
      if (refreshToken) {
        refreshAccessToken(refreshToken); // Refresh the token
      } else {
        logout(); // No refresh token available
      }
    } else if (token && role && encryptedUid) {
      const uid = decrypt(encryptedUid); // Decrypt the UID
      setAuthState({
        token,
        role,
        uid,
        isAuthenticated: true,
      });
    } else {
      logout(); // No token, role, or uid found
    }
  }, []);

  // Helper function to encrypt a value
  const encrypt = (value) => {
    if (!value) {
      console.error("Cannot encrypt invalid value:", value);
      return null;
    }
    return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  };
  
  const decrypt = (encryptedValue) => {
    if (!encryptedValue) {
      console.error("Cannot decrypt invalid value:", encryptedValue);
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Error decrypting value:", error.message || error);
      return null;
    }
  };
  

  const isTokenExpired = (token) => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      if (!decodedToken || !decodedToken.exp) {
        throw new Error("Invalid token format");
      }
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      return decodedToken.exp < currentTime; // Compare expiry time
    } catch (error) {
      console.error("Error decoding token:", error.message || error);
      return true; // Treat as expired if decoding fails
    }
  };
  

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await axios.post(`http://${address}:8080/refresh-token`, {
        token: refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data;

      // Store the new token and refresh token
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);

      setAuthState({
        token,
        role: localStorage.getItem("role"),
        uid: decrypt(localStorage.getItem("uid")), // Decrypt UID before setting state
        isAuthenticated: true,
      });
      console.log("Token refreshed successfully.");
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout(); 
    }
  };

  const login = (token, role, refreshToken, uid) => {
    if (!uid) {
      console.error("UID is missing or invalid");
      return;
    }
  
    const encryptedUid = encrypt(uid.toString()); // Ensure UID is converted to a string
  
    // Store the token, role, refreshToken, and encrypted UID
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);
    localStorage.setItem("uid", encryptedUid);
    
    setAuthState({
      token,
      role,
      uid,

      isAuthenticated: true,
    });
  };
  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("uid");
    localStorage.removeItem("cid");
    localStorage.removeItem("tid");
    localStorage.removeItem("pid");
    localStorage.removeItem("eid");
    localStorage.removeItem("qid");
    localStorage.removeItem("adviserId");
    localStorage.removeItem("adviserName");

    
    // Reset authState
    setAuthState({
      token: null,
      role: null,
      uid: null,
      cid: null,
      tid: null,
      pid: null,
      eid: null,
      qid: null,
      isAuthenticated: false,
    });
  };
  
  // Store and encrypt additional IDs (cid, pid, fid, tid, etc.)
const storeEncryptedId = (key, id) => {
  if (!id) {
    // console.error(`Invalid ID provided for key "${key}". ID:`, id);
    return; // Exit the function if the ID is invalid
  }
  const encryptedId = encrypt(id.toString());
  localStorage.setItem(key, encryptedId);
};

// Retrieve and decrypt additional IDs
const getDecryptedId = (key) => {
  const encryptedId = localStorage.getItem(key);
  return encryptedId ? decrypt(encryptedId) : null;
};

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        isAuthenticated: authState.isAuthenticated,
        isAdmin: authState.role === "ADMIN",
        isTeacher: authState.role === "TEACHER",
        isStudent: authState.role === "STUDENT",
        uid: authState.uid, // Expose decrypted UID if needed
        storeEncryptedId, // Utility for storing encrypted IDs
        getDecryptedId,   // Utility for retrieving decrypted IDs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

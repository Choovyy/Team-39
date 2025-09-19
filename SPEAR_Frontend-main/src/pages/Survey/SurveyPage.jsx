import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../services/AuthContext";
import axios from "axios";
import "../../styles/Survey/SurveyPage.css";
import group from "../../assets/imgs/group.jpg";

const SurveyPage = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    // Only check if logged in and student
    if (authState?.isAuthenticated && authState?.role === "STUDENT" && authState?.uid) {
      const address = window.location.hostname;
      axios.get(`http://${address}:8080/user/profile/${authState.uid}`)
        .then(resp => {
          // If not first-time user, redirect to dashboard
          if (resp.data && resp.data.firstTimeUser === false) {
            navigate("/student-ai-dashboard");
          }
        })
        .catch(err => {
          // If profile 404, allow survey flow; else log error
          if (err.response?.status && err.response.status !== 404) {
            console.error("User profile check error:", err);
          }
        });
    }
  }, [authState, navigate]);

  const handleMatchNowClick = () => {
    navigate("/survey1");
  };

  return (
    <section className="survey-page">
      <div className="survey-container">
        <div className="survey-grid">
          <div className="survey-text">
            <div className="survey-heading-wrapper">
              <h1>
                <span className="find-your">FIND YOUR</span>
                <span className="match-here">
                  <span className="highlight-match">MATCH</span> HERE
                </span>
              </h1>
              <p className="survey-description">
                Whether you're looking to collaborate or need a team, we're here to connect you with your perfect match.
              </p>
              <div className="button-wrapper">
                <button className="cta-button" onClick={handleMatchNowClick}>Match Now</button>
              </div>
            </div>
          </div>

          <div className="survey-image-wrapper">
            <div className="image-background-rectangle"></div>
            <img src={group} alt="Team collaboration in action" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SurveyPage;


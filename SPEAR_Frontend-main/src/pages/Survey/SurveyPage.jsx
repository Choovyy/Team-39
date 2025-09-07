import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Survey/SurveyPage.css";
import group from "../../assets/imgs/group.jpg";

const SurveyPage = () => {
  const navigate = useNavigate();

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


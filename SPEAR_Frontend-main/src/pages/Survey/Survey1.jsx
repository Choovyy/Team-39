import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../services/AuthContext';
import axios from 'axios';
import people from '../../assets/imgs/people.png';
import '../../styles/Survey/Survey1.css';

const Survey1 = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    if (authState?.isAuthenticated && authState?.role === "STUDENT" && authState?.uid) {
      const address = window.location.hostname;
      axios.get(`http://${address}:8080/user/profile/${authState.uid}`)
        .then(resp => {
          if (resp.data && resp.data.firstTimeUser === false) {
            navigate("/student-ai-dashboard");
          }
        })
        .catch(err => {
          // If profile not found or other error, allow proceeding with survey
          if (err.response?.status && err.response.status !== 404) {
            console.error("User profile check error:", err);
          }
        });
    }
  }, [authState, navigate]);
  const [selectedRole, setSelectedRole] = useState('');
  const [otherRole, setOtherRole] = useState('');
  const [otherSelected, setOtherSelected] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('survey1Data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.preferredRole) {
          // Check if it's a predefined role
          const roles = [
            'UI/UX Designer',
            'Frontend Developer', 
            'Backend Developer',
            'Game Developer',
            'Technical Writer',
            'Team Leader'
          ];
          
          if (roles.includes(data.preferredRole)) {
            setSelectedRole(data.preferredRole);
            setOtherSelected(false);
            setOtherRole('');
          } else {
            // It's a custom role
            setSelectedRole('Other');
            setOtherSelected(true);
            setOtherRole(data.preferredRole);
          }
        }
      } catch (error) {
        console.error('Error loading survey1 data:', error);
      }
    }
  }, []);

  const roles = [
    'UI/UX Designer',
    'Frontend Developer', 
    'Backend Developer',
    'Game Developer',
    'Technical Writer',
    'Team Leader'
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // When choosing a predefined role, ensure Others is cleared
    setOtherSelected(false);
    setOtherRole('');
  };

  const handleOtherToggle = () => {
    const next = !otherSelected;
    setOtherSelected(next);
    if (next) {
      setSelectedRole('Other');
    } else {
      setSelectedRole('');
      setOtherRole('');
    }
  };

  const handleOtherRoleChange = (e) => {
    setOtherRole(e.target.value);
  };

  const handleNext = () => {
  if (!selectedRole) return;

  // Load previous survey data (if any)
  const allSurveyData = JSON.parse(localStorage.getItem('surveyData') || '{}');

  // Add/update current step
  allSurveyData.step1 = {
    preferredRole: selectedRole === 'Other' ? otherRole : selectedRole,
  };

  // Save combined survey data
  localStorage.setItem('surveyData', JSON.stringify(allSurveyData));

  // Navigate to next survey page
  navigate('/survey2');
};


  const isNextDisabled = !selectedRole || (selectedRole === 'Other' && !otherRole.trim());

  return (
    <div className="survey1-container">
      <div className="survey1-background">
        <img src={people} alt="Professional team" className="background-image" />
        <div className="background-overlay"></div>
      </div>
      
      <div className="survey1-content">
        <div className="survey1-left">
          <h1 className="survey1-title">Preferred Role</h1>
          <p className="survey1-subtitle">Choose the role you're most comfortable with!</p>
        </div>
        
        <div className="survey1-right">
          <div className="role-selection-card">
            <h2 className="card-title">Preferred Role</h2>
            <p className="card-instruction">You can select 1 role only</p>
            
            <div className="roles-grid">
              {roles.map((role, index) => (
                <div key={index} className="role-option">
                  <input
                    type="radio"
                    id={`role-${index}`}
                    name="preferredRole"
                    value={role}
                    checked={selectedRole === role}
                    onChange={() => handleRoleSelect(role)}
                    className="role-radio"
                  />
                  <label htmlFor={`role-${index}`} className="role-label">
                    {role}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="other-role-checkbox">
              <label className="skill-header">
                <input type="checkbox" checked={otherSelected} onChange={handleOtherToggle} />
                <span className="role-label">Others</span>
              </label>
            </div>
            {otherSelected && (
              <div className="other-role-section">
                <label htmlFor="otherRole" className="other-label">Specify:</label>
                <input
                  type="text"
                  id="otherRole"
                  value={otherRole}
                  onChange={handleOtherRoleChange}
                  className="other-input"
                />
              </div>
            )}

            <div className="actions single-right">
              <button 
                className={`next-button ${isNextDisabled ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={isNextDisabled}
              >
                Next
              </button>
            </div>
          </div>

          {/* Mastery level removed in Survey1; moved to Survey2 per requirement */}
        </div>
      </div>
    </div>
  );
};

export default Survey1;

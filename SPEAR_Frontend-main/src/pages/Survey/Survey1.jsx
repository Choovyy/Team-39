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

  // UI/UX helpers: font-size control and progress step
  const [fontSize, setFontSize] = useState('16px');
  const surveyStep = 1; // used by progress indicator

  const applyFontSize = () => ({ fontSize });

  // Accessibility: keyboard-friendly radio selection
  const handleKeySelect = (e, role) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoleSelect(role);
    }
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
    <div className="survey1-container min-h-screen flex items-center justify-center" style={{ background: 'rgb(248 250 252 / var(--tw-bg-opacity, 1))', ...applyFontSize() }}>
      <div className="w-full max-w-3xl p-6">
        {/* Progress + font-size controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-2/3">
            <div className="text-sm text-gray-600">Step {surveyStep} of 3</div>
            <div className="h-2 bg-gray-200 rounded mt-1">
              <div className="h-2 bg-teal rounded" style={{ width: `${(surveyStep / 3) * 100}%` }} aria-hidden></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Decrease font size" onClick={() => setFontSize('14px')} className="px-2 py-1 border rounded">A-</button>
            <button aria-label="Normal font size" onClick={() => setFontSize('16px')} className="px-2 py-1 border rounded">A</button>
            <button aria-label="Increase font size" onClick={() => setFontSize('18px')} className="px-2 py-1 border rounded">A+</button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-xl font-semibold text-teal mb-2">Preferred Role</h1>
          <p className="text-gray-600 mb-4">Choose the role you're most comfortable with. Only one selection is required.</p>

          <div role="radiogroup" aria-label="Preferred role options" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {roles.map((role, index) => (
              <div
                key={role}
                tabIndex={0}
                onKeyDown={(e) => handleKeySelect(e, role)}
                className={`p-3 rounded border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal ${selectedRole === role ? 'border-teal bg-teal/10' : 'border-gray-200'}`}
                onClick={() => handleRoleSelect(role)}
                aria-checked={selectedRole === role}
                role="radio"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={`role-${index}`}
                    name="preferredRole"
                    value={role}
                    checked={selectedRole === role}
                    onChange={() => handleRoleSelect(role)}
                    className="hidden"
                    aria-hidden
                  />
                  <span className="text-gray-800 font-medium">{role}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={otherSelected} onChange={handleOtherToggle} className="form-checkbox" />
              <span className="text-gray-800">Other (specify)</span>
            </label>
            {otherSelected && (
              <div className="mt-2">
                <label htmlFor="otherRole" className="sr-only">Specify other role</label>
                <input
                  type="text"
                  id="otherRole"
                  value={otherRole}
                  onChange={handleOtherRoleChange}
                  className="w-full border rounded-md p-2"
                  placeholder="e.g. DevOps Engineer"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`px-4 py-2 rounded ${isNextDisabled ? 'bg-gray-300 text-gray-500' : 'bg-teal text-white hover:bg-teal-dark'}`}
            >
              Next
            </button>
          </div>

          {/* NOTE FOR BACKEND: Survey step saved to localStorage here. Backend endpoint to persist surveyData (step1) should be implemented by backend team. */}
        </div>
      </div>
    </div>
  );
}

export default Survey1;

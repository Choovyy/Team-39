import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import people from '../../assets/imgs/people.png';
import '../../styles/Survey/Survey3.css';
import axios from 'axios';

const PROJECTS = [
  'Web Applications',
  'Mobile Apps', 
  'Game Development',
  'E-commerce Systems',
  'Task Management Systems',
  'AI Development'
];

const Survey3 = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => PROJECTS.reduce((a, p) => ({ ...a, [p]: false }), {}));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('survey3Data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.interests && Array.isArray(data.interests)) {
          const newSelected = PROJECTS.reduce((a, p) => ({ ...a, [p]: false }), {});
          data.interests.forEach(interest => {
            if (PROJECTS.includes(interest.name)) {
              newSelected[interest.name] = true;
            }
          });
          setSelected(newSelected);
        }
      } catch (error) {
        console.error('Error loading survey3 data:', error);
      }
    }
  }, []);

  const hasAny = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const toggle = (project) => setSelected((prev) => ({ ...prev, [project]: !prev[project] }));

  const handleNext = async () => {
    if (!hasAny) return;

    // Save Survey3 step locally
    const picks = PROJECTS.filter((p) => selected[p]).map((p) => ({ name: p }));
    localStorage.setItem('survey3Data', JSON.stringify({ interests: picks }));

    // Combine all survey steps
    const allData = JSON.parse(localStorage.getItem('surveyData') || '{}');
    const step1 = allData.step1 || {};
    const step2 = allData.step2 || {};
    const step3 = { projectInterests: picks.map(p => p.name) };

    // Transform technical skills to string array
    const technicalSkills = (step2.selections || []).map(s => ({
      skill: s.skill,
      masteryLevel: s.masteryLevel || 1 // default to 1 if not provided
    }));

// Build SurveyDTO for backend
    const surveyDTO = {
      preferredRoles: [step1.preferredRole].filter(Boolean),
      technicalSkills: technicalSkills,   // ✅ now objects not strings
      projectInterests: step3.projectInterests,
      personality: "Unknown"
    };

    setLoading(true);
    try {
      // Send to backend (replace with your actual API URL)
      const userId = 2; // Replace with actual user ID (from auth context or JWT)
      console.log("📦 Survey Payload:", JSON.stringify(surveyDTO, null, 2));

       await axios.post(`http://localhost:8080/api/survey/save/${userId}`, surveyDTO);
      console.log('✅ Survey saved successfully');
      
      // Optionally clear localStorage
      localStorage.removeItem('surveyData');
      localStorage.removeItem('survey3Data');

      // Navigate to dashboard or next page
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Failed to save survey:', error);
      alert('Failed to save survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey3-container">
      <div className="survey3-background">
        <img src={people} alt="Professional team" className="background-image" />
        <div className="background-overlay"></div>
      </div>

      <div className="survey3-content">
        <div className="survey3-left">
          <div className="projects-card">
            <h2 className="card-title">Project Interest</h2>
            <p className="card-instruction">Select one or more interests</p>

            <div className="projects-grid">
              {PROJECTS.map((project) => (
                <div key={project} className={`project-item ${selected[project] ? 'selected' : ''}`}>
                  <label className="project-header">
                    <input type="checkbox" checked={selected[project]} onChange={() => toggle(project)} />
                    <span>{project}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="actions">
              <button className="back-button" onClick={() => navigate('/survey2')}>Back</button>
              <button 
                className={`next-button ${!hasAny ? 'disabled' : ''}`} 
                disabled={!hasAny || loading} 
                onClick={handleNext}
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="survey3-right">
          <h1 className="survey3-title">Project Interest</h1>
          <p className="survey3-subtitle">Choose the projects you're most comfortable with!</p>
        </div>
      </div>
    </div>
  );
};

export default Survey3;

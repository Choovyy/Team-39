import React, { useMemo, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../services/AuthContext';
import axios from 'axios';
import people from '../../assets/imgs/people.png';
import '../../styles/Survey/Survey2.css';

const SKILLS = [
  'C Language',
  'HTML and CSS',
  'PHP',
  'JavaScript',
  'Java ',
  'Python  '
];

const Survey2 = () => {
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
          if (err.response?.status && err.response.status !== 404) {
            console.error("User profile check error:", err);
          }
        });
    }
  }, [authState, navigate]);

  const [selectedSkills, setSelectedSkills] = useState(() => {
    return SKILLS.reduce((acc, skill) => {
      acc[skill] = { selected: false, level: 0 };
      return acc;
    }, {});
  });
  const [otherSkill, setOtherSkill] = useState('');
  const [otherSkillLevel, setOtherSkillLevel] = useState(0);
  const [otherSelected, setOtherSelected] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');

    if (savedData.step2 && savedData.step2.selections) {
      const newSelectedSkills = SKILLS.reduce((acc, skill) => {
        acc[skill] = { selected: false, level: 0 };
        return acc;
      }, {});

      savedData.step2.selections.forEach(selection => {
        if (SKILLS.includes(selection.skill)) {
          newSelectedSkills[selection.skill] = {
            selected: true,
            level: selection.masteryLevel || 0
          };
        } else {
          setOtherSkill(selection.skill);
          setOtherSkillLevel(selection.masteryLevel || 0);
          setOtherSelected(true);
        }
      });

      setSelectedSkills(newSelectedSkills);
    }
  }, []);

  const hasAnySelection = useMemo(() => {
    const anyPreset = Object.values(selectedSkills).some((s) => s.selected && s.level > 0);
    const anyOther = otherSelected && otherSkill.trim().length > 0 && otherSkillLevel > 0;
    return anyPreset || anyOther;
  }, [selectedSkills, otherSelected, otherSkill, otherSkillLevel]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: { ...prev[skill], selected: !prev[skill].selected }
    }));
  };

  const updateSkillLevel = (skill, level) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: { ...prev[skill], level: parseInt(level) }
    }));
  };

  // UI helpers for Survey2
  const [fontSize, setFontSize] = useState('16px');
  const surveyStep = 2;
  const applyFontSize = () => ({ fontSize });

  const formatPercent = (v) => `${v}%`;

  const handleNext = () => {
    if (!hasAnySelection) return;

    const selections = [];
    SKILLS.forEach((skill) => {
      const s = selectedSkills[skill];
      if (s.selected && s.level > 0) {
        selections.push({ skill, masteryLevel: s.level });
      }
    });
    if (otherSelected && otherSkill.trim() && otherSkillLevel > 0) {
      selections.push({ skill: otherSkill.trim(), masteryLevel: otherSkillLevel });
    }

    // Load previous survey data
    const allSurveyData = JSON.parse(localStorage.getItem('surveyData') || '{}');

    // Save current step (step2) data
    allSurveyData.step2 = { selections };

    // Save everything together
    localStorage.setItem('surveyData', JSON.stringify(allSurveyData));

    navigate('/survey3');
  };

  return (
    <div className="survey2-container min-h-screen flex items-center justify-center" style={{ background: 'rgb(248 250 252 / var(--tw-bg-opacity, 1))', ...applyFontSize() }}>
      <div className="w-full max-w-3xl p-6">
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
          <h1 className="text-xl font-semibold text-teal mb-2">Technical Skills</h1>
          <p className="text-gray-600 mb-4">Select your skills and rate your proficiency. Use the sliders to indicate your level.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {SKILLS.map((skill) => {
              const sk = selectedSkills[skill];
              return (
                <div key={skill} className={`p-3 rounded border ${sk.selected ? 'border-teal bg-teal/10' : 'border-gray-200'}`}>
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={sk.selected}
                        onChange={() => toggleSkill(skill)}
                        aria-label={`Select ${skill}`}
                      />
                      <span className="font-medium">{skill}</span>
                    </div>
                    <div className="text-sm text-gray-500">{formatPercent(sk.level)}</div>
                  </label>

                  {sk.selected && (
                    <div className="mt-3 transition-slide-in">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sk.level}
                        onChange={(e) => updateSkillLevel(skill, e.target.value)}
                        className="w-full"
                        aria-label={`${skill} mastery level`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`p-3 rounded border ${otherSelected ? 'border-teal bg-teal/10' : 'border-gray-200'}`}>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={otherSelected}
                onChange={() => setOtherSelected(!otherSelected)}
                aria-label="Select other skill"
              />
              <span className="font-medium">Others</span>
            </label>
            {otherSelected && (
              <div className="mt-2">
                <input
                  type="text"
                  value={otherSkill}
                  onChange={(e) => setOtherSkill(e.target.value)}
                  placeholder="Enter another skill"
                  className="w-full border rounded-md p-2 mb-2"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={otherSkillLevel}
                  onChange={(e) => setOtherSkillLevel(parseInt(e.target.value))}
                  className="w-full"
                  aria-label="Other skill mastery level"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => navigate('/survey1')}>Back</button>
            <button className={`px-4 py-2 rounded ${!hasAnySelection ? 'bg-gray-300 text-gray-500' : 'bg-teal text-white hover:bg-teal-dark'}`} disabled={!hasAnySelection} onClick={handleNext}>Next</button>
          </div>

          {/* NOTE FOR BACKEND: Survey step data saved to localStorage here. Backend should implement an endpoint to persist step2 when available. */}
        </div>
      </div>
    </div>
  );
}

export default Survey2;



import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../services/AuthContext';
import LogoutButton from '../../../components/Auth/LogoutButton';

/* Dashboard page: fetches AI match recommendations and displays them.
   It calls backend endpoint /api/survey/match with the student's survey answers (pulled from backend or local state TBD).
   For first version we request matches using a minimal payload requiring that survey already exists server side.
*/

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const address = window.location.hostname;

  const fetchMatches = async () => {
    setLoading(true); setError(null);
    try {
      const uid = authState.uid;
      if(!uid){
        throw new Error('User ID not available; ensure you are logged in.');
      }
      const resp = await axios.get(`http://${address}:8080/api/survey/match/user/${uid}`, {
        headers: { Authorization: authState.token ? `Bearer ${authState.token}` : undefined }
      });
      setMatches(resp.data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-teal">AI Match Recommendations</h1>
        <LogoutButton />
      </div>
      {loading && <p className="text-gray-600">Loading matches...</p>}
      {error && <div className="text-red-600 mb-4">{String(error)}</div>}
      {!loading && matches?.length === 0 && !error && (
        <p className="text-gray-500">No matches yet.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches?.map((m, idx) => (
          <div key={idx} className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              {m.profilePicture ? (
                <img src={m.profilePicture} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center text-white font-semibold">
                  {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-teal">{m.name || 'Unknown User'}</h2>
                <p className="text-sm text-gray-500">Overall Score: {m.overallScore?.toFixed?.(2) ?? 'N/A'}</p>
              </div>
            </div>
            <div className="text-sm space-y-1">
                <p><span className="font-medium">Personality:</span> {m.personality || 'No Personality'}</p>
                <p><span className="font-medium">Skills:</span> {
                  Array.isArray(m.technicalSkills)
                    ? m.technicalSkills.map(ts => typeof ts === 'object' && ts.skill ? ts.skill : ts).join(', ')
                    : 'No Skills'
                }</p>
                <p><span className="font-medium">Roles:</span> {
                  Array.isArray(m.preferredRoles)
                    ? m.preferredRoles.map(r => typeof r === 'object' && r.role ? r.role : r).join(', ')
                    : 'No Role'
                }</p>
                <p><span className="font-medium">Interests:</span> {
                  Array.isArray(m.projectInterests)
                    ? m.projectInterests.map(pi => typeof pi === 'object' && pi.name ? pi.name : pi).join(', ')
                    : 'No Preferences'
                }</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-600">
                <div>Skill: {m.skillScore?.toFixed?.(2) ?? '—'}</div>
                <div>Personality: {m.personalityScore?.toFixed?.(2) ?? '—'}</div>
                <div>Interest: {m.projectInterestScore?.toFixed?.(2) ?? '—'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={fetchMatches} className="px-4 py-2 bg-teal text-white rounded hover:bg-teal/90 transition">
          Refresh Matches
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
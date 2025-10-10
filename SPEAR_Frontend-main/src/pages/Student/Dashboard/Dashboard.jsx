import React, { useEffect, useState, useContext } from 'react';
import { Info, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../../../services/AuthContext';
import LogoutButton from '../../../components/Auth/LogoutButton';
import Navbar from '../../../components/Navbar/Navbar';
import ViewPersonality from '../../../components/Modals/ViewPersonality';
import { API_BASE } from '../../../services/apiBase';

/* Dashboard page: fetches AI match recommendations and displays them.
   NOTE (backend): match objects should include contact fields:
     - email (string)
     - github | githubUrl | githubHandle (string)
     - facebook | facebookUrl | facebookHandle (string)
   Backend devs: ensure these fields are present in the match payload if available.
*/

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null); // UI: track hovered/focused card
  // Filters
  const [search, setSearch] = useState("");
  const [personalityFilter, setPersonalityFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  // Helper: normalize plain text values from possibly nested objects
  const normalizeText = (val) => {
    if (val == null) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      // Try common keys in order
      const keys = ['fullName', 'name', 'title', 'label', 'value', 'text'];
      for (const k of keys) {
        if (val[k] && typeof val[k] === 'string') return val[k].trim();
      }
      // Try firstName/lastName composition
      const composed = [val.firstName || val.firstname, val.lastName || val.lastname]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (composed) return composed;
      return '';
    }
    return '';
  };

  const buildDisplayName = (m) => {
    const fromName = normalizeText(m?.name);
    if (fromName) return fromName;
    const fromNested = normalizeText(m?.user) || normalizeText(m?.profile) || '';
    if (fromNested) return fromNested;
    const composed = [m?.firstName || m?.firstname, m?.lastName || m?.lastname]
      .filter(Boolean)
      .join(' ')
      .trim();
    return composed || 'Unknown User';
  };
  
  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Normalize contact values into safe hrefs for anchors
  
  // Normalize helper for strings
  const normalize = (s) => (s ?? '').toString().trim().toLowerCase();

  // Cache of my own contact info to support robust self-exclusion
  const [myEmail, setMyEmail] = useState('');

  // Fetch the logged-in user's email once (AuthContext doesn't expose email)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (!authState?.uid) return;
        const resp = await axios.get(`${API_BASE}/get-student/${authState.uid}` , {
          headers: { Authorization: authState.token ? `Bearer ${authState.token}` : undefined }
        });
        const email = resp?.data?.email ? String(resp.data.email) : '';
        setMyEmail(email);
      } catch (e) {
        // Non-fatal: if email not available, UID matching will still work
        // console.debug('Failed to fetch current user email for self-exclusion', e);
      }
    };
    fetchMe();
  }, [authState?.uid, authState?.token]);

  // Determine if a match entry is the logged-in user (by uid or email)
  const isSelf = (m) => {
    try {
      const myUid = authState?.uid != null ? String(authState.uid) : '';
      const myEmailNorm = normalize(myEmail);

      const matchUid =
        m?.uid != null ? String(m.uid)
        : m?.userId != null ? String(m.userId)
        : m?.id != null ? String(m.id)
        : m?.matchedUserId != null ? String(m.matchedUserId)
        : m?.studentId != null ? String(m.studentId)
        : m?.user?.id != null ? String(m.user.id)
        : '';

      const matchEmails = [m?.email, m?.personalEmail, m?.contactEmail, m?.user?.email]
        .filter(Boolean)
        .map((e) => normalize(e));

      if (myUid && matchUid && myUid === matchUid) return true;
      if (myEmailNorm && matchEmails.includes(myEmailNorm)) return true;
      return false;
    } catch {
      return false;
    }
  };


  const fetchMatches = async () => {
    setLoading(true); setError(null);
    try {
      const uid = authState.uid;
      if(!uid){
        throw new Error('User ID not available; ensure you are logged in.');
      }
      const resp = await axios.get(`${API_BASE}/api/survey/match/user/${uid}`, {
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

  // Reset to first page whenever filters/search/data change
  useEffect(() => {
    setPage(1);
  }, [search, personalityFilter, skillFilter, roleFilter, interestFilter, matches.length]);

  

  
  const buildOutlookComposeLink = (rawEmail, matchObj) => {
    if (!rawEmail) return null;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(rawEmail)) return null;

    const subject = encodeURIComponent('Collaboration Opportunity - CapstoneConnect');
    const nameForEmail = buildDisplayName(matchObj);
    const bodyLines = [
      `Hi ${nameForEmail || 'there'},`,
      ``,
      `I saw your profile on the CapstoneConnect Match Dashboard and would like to collaborate on a project / form a team.`,
      `Preferred Roles: ${
        Array.isArray(matchObj?.preferredRoles)
          ? matchObj.preferredRoles.map(r => (r.role || r)).join(', ')
          : 'N/A'
      }`,
      `Skills: ${
        Array.isArray(matchObj?.technicalSkills)
          ? matchObj.technicalSkills.map(s => (s.skill || s)).join(', ')
          : 'N/A'
      }`,
      `Project Interests: ${
        Array.isArray(matchObj?.projectInterests)
          ? matchObj.projectInterests.join(', ')
          : 'N/A'
      }`,
      ``,
      `Let me know if you're interested.`,
      ``,
      `Thanks,`,
      `${authState?.name || 'A Capstone User'}`
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    // Outlook Web compose deeplink
    return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(rawEmail)}&subject=${subject}&body=${body}`;
  };

  
  const normalizeLink = (value, type) => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;
    if (type === 'github') {
      const username = v.replace(/^@/, '');
      if (/^https?:\/\//i.test(username)) return username;
      return `https://github.com/${username}`;
    }
    if (type === 'facebook') {
      if (/^https?:\/\//i.test(v)) return v;
      return `https://facebook.com/${v.replace(/^@/, '')}`;
    }
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  // Helper: personality title (first phrase before '(' or '.')
  const getPersonalityTitle = (p) => {
    if (!p) return '';
    if (typeof p === 'string') return p.split('(')[0].split('.')[0].trim();
    if (typeof p === 'object') {
      const fromObj = normalizeText(p.title || p.name || p.type || p.archetype);
      return fromObj.split('(')[0].split('.')[0].trim();
    }
    return '';
  };

  // Extract descriptive traits: take text inside the first parentheses BEFORE "Scores"
  const extractTraits = (p) => {
    if (!p) return '';
    if (typeof p === 'object') {
      if (Array.isArray(p.traits)) return p.traits.filter(Boolean).join(', ');
      if (typeof p.traits === 'string') return p.traits;
      if (typeof p.summary === 'string') return p.summary;
      return '';
    }
    const beforeScores = p.split(/Scores:/i)[0] || p;
    const paren = beforeScores.match(/\(([^)]*)\)/);
    return paren && paren[1] ? paren[1].trim() : '';
  };

  // Team visibility rule:
  // - Hide users who are already in a team
  // - Exception: keep them if they are the team leader AND the team is not full (still recruiting)
  // Notes: This uses optional fields on match objects if backend provides them.
  // Supported hints: isInTeam, teamId, teams[], isTeamLeader, roleInTeam, leader, teamFull, teamSize, maxMembers, recruitmentOpen
  const teamEligible = (m) => {
    try {
      const isInTeam = m?.isInTeam === true || m?.teamId != null || (Array.isArray(m?.teams) && m.teams.length > 0);
      if (!isInTeam) return true; // not in a team => keep

      const isLeader = m?.isTeamLeader === true || m?.leader === true || String(m?.roleInTeam || '').toUpperCase() === 'LEADER';
      const teamSize = Number(m?.teamSize || 0);
      const maxMembers = Number(m?.maxMembers || 0);
      const derivedFull = maxMembers > 0 && teamSize >= maxMembers;
      const teamFull = m?.teamFull === true || derivedFull;
      const recruitmentOpen = m?.recruitmentOpen === true || (!teamFull && maxMembers > 0);

      if (isLeader && !teamFull && recruitmentOpen) return true; // leader of not-full team => keep
      return false; // otherwise hide (already in a team)
    } catch {
      return true; // in case of unexpected shape, don't hide
    }
  };

  // All possible archetypes defined in backend PersonalityService (deriveArchetype)
  const ALL_ARCHETYPES = [
    'Structured Innovator',
    'Agile Collaborator',
    'Visionary Explorer',
    'Versatile Contributor'
  ];
  
  // Pagination helper: build an ellipsis range like: 1 … 4 5 6 … N
  const getPageRange = (current, total, delta = 1) => {
    const range = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('...');
    if (total > 1) range.push(total);
    return range;
  };
  // Build choices: union of backend list + any unexpected/new ones present in data
  const personalities = Array.from(new Set([
    ...ALL_ARCHETYPES,
    ...matches.map(m => getPersonalityTitle(m.personality)).filter(Boolean)
  ])).sort();
  const skills = Array.from(new Set(
    matches.flatMap(m => Array.isArray(m.technicalSkills)
      ? m.technicalSkills.map(ts => (typeof ts === 'object' && ts.skill ? ts.skill : ts))
      : [])
    .filter(Boolean)
  ));
  const roles = Array.from(new Set(
    matches.flatMap(m => Array.isArray(m.preferredRoles)
      ? m.preferredRoles.map(r => (typeof r === 'object' && r.role ? r.role : r))
      : [])
    .filter(Boolean)
  ));
  const interests = Array.from(new Set(
    matches
      .flatMap(m => Array.isArray(m.projectInterests) ? m.projectInterests : [])
      .map(pi => normalizeText(pi))
      .filter(Boolean)
  ));

  // Filtering logic + robust self exclusion by uid/email
  const filteredMatches = matches.filter(m => {
    if (isSelf(m)) return false;
    // Team-based visibility
    if (!teamEligible(m)) return false;
    const displayName = buildDisplayName(m);
    const nameMatch = !search || displayName.toLowerCase().includes(search.toLowerCase());
    const personalityTitle = getPersonalityTitle(m.personality);
    const personalityMatch = !personalityFilter || personalityTitle === personalityFilter;
    const skillMatch = !skillFilter || (Array.isArray(m.technicalSkills) && m.technicalSkills.some(ts => {
      const val = typeof ts === 'object' && ts.skill ? ts.skill : ts; return val === skillFilter; }));
    const roleMatch = !roleFilter || (Array.isArray(m.preferredRoles) && m.preferredRoles.some(r => { const val = typeof r === 'object' && r.role ? r.role : r; return val === roleFilter;}));
    const interestMatch = !interestFilter || (Array.isArray(m.projectInterests) && m.projectInterests.some(pi => normalizeText(pi) === interestFilter));
    return nameMatch && personalityMatch && skillMatch && roleMatch && interestMatch;
  });

  // Sort by highest overallScore first
  const sortedMatches = [...filteredMatches].sort((a, b) => (Number(b.overallScore) || 0) - (Number(a.overallScore) || 0));

  // Pagination math and window
  const totalPages = Math.max(1, Math.ceil(sortedMatches.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedMatches = sortedMatches.slice(start, start + PAGE_SIZE);

  // Clamp page if filtered data shrinks
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-teal p-4 md:px-20 lg:px-28 pt-20 md:pt-12">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-teal">AI Match Recommendations</h1>
        </div>
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 min-w-[180px]"
          />
          <select value={personalityFilter} onChange={e => setPersonalityFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Personalities</option>
            {personalities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Skills</option>
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={interestFilter} onChange={e => setInterestFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Project Interests</option>
            {interests.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <button type="button" onClick={() => { setSearch(""); setPersonalityFilter(""); setSkillFilter(""); setRoleFilter(""); setInterestFilter(""); }} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded border">Clear</button>
          <button
            type="button"
            onClick={fetchMatches}
            disabled={loading}
            title="Refresh matches"
            aria-label="Refresh matches"
            className={`p-2 rounded border transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        {loading && <p className="text-gray-600">Loading matches...</p>}
        {error && <div className="text-red-600 mb-4">{String(error)}</div>}
        {!loading && filteredMatches?.length === 0 && !error && (
          <p className="text-gray-500">No matches found.</p>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {paginatedMatches?.map((m, idx) => {
            const email = m.email;
            const outlookHref = buildOutlookComposeLink(email, m);
            const githubHref = normalizeLink(m.github || m.githubUrl || m.githubHandle, 'github');
            const facebookHref = normalizeLink(m.facebook || m.facebookUrl || m.facebookHandle, 'facebook');
            const allRoles = Array.isArray(m.preferredRoles)
              ? m.preferredRoles.map(r => (typeof r === 'object' && r?.role ? r.role : r)).filter(Boolean)
              : (Array.isArray(m.preferredRoles) ? m.preferredRoles : []);
            const primaryRole = allRoles[0] || '';
            const secondaryRoles = allRoles.slice(1);
            const skillsList = Array.isArray(m.technicalSkills)
              ? m.technicalSkills.map(ts => (typeof ts === 'object' && ts.skill ? ts.skill : ts)).filter(Boolean)
              : [];

            return (
              <div
                key={start + idx}
                // Accessible hover/focus region; keyboard users can tab to reveal panel
                tabIndex={0}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                // UI change: add overflow-hidden so the sliding panel is clipped inside the card (stays within card bounds)
                className="relative overflow-hidden border rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-labelledby={`match-${idx}-name`}
              >
                {/* Match badge */}
                <div className="absolute top-4 right-4 text-right">
                  <div className="font-semibold text-base" style={{ color: '#1e293b' }}>
                    {m.overallScore?.toFixed?.(0) ?? '—'}% Match
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 pr-28">
                  <div className="flex items-start gap-3">
                    {m.profilePicture ? (
                      <img src={m.profilePicture} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white font-semibold">
                        {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 id={`match-${idx}-name`} className="font-semibold text-teal text-lg">{buildDisplayName(m)}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium mr-1">Primary:</span>
                        {primaryRole ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-600 border">
                            {primaryRole}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-400 border">—</span>
                        )}
                      </div>
                      {secondaryRoles.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium mr-1">Secondary:</span>
                          {secondaryRoles.slice(0, 6).map((role, i) => (
                            <span key={`sec-top-${i}`} className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-600 border">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium">Socials:</span>
                        {outlookHref && (
                          <a href={outlookHref} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-gray-100" title={`Email ${m.name} via Outlook`} aria-label={`Email ${m.name} via Outlook`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                              <rect x="20" y="10" width="38" height="44" rx="4" fill="#0A64AD"/>
                              <path d="M6 20h34c1.657 0 3 1.343 3 3v18c0 1.657-1.343 3-3 3H6c-1.657 0-3-1.343-3-3V23c0-1.657 1.343-3 3-3z" fill="#ffffff" stroke="#0A64AD" strokeWidth="2"/>
                              <path d="M6 23l17 11 17-11" fill="none" stroke="#0A64AD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="46" cy="32" r="11" fill="#ffffff" opacity="0.18"/>
                              <text x="46" y="36" textAnchor="middle" fontSize="14" fontFamily="Segoe UI, Arial" fontWeight="700" fill="#ffffff">O</text>
                            </svg>
                          </a>
                        )}
                        {githubHref ? (
                          <a href={githubHref} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-gray-100" title="Open GitHub profile" aria-label="Open GitHub profile">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#181717" />
                              <path d="M9.25 17.75c-.1-.3-.17-.77-.17-1.38 0-1.02.35-1.68.75-2.02-2.48-.28-3.83-1.14-3.83-3.02 0-.84.33-1.54.88-2.08-.09-.29-.38-1.07.08-2.02 0 0 .7-.23 2.3.88a8.1 8.1 0 0 1 4.18 0c1.6-1.11 2.3-.88 2.3-.88.46.95.17 1.73.08 2.02.55.54.88 1.24.88 2.08 0 1.88-1.36 2.74-3.84 3.02.53.45.82 1.15.82 2.16 0 .86-.06 1.55-.06 1.76 0 .23-.17.5-.64.42A6.43 6.43 0 0 1 12 18.5a6.43 6.43 0 0 1-1.69-.22c-.47.08-.64-.19-.64-.42Z" fill="#fff"/>
                            </svg>
                          </a>
                        ) : (
                          <span className="p-1 opacity-30 cursor-not-allowed" aria-disabled="true" title="No GitHub provided">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#181717" />
                              <path d="M9.25 17.75c-.1-.3-.17-.77-.17-1.38 0-1.02.35-1.68.75-2.02-2.48-.28-3.83-1.14-3.83-3.02 0-.84.33-1.54.88-2.08-.09-.29-.38-1.07.08-2.02 0 0 .7-.23 2.3.88a8.1 8.1 0 0 1 4.18 0c1.6-1.11 2.3-.88 2.3-.88.46.95.17 1.73.08 2.02.55.54.88 1.24.88 2.08 0 1.88-1.36 2.74-3.84 3.02.53.45.82 1.15.82 2.16 0 .86-.06 1.55-.06 1.76 0 .23-.17.5-.64.42A6.43 6.43 0 0 1 12 18.5a6.43 6.43 0 0 1-1.69-.22c-.47.08-.64-.19-.64-.42Z" fill="#fff"/>
                            </svg>
                          </span>
                        )}
                        {facebookHref ? (
                          <a href={facebookHref} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-gray-100" title="Open Facebook profile" aria-label="Open Facebook profile">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#1877F2" />
                              <path d="M13.3 8.5H15V6.1c-.3-.04-.98-.1-1.86-.1-1.84 0-3.1 1.15-3.1 3.25v1.8H8v2.3h2.04V19h2.46v-5.65h2.04l.33-2.3h-2.37v-1.6c0-.66.18-1.1 1.8-1.1Z" fill="#fff"/>
                            </svg>
                          </a>
                        ) : (
                          <span className="p-1 opacity-30 cursor-not-allowed" aria-disabled="true" title="No Facebook provided">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#1877F2" />
                              <path d="M13.3 8.5H15V6.1c-.3-.04-.98-.1-1.86-.1-1.84 0-3.1 1.15-3.1 3.25v1.8H8v2.3h2.04V19h2.46v-5.65h2.04l.33-2.3h-2.37v-1.6c0-.66.18-1.1 1.8-1.1Z" fill="#fff"/>
                            </svg>
                          </span>
                        )}
                        </div>
                      </div>
                  </div>
                </div>

                <div className="text-sm space-y-3 mb-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Personality:</span>{' '}
                    {m.personality ? getPersonalityTitle(m.personality) : 'No Personality'}
                    {m.personality && (
                      <button
                        className="ml-2 inline-flex items-center justify-center text-teal hover:text-teal/80"
                        onClick={() => { setSelectedMatch(m); setModalOpen(true); }}
                        title="More info"
                        aria-label={`View more about ${m.name || 'this user'}'s personality`}
                      >
                        <Info size={18} strokeWidth={2} />
                      </button>
                    )}
                  </p>
                  {m.personality && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Traits:</span>{' '}
                      {extractTraits(m.personality) || '—'}
                    </p>
                  )}

                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillsList.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* contact slide panel removed to match design; icons shown under name */}

                {/* Score rows */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-sm w-24 whitespace-nowrap">
                      <span className="font-semibold">Personality:</span>
                    </div>
                    <div className="text-sm w-16 text-right">
                      <span className="font-bold" style={{ color: '#7c2d12' }}>{m.personalityScore?.toFixed?.(2) ?? '—'}%</span>
                    </div>
                    <div className="flex-1 max-w-[300px]">
                      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full" style={{ backgroundColor: '#dc2626', width: `${Math.max(0, Math.min(100, Number(m.personalityScore || 0)))}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm w-24 whitespace-nowrap">
                      <span className="font-semibold">Skill:</span>
                    </div>
                    <div className="text-sm w-16 text-right">
                      <span className="font-bold" style={{ color: '#166534' }}>{m.skillScore?.toFixed?.(2) ?? '—'}%</span>
                    </div>
                    <div className="flex-1 max-w-[300px]">
                      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full" style={{ backgroundColor: '#16a34a', width: `${Math.max(0, Math.min(100, Number(m.skillScore || 0)))}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm w-24 whitespace-nowrap">
                      <span className="font-semibold">Interest:</span>
                    </div>
                    <div className="text-sm w-16 text-right">
                      <span className="font-bold" style={{ color: '#7c2d12' }}>{m.projectInterestScore?.toFixed?.(2) ?? '—'}%</span>
                    </div>
                    <div className="flex-1 max-w-[300px]">
                      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full" style={{ backgroundColor: '#ea580c', width: `${Math.max(0, Math.min(100, Number(m.projectInterestScore || 0)))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2 select-none">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1.5 text-sm rounded border ${
                page === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              aria-label="Previous page"
            >
              Prev
            </button>

            {getPageRange(page, totalPages, 1).map((item, i) => (
              item === '...'
                ? <span key={`dots-${i}`} className="px-2 text-sm text-gray-500">…</span>
                : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-9 px-3 py-1.5 text-sm rounded border ${
                      page === item ? 'bg-teal text-white border-teal' : 'hover:bg-gray-100'
                    }`}
                    aria-current={page === item ? 'page' : undefined}
                    aria-label={`Page ${item}`}
                  >
                    {item}
                  </button>
                )
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1.5 text-sm rounded border ${
                page === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
        
        <ViewPersonality
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedMatch(null); }}
          name={selectedMatch?.name}
          personality={selectedMatch?.personality}
        />
      </div>
    </div>
  );
};

export default Dashboard;
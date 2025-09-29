import React, { useEffect, useState, useContext } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import RejectModal from "../../../components/Modals/RejectModal";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Check, X, Info } from "lucide-react";

const TeamApplications = () => {
  const { authState, storeEncryptedId, getDecryptedId } = useContext(AuthContext); 
  const [pendingApplications, setPendingApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, recruitmentId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [activeTab, setActiveTab] = useState("team");
  const [teamInvites, setTeamInvites] = useState([]);
  // Pairwise compatibility scores for each recruitment/application (keyed by trid)
  const [pairwiseScoresByTrid, setPairwiseScoresByTrid] = useState({});
  // Track expanded rows for showing detailed scores
  const [expandedRows, setExpandedRows] = useState(new Set());
  // Info modal for compatibility details
  const [infoModal, setInfoModal] = useState({ isOpen: false, scores: null, name: "" });

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
  
    try {
      const leaderTeamsResponse = await axios.get(`http://${address}:8080/user/${authState.uid}/leader-teams`);
  
      if (leaderTeamsResponse.status === 200 && leaderTeamsResponse.data.length > 0) {
        const teamIds = leaderTeamsResponse.data.map(team => team.tid);
  
        storeEncryptedId("tid", JSON.stringify(teamIds)); 
        const decryptedTeamIds = JSON.parse(getDecryptedId("tid"));
  
        const pendingApplicationsData = await Promise.all(
          decryptedTeamIds.map(async (tid) => {
            const response = await axios.get(`http://${address}:8080/team/${tid}/pending-applications`);
            return response.data;
          })
        );
  
        const flatApps = pendingApplicationsData.flat();
        setPendingApplications(flatApps);

        // Load pairwise compatibility (applicant vs current leader) for each application
        try {
          await loadPairwiseCompatibility(flatApps);
        } catch (e) {
          console.error("Failed loading pairwise compatibility:", e);
        }
      }
  
      const myApplicationsResponse = await axios.get(`http://${address}:8080/student/${authState.uid}/my-applications`);
      if (myApplicationsResponse.status === 200) {
        setMyApplications(myApplicationsResponse.data);
      }
  
      const invitesResponse = await axios.get(`http://${address}:8080/invitations/student/${authState.uid}`);
      if (invitesResponse.status === 200) {
        setTeamInvites(invitesResponse.data);
      }
  
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };
  // Toggle expand/collapse for score details per application row
  const toggleExpand = (trid) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(trid)) next.delete(trid);
      else next.add(trid);
      return next;
    });
  };

  // Determine applicant id from an application object
  const getApplicantId = (app) => {
    return (
      app?.sid ||
      app?.studentId ||
      app?.applicantId ||
      app?.userId ||
      app?.uid ||
      app?.studentUid ||
      null
    );
  };

  // Color helper consistent with Dashboard thresholds
  const getScoreColorClass = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return "text-gray-500";
    if (num >= 75) return "text-green-600";
    if (num > 50) return "text-yellow-600";
    return "text-red-600";
  };

  // Load pairwise compatibility for each application by calling the Dashboard matches API
  // for the applicant and finding the match vs the current leader (authState.uid/email)
  const loadPairwiseCompatibility = async (apps) => {
    if (!Array.isArray(apps) || apps.length === 0) return;

    // Group apps by applicant id, skip those without id
    const byApplicant = apps.reduce((acc, app) => {
      const aid = getApplicantId(app);
      if (!aid) return acc;
      if (!acc[aid]) acc[aid] = [];
      acc[aid].push(app);
      return acc;
    }, {});

    const entries = [];
    const leaderId = authState?.uid;
    const leaderEmail = authState?.email?.toLowerCase?.();

    // Prepare auth header (align with Dashboard)
    const headers = authState?.token ? { Authorization: `Bearer ${authState.token}` } : undefined;

    // Fetch leader's matches once as a fallback source
    let leaderMatches = [];
    try {
      const leaderRes = await axios.get(
        `http://${address}:8080/api/survey/match/user/${leaderId}`,
        { headers }
      );
      leaderMatches = Array.isArray(leaderRes.data) ? leaderRes.data : [];
    } catch (e) {
      console.warn("Could not load leader matches; continuing without fallback.", e);
    }

    // Index leader matches by common identifiers for fast lookup
    const leaderIndex = leaderMatches.reduce(
      (acc, m) => {
        const ids = [m?.id, m?.uid, m?.userId, m?.matchedUserId, m?.user?.id]
          .filter(Boolean)
          .map(String);
        const emails = [m?.email, m?.user?.email]
          .filter(Boolean)
          .map((e) => String(e).toLowerCase());
        const names = [m?.name, m?.user?.name]
          .filter(Boolean)
          .map((n) => String(n).trim().toLowerCase());

        ids.forEach((id) => {
          if (!acc.byId[id] || (m.overallScore ?? 0) > (acc.byId[id].overallScore ?? 0)) acc.byId[id] = m;
        });
        emails.forEach((em) => {
          if (!acc.byEmail[em] || (m.overallScore ?? 0) > (acc.byEmail[em].overallScore ?? 0)) acc.byEmail[em] = m;
        });
        names.forEach((nm) => {
          if (!acc.byName[nm] || (m.overallScore ?? 0) > (acc.byName[nm].overallScore ?? 0)) acc.byName[nm] = m;
        });
        return acc;
      },
      { byId: {}, byEmail: {}, byName: {} }
    );

    // First, handle applications that DO NOT have an applicant id using leader's matches only
    const appsWithoutId = apps.filter((app) => !getApplicantId(app));
    const fallbackEntries = [];
    for (const app of appsWithoutId) {
      const appEmail = (app?.studentEmail || app?.email || app?.contactEmail || app?.user?.email || "")
        .toString()
        .toLowerCase();
      const appName = (app?.studentName || app?.name || app?.user?.name || "")
        .toString()
        .trim()
        .toLowerCase();
      let picked = null;
      if (appEmail && leaderIndex.byEmail[appEmail]) picked = leaderIndex.byEmail[appEmail];
      else if (appName && leaderIndex.byName[appName]) picked = leaderIndex.byName[appName];

      if (picked) {
        fallbackEntries.push([
          app?.trid,
          {
            overall: picked.overallScore,
            skill: picked.skillScore,
            personality: picked.personalityScore,
            interest: picked.projectInterestScore,
          },
        ]);
      }
    }

    // Then proceed with applications that have applicant ids
    await Promise.all(
      Object.entries(byApplicant).map(async ([applicantId, applicantApps]) => {
        try {
          const res = await axios.get(
            `http://${address}:8080/api/survey/match/user/${applicantId}`,
            { headers }
          );
          const matches = Array.isArray(res.data) ? res.data : [];

          // Find the specific match vs leader (by id or by email)
          const leaderMatch = matches.find((m) => {
            const mid = m?.id || m?.uid || m?.userId || null;
            const memail = m?.email ? String(m.email).toLowerCase() : null;
            return (leaderId && mid && String(mid) === String(leaderId)) || (leaderEmail && memail && memail === leaderEmail);
          });

          // If not found via applicant->leader, try leader->applicant using applicant id/email/name
          let fallbackMatch = null;
          if (!leaderMatch) {
            // derive applicant keys from the first app (same applicant for this group)
            const sampleApp = applicantApps[0] || {};
            const appId = getApplicantId(sampleApp);
            const appEmail = (sampleApp?.studentEmail || sampleApp?.email || sampleApp?.contactEmail || sampleApp?.user?.email || "")
              .toString()
              .toLowerCase();
            const appName = (sampleApp?.studentName || sampleApp?.name || sampleApp?.user?.name || "")
              .toString()
              .trim()
              .toLowerCase();

            if (appId && leaderIndex.byId[String(appId)]) fallbackMatch = leaderIndex.byId[String(appId)];
            else if (appEmail && leaderIndex.byEmail[appEmail]) fallbackMatch = leaderIndex.byEmail[appEmail];
            else if (appName && leaderIndex.byName[appName]) fallbackMatch = leaderIndex.byName[appName];
          }

          const picked = leaderMatch || fallbackMatch || null;

          const scores = picked
            ? {
                overall: picked.overallScore,
                skill: picked.skillScore,
                personality: picked.personalityScore,
                interest: picked.projectInterestScore,
              }
            : null;

          // Assign the same pairwise result to all applications from this applicant
          applicantApps.forEach((app) => {
            const trid = app?.trid;
            if (trid != null) entries.push([trid, scores]);
          });
        } catch (err) {
          console.error(`Failed to load matches for applicant ${applicantId}`, err);
          applicantApps.forEach((app) => entries.push([app?.trid, null]));
        }
      })
    );

    const resultMap = { ...Object.fromEntries(fallbackEntries), ...Object.fromEntries(entries) };
    setPairwiseScoresByTrid((prev) => ({ ...prev, ...resultMap }));
  };

  const handleInviteResponse = async (invitationId, isAccepted) => {
    try {
      const endpoint = isAccepted
        ? `http://${address}:8080/invitations/accept/${invitationId}`
        : `http://${address}:8080/invitations/reject/${invitationId}`;

      await axios.put(endpoint);
      toast.success(isAccepted ? "Invitation accepted!" : "Invitation rejected.");
      fetchApplications();
    } catch (error) {
      toast.error("Error processing invitation.");
      console.error(error);
    }
  };

  const handleAccept = async (recruitmentId) => {
    try {
      await axios.post(`http://${address}:8080/student/review/${recruitmentId}`, {
        isAccepted: true,
      });
      toast.success("Application accepted!");
      fetchApplications();  
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to accept application.");
      console.error("Error accepting application:", error);
    }
  };

  const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-700 text-xl font-semibold mb-4">Confirm Acceptance</h2>
            <button
              className="text-gray-500 hover:text-gray-700 mb-4"
              onClick={onClose}
            >
              ✖
            </button>
          </div>
          <p className="text-gray-600">Are you sure you want to accept this application?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-teal text-white px-4 py-2 rounded hover:bg-peach"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleReject = async () => {
    try {
      await axios.post(`http://${address}:8080/student/review/${rejectModal.recruitmentId}`, {
        isAccepted: false,
        leaderReason: rejectReason,
      });
      toast.success("Application rejected.");
      setRejectModal({ isOpen: false, recruitmentId: null });
      setRejectReason("");
      fetchApplications();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reject application.");
      console.error("Error rejecting application:", error);
    }
  };

  // Lightweight modal to show compatibility breakdown
  const InfoModal = ({ isOpen, onClose, scores, title }) => {
    if (!isOpen) return null;
    useEffect(() => {
      if (!isOpen) return;
      const onKey = (e) => {
        if (e.key === "Escape") {
          onClose?.();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);
    const fields = [
      { label: "Personality", val: scores?.personality },
      { label: "Skill", val: scores?.skill },
      { label: "Interest", val: scores?.interest },
    ];
    const overall = Number(scores?.overall);
    const overallColor = Number.isFinite(overall)
      ? overall >= 75
        ? "text-green-700"
        : overall > 50
        ? "text-yellow-700"
        : "text-red-700"
      : "text-gray-600";
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onMouseDown={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Compatibility Details</h2>
              {title && <p className="text-sm text-gray-500">{title}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close details"
            >
              ✖
            </button>
          </div>
          <div className={`mb-3 text-2xl font-bold ${overallColor}`}>
            {Number.isFinite(overall) ? `${overall.toFixed(2)}% Match` : "N/A"}
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            {fields.map(({ label, val }) => {
              const num = Number(val);
              const ok = Number.isFinite(num);
              const pct = ok ? Math.max(0, Math.min(100, num)) : 0;
              const textColor = ok
                ? num >= 75
                  ? "text-green-600"
                  : num > 50
                  ? "text-yellow-600"
                  : "text-red-600"
                : "text-gray-500";
              const barColor = ok
                ? num >= 75
                  ? "bg-green-600"
                  : num > 50
                  ? "bg-yellow-600"
                  : "bg-red-600"
                : "bg-gray-300";
              return (
                <div key={label} className="mb-3 last:mb-0">
                  <div className={`text-base font-medium ${textColor}`}>
                    {label}: {ok ? `${num.toFixed(2)}%` : "N/A"}
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      role="progressbar"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-teal">Loading...</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500 text-white">Pending</span>;
      case "ACCEPTED":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">Accepted</span>;
      case "REJECTED":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white">Rejected</span>;
      case "EXPIRED":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500 text-white">Expired</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-300 text-black">{status}</span>;
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen bg-white">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-gray-900 md:px-20 lg:px-28 pt-8 md:pt-12">
        <div className="overflow-x-auto">
          {/* Pending Applications Table */}
          <div className="min-w-[800px]">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Team Applications</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Pending Applications for My Team</h2>
            
            <div className="overflow-x-auto mb-8">
              <table className="w-full border shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-700 text-white text-center">
                  <tr>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Student Name</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Team Name</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Class</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Role & Reason</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Compatibility Score</th>
                    {/* Added a new column for compatibility scores */}
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                {pendingApplications.length > 0 ? (
                  pendingApplications.map((app) => {
                    const pair = pairwiseScoresByTrid?.[app.trid];
                    const isExpanded = expandedRows.has(app.trid);
                    return (
                      <React.Fragment key={app.trid}>
                      <tr className="hover:bg-gray-100">
                        <td className="border border-gray-300 px-6 py-3 text-gray-900">{app.studentName || "Unknown"}</td>
                        <td className="border border-gray-300 px-6 py-3 text-gray-900">{app.groupName || "No Team Name"}</td>
                        <td className="border border-gray-300 px-6 py-3 text-gray-900">{app.classDescription || "No Class Info"}</td>
                        <td className="border border-gray-300 px-6 py-3 text-gray-900">
                          <p className="font-semibold">{app.role}</p>
                          <p className="text-gray-700">{app.reason}</p>
                        </td>
                        <td className="border border-gray-300 px-6 py-3 text-gray-900 text-left">
                          {pair ? (
                            <div className="space-y-1">
                              {/* Always show Overall */}
                              <div className="flex items-center gap-2">
                                <div>
                                  <span className={getScoreColorClass(pair.overall)}>
                                    {Number.isFinite(Number(pair.overall)) ? `${Number(pair.overall).toFixed(2)}% Match` : "N/A"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  aria-label="View compatibility details"
                                  title="View details"
                                  className="ml-2 inline-flex items-center justify-center rounded p-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                                  onClick={() => setInfoModal({ isOpen: true, scores: pair, name: app.studentName || "Applicant" })}
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Details are rendered in a separate row below to avoid changing this row's height */}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {/* Fallback: only overall available */}
                              {Number.isFinite(Number(app.compatibilityScore)) ? (
                                <div>
                                  <span className="font-semibold">Overall Score: </span>
                                  <span className={getScoreColorClass(app.compatibilityScore)}>
                                    {`${Number(app.compatibilityScore).toFixed(2)}% Match`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">N/A</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-6 py-3 text-center">
                          <div className="flex flex-row justify-center gap-2">
                            <button
                              className="min-w-24 h-10 flex items-center justify-center bg-white border border-green-500 px-3 py-2 rounded-lg hover:bg-green-100 transition-all"
                              onClick={() => {
                                setSelectedAppId(app.trid);
                                setIsModalOpen(true);
                              }}
                            >
                              <Check className="h-4 w-4 text-green-500 mr-1" /> Accept
                            </button>
                            <button
                              className="min-w-24 h-10 flex items-center justify-center bg-white border border-red-500 px-3 py-2 rounded-lg hover:bg-red-100 transition-all"
                              onClick={() => setRejectModal({ isOpen: true, recruitmentId: app.trid })}
                            >
                              <X className="h-4 w-4 text-red-500 mr-1" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Details row removed: details are shown in a modal instead */}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center bg-gray-100 px-6 py-3 text-gray-900">
                      No pending applications.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* My Applications Table */}
            <h2 className="text-xl font-semibold text-gray-600 mb-2">My Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full border shadow-md rounded-lg overflow-hidden border-collapse">
                <thead>
                <tr className="bg-[#323c47] text-white text-center">
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Class Name</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Team Name</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Leader</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Role and Reason</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                {myApplications.length > 0 ? (
                  myApplications.map((app) => (
                    <tr key={app.trid} className="hover:bg-gray-100 transition-colors">
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{app.classDescription}</td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{app.groupName}</td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{app.leaderName}</td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">
                        <strong>{app.role}</strong> <br />
                        {app.reason}
                      </td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900 font-bold">
                        {getStatusBadge(app.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center px-6 py-3 text-gray-900">
                      No applications submitted.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* Team Invitations Table */}
            <h2 className="text-xl font-semibold text-gray-600 mb-2 mt-10">Team Invitations</h2>
            <div className="overflow-x-auto">
              <table className="w-full border shadow-md rounded-lg overflow-hidden border-collapse">
                <thead>
                <tr className="bg-[#323c47] text-white text-center">
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Team Name</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Class</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Leader</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Members</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Status</th>
                    <th className="border border-gray-300 px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                {teamInvites.length > 0 ? (
                  teamInvites.map(invite => (
                    <tr key={invite.invitationId} className="hover:bg-gray-100 transition-colors">
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{invite.groupName}</td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{invite.classDescription}</td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{invite.leaderName}</td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">
                        {invite.members && invite.members.length > 0 ? (
                          <ul className="list-disc list-inside text-left">
                            {invite.members.map((name, idx) => (
                              <li key={idx}>{name}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500 italic">No members yet</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-6 py-3 text-gray-900">{getStatusBadge(invite.status)}</td>
                      <td className="border border-gray-300 px-6 py-3 text-center">
                        {invite.status === "PENDING" ? (
                          <div className="flex flex-row justify-center gap-2">
                            <button
                              className="min-w-24 h-10 flex items-center justify-center border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-100 transition"
                              onClick={() => handleInviteResponse(invite.invitationId, true)}
                            >
                              Accept
                            </button>
                            <button
                              className="min-w-24 h-10 flex items-center justify-center border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-100 transition"
                              onClick={() => handleInviteResponse(invite.invitationId, false)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center px-6 py-3 text-gray-900">
                      No team invitations.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modals */}
          {isModalOpen && (
            <ConfirmationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={() => {
                handleAccept(selectedAppId);
                setIsModalOpen(false);
              }}
            />
          )}

          {rejectModal.isOpen && (
            <RejectModal 
              onClose={() => setRejectModal({ isOpen: false, recruitmentId: null })} 
              onSubmit={handleReject} 
              rejectReason={rejectReason}
              setRejectReason={setRejectReason}
            />
          )}
        </div>
      </div>
      {/* Info Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ isOpen: false, scores: null, name: "" })}
        scores={infoModal.scores}
        title={infoModal.name}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default TeamApplications;
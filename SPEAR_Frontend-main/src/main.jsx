import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
// Register global axios interceptor that rewrites :8080 URLs to VITE_API_URL_SPEAR in production
import "./services/axiosConfig";
import "./styles/index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./pages/LandinPage/LandingPage";
import SelectionPage from "./pages/SelectionPage";
import Login from "./components/UserAuthentication/Login";
import Register from "./components/UserAuthentication/Register";
import Settings from "./pages/Common/Settings";
import StudentDashboard from "./pages/Student/Home/StudentDashboard";
import ProjectProposals from "./pages/Teacher/ProjectProposals/ProjectProposals";
import TeacherDashboard from "./pages/Teacher/Home/TeacherDashboard";
import CreateClass from "./pages/Teacher/Home/CreateClass";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PrivateRoute from "./services/PrivateRoute";
import NotAuthorized from "./pages/Common/UnAuthorizedPage";
import ManageUsers from "./components/UserManagment/ManageUsers";
import ClassPage from "./pages/Teacher/Home/ClassPage";
import StudentClassPage from "./pages/Student/Home/StudentClassPage";
import TeacherTeams from "./pages/Teacher/Teams/TeacherTeams";
import TeacherEvaluations from "./pages/Teacher/Evaluation/TeacherEvaluations";
import ErrorPage from "./pages/Common/ErrorPage";
import TeacherQuestions from "./pages/Teacher/Evaluation/TeacherQuestions";
import ClassSettings from "./pages/Teacher/Home/ClassSettings";
import TeacherSettings from "./pages/Common/TeacherSettings";
import AdminSettings from "./pages/Common/AdminSettings";
import StudentSettings from "./pages/Common/StudentSettings";
import AdminRecycleBin from "./pages/Common/AdminRecycleBin"
import TeacherSchecules from "./pages/Teacher/Home/TeacherSchedules";
import AdviserCandidate from "./pages/Teacher/Home/AdviserCandidate";
import StudentTeamSettings from "./pages/Student/TeamFormation/StudentTeamSettings";
import ProjectProposalPage from "./pages/Student/ProjectProposal/ProjectProposalPage"; 
import TeacherAdvisories from "./pages/Teacher/Teams/TeacherAdvisories";
import EvaluationStatus from "./pages/Student/Evaluation/EvaluationStatus";
import Evaluations from "./pages/Student/Evaluation/Evaluations";
import StudentEvaluation from "./pages/Student/Evaluation/StudentEvaluation";
import ViewProjectProposal from "./pages/Student/ProjectProposal/ViewProjectProposal";
import ApplyTeam from "./pages/Student/TeamFormation/ApplyTeam";
import TeamApplications from "./pages/Student/TeamFormation/TeamApplications";
import EvaluationTeacher from "./pages/Teacher/Evaluation/EvaluationTeacher";
import AdviserEvaluation from "./pages/Teacher/Evaluation/AdviserEvaluation";
import AdminEvaluations from "./pages/Admin/AdminEvaluations";
import AdminQuestionTemplates from "./pages/Admin/AdminQuestionTemplates";
import StudentTeacherEvaluation from "./pages/Student/Evaluation/StudentTeacherEvaluation";
import StudentTeacherStatus from "./pages/Student/Evaluation/StudentTeacherStatus";
import TeacherAdvisoryRequest from "./pages/Teacher/Teams/TeacherAdvisoryRequest";
import SurveyPage from "./pages/Survey/SurveyPage";
import Survey1 from "./pages/Survey/Survey1";
import Survey2 from "./pages/Survey/Survey2";
import Survey3 from "./pages/Survey/Survey3";
import PersonalityTest from "./pages/Survey/PersonalityTest";
import Dashboard from "./pages/Student/Dashboard/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SelectionPage />, // Show selection page first
    errorElement: <ErrorPage />,
  },
  {
    path: "/survey",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <SurveyPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/survey1",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <Survey1 />
      </PrivateRoute>
    ),
  },
  {
    path: "/survey2",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <Survey2 />
      </PrivateRoute>
    ),
  },
  {
    path: "/survey3",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <Survey3 />
      </PrivateRoute>
    ),
  },
  {
    path: "/personality-test",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <PersonalityTest />
      </PrivateRoute>
    ),
  },
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  //student side
  {
    path: "/student-dashboard",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/student-ai-dashboard",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/class/:courseCode/:section",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentClassPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/student-settings",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentSettings />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/evaluations",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <Evaluations />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/evaluation-status",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <EvaluationStatus />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/student-evaluation",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentEvaluation />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/view-project-proposal",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <ViewProjectProposal />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/team-formation/apply-team",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <ApplyTeam />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/team-applications",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <TeamApplications />
      </PrivateRoute>
    ),
  },
  {
    path: "/student-team-settings/:classId/:teamId/:userId",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentTeamSettings />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/project-proposal",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <ProjectProposalPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/student-teacher-evaluation",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentTeacherEvaluation />
      </PrivateRoute>
    ),
  },
  {
    path: "/student/student-teacher-status",
    element: (
      <PrivateRoute requiredRoles={["STUDENT"]}>
        <StudentTeacherStatus />
      </PrivateRoute>
    ),
  },
  
  //teacher side


  {
    path: "/teacher/evaluations",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherEvaluations />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher-dashboard",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher/project-proposals",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <ProjectProposals />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher-schedules",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherSchecules />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher/create-class",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <CreateClass />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher/class/:courseCode/:section",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <ClassPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher/teams",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherTeams />
      </PrivateRoute>
    ),
  },
  {
    path: "/class-settings",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <ClassSettings />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher-settings",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherSettings />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher/adviser-candidate",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <AdviserCandidate />
      </PrivateRoute>
    ),
  },
  {
    path: "/teacher/questions/:eid",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherQuestions />
      </PrivateRoute>
    ),
  },
  {
    path:"/teacher/evaluation-teacher",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <EvaluationTeacher />
      </PrivateRoute>
    ),
  },
  {
    path:"/teacher/teacher-advisories",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherAdvisories />
      </PrivateRoute>
    ),
  },
  {
    path:"/teacher/adviser-evaluation",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <AdviserEvaluation />
      </PrivateRoute>
    ),
  },
  {
    path:"/teacher/advisory-request",
    element: (
      <PrivateRoute requiredRoles={["TEACHER"]}>
        <TeacherAdvisoryRequest />
      </PrivateRoute>
    ),
  },


  //admin side
  {
    path: "/admin-settings",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <AdminSettings />
      </PrivateRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <Settings />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin-dashboard",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <AdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/manage-users",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <ManageUsers />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin-recycle-bin",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <AdminRecycleBin />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin-evaluations",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <AdminEvaluations />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin-question-templates",
    element: (
      <PrivateRoute requiredRoles={["ADMIN"]}>
        <AdminQuestionTemplates />
      </PrivateRoute>
    ),
  },


//other utilites 
  {
    path: "/notAuthorized",
    element: <NotAuthorized />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />{" "}
    </AuthProvider>
  </React.StrictMode>
);

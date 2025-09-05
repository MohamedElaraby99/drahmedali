import React from "react";
import { Routes, Route } from "react-router-dom";
import useScrollToTop from "./Helpers/useScrollToTop";
import DeviceProtection from "./Components/DeviceProtection";
import HomePage from "./Pages/HomePage";
import AboutUs from "./Pages/About";
import NotFound from "./Pages/NotFound";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import ChangePassword from "./Pages/Password/ChangePassword"
import ForgotPassword from "./Pages/Password/ForgotPassword";
import ResetPassword from "./Pages/Password/ResetPassword";

import Contact from "./Pages/Contact";
import Denied from "./Pages/Denied";

import BlogList from "./Pages/Blog/BlogList";
import BlogDetail from "./Pages/Blog/BlogDetail";
import BlogDashboard from "./Pages/Dashboard/BlogDashboard";
import QAList from "./Pages/QA/QAList";
import QADetail from "./Pages/QA/QADetail";
import QADashboard from "./Pages/Dashboard/QADashboard";
import QACreate from "./Pages/QA/QACreate";
import QAEdit from "./Pages/QA/QAEdit";
import QAPendingQuestions from "./Pages/QA/QAPendingQuestions";
import SubjectList from "./Pages/Subjects/SubjectList";
import SubjectDashboard from "./Pages/Dashboard/SubjectDashboard";
import TermsOfService from "./Pages/TermsOfService";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Wallet from "./Pages/Wallet/Wallet";
import AdminRechargeCodeDashboard from "./Pages/Dashboard/AdminRechargeCodeDashboard";
import AdminUserDashboard from "./Pages/Dashboard/AdminUserDashboard";
import WhatsAppServiceDashboard from "./Pages/Dashboard/WhatsAppServiceDashboard";
import WhatsAppServices from "./Pages/WhatsAppServices/WhatsAppServices";
import InstructorDashboard from "./Pages/Dashboard/InstructorDashboard";
import StageDashboard from "./Pages/Dashboard/StageDashboard";

import Instructors from "./Pages/Instructors";
import InstructorDetail from "./Pages/InstructorDetail";
import CourseContentManager from './Pages/Dashboard/CourseContentManager';
import CoursesPage from './Pages/Courses/CoursesPage';
import CourseDetail from './Pages/Courses/CourseDetail';

import RequireAuth from "./Components/auth/RequireAuth";
import RedirectIfAuthenticated from "./Components/auth/RedirectIfAuthenticated";

import Profile from "./Pages/User/Profile";

import AdminDashboard from "./Pages/Dashboard/AdminDashboard";
import CourseDashboard from "./Pages/Dashboard/CourseDashboard";
import UserProgressDashboard from "./Pages/Dashboard/UserProgressDashboard";
import DeviceManagementDashboard from "./Pages/Dashboard/DeviceManagementDashboard";
import LiveMeetingDashboard from "./Pages/Dashboard/LiveMeetingDashboard";
import ExamResultsDashboard from "./Pages/Dashboard/ExamResultsDashboard";
import LiveMeetings from "./Pages/User/LiveMeetings";
import ExamHistory from "./Pages/User/ExamHistory";
import AdminCourseAccessCodes from "./Pages/Dashboard/AdminCourseAccessCodes";
import ExamSearchDashboard from "./Pages/Dashboard/ExamSearchDashboard";
import EssayExamDashboard from "./Pages/Dashboard/EssayExamDashboard";
import AttendanceDashboard from "./Pages/Dashboard/AttendanceDashboard";
import CenterManagementDashboard from "./Pages/Dashboard/CenterManagementDashboard";
import Overview from "./Pages/Dashboard/CenterManagement/Overview";
import Attendance from "./Pages/Dashboard/CenterManagement/Attendance";
import Groups from "./Pages/Dashboard/CenterManagement/Groups";
import Students from "./Pages/Dashboard/CenterManagement/Students";
import Financial from "./Pages/Dashboard/CenterManagement/Financial";
import OfflineGradesDashboard from "./Pages/Dashboard/OfflineGradesDashboard";
import Achievements from "./Pages/Dashboard/Achievements";

function App() {
  // Auto scroll to top on route change
  useScrollToTop();

  return (
    <DeviceProtection>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/denied" element={<Denied />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/whatsapp-services" element={<WhatsAppServices />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/instructors/:id" element={<InstructorDetail />} />

        <Route path="/signup" element={<RedirectIfAuthenticated><Signup /></RedirectIfAuthenticated>} />
        <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
        <Route
          path="/user/profile/reset-password"
          element={<RedirectIfAuthenticated><ForgotPassword /></RedirectIfAuthenticated>}
        />
        <Route
          path="/user/profile/reset-password/:resetToken"
          element={<RedirectIfAuthenticated><ResetPassword /></RedirectIfAuthenticated>}
        />


        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/qa" element={<QAList />} />
        <Route path="/qa/create" element={<QACreate />} />
        <Route path="/qa/edit/:id" element={<QAEdit />} />
        <Route path="/qa/:id" element={<QADetail />} />
        <Route path="/subjects" element={<SubjectList />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

                  <Route element={<RequireAuth allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}>
                    <Route path="/exam-history" element={<ExamHistory />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/recharge-codes" element={<AdminRechargeCodeDashboard />} />
                    <Route path="/admin/users" element={<AdminUserDashboard />} />
                    <Route path="/admin/instructors" element={<InstructorDashboard />} />
                    <Route path="/admin/stages" element={<StageDashboard />} />
                    <Route path="/admin/whatsapp-services" element={<WhatsAppServiceDashboard />} />
                    <Route path="/admin/course-content" element={<CourseContentManager />} />
                    <Route path="/admin/course-dashboard" element={<CourseDashboard />} />
                    <Route path="/admin/blog-dashboard" element={<BlogDashboard />} />
                    <Route path="/admin/qa-dashboard" element={<QADashboard />} />
                    <Route path="/admin/qa-pending" element={<QAPendingQuestions />} />
                    <Route path="/admin/subject-dashboard" element={<SubjectDashboard />} />
                    <Route path="/admin/user-progress" element={<UserProgressDashboard />} />
                    <Route path="/admin/device-management" element={<DeviceManagementDashboard />} />
                    <Route path="/admin/live-meetings" element={<LiveMeetingDashboard />} />
                    <Route path="/admin/exam-results" element={<ExamResultsDashboard />} />
                    <Route path="/admin/exam-search" element={<ExamSearchDashboard />} />
                    <Route path="/admin/essay-exams" element={<EssayExamDashboard />} />
                    <Route path="/admin/course-access-codes" element={<AdminCourseAccessCodes />} />
                    <Route path="/admin/attendance" element={<AttendanceDashboard />} />
                    <Route path="/admin/center-management" element={<CenterManagementDashboard />} />
                    <Route path="/admin/center-management/overview" element={<Overview />} />
                    <Route path="/admin/center-management/attendance" element={<Attendance />} />
                    <Route path="/admin/center-management/groups" element={<Groups />} />
                    <Route path="/admin/center-management/students" element={<Students />} />
                    <Route path="/admin/center-management/financial" element={<Financial />} />
                    <Route path="/admin/center-management/offline-grades" element={<OfflineGradesDashboard />} />
                    <Route path="/admin/center-management/achievements" element={<Achievements />} />
                  </Route>

        <Route element={<RequireAuth allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]} />}>
          <Route path="/user/profile" element={<Profile />} />
          <Route
            path="/user/profile/change-password"
            element={<ChangePassword />}
          />
          <Route path="/live-meetings" element={<LiveMeetings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </DeviceProtection>
  );
}

export default App;

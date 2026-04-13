import { Routes, Route, Navigate } from "react-router-dom";
import AppShellV2 from "./components/layout/v2/AppShell";
import AdminLayout from "./components/layout/v2/AdminLayout";
import LandingLayout from "./pages/public/landing/LandingLayout";
import LandingPage from "./pages/public/landing/index";
import LoginPageV2 from "./pages/auth/LoginPage";
import ChangePasswordFirstTime from "./pages/auth/ChangePasswordFirstTime";
import { useAuthStore } from "./store/useAuthStore";
import ProfilePage from "./pages/shared/ProfilePage";

// == STAFF IMPORTS ==
import StaffDashboardPage from "./pages/staff/dashboard/DashboardPage";
import StaffDelegationListPage from "./pages/staff/delegations/DelegationListPage";
import StaffDelegationForm from "./pages/staff/delegations/DelegationForm";
import StaffDelegationDetailPage from "./pages/staff/delegations/DelegationDetailPage";
import StaffSchedulePage from "./pages/staff/schedule/SchedulePage";
import StaffMinutesListPage from "./pages/staff/minutes/MinutesListPage";
import StaffMinutesDetailPage from "./pages/staff/minutes/MinutesDetailPage";
import StaffTaskListPage from "./pages/staff/tasks/TaskListPage";
import StaffPartnerListPage from "./pages/staff/partners/PartnerListPage";
import StaffDocumentListPage from "./pages/staff/documents/DocumentListPage";
import StaffNotificationsPage from "./pages/staff/notifications/NotificationsPage";

// == MANAGER IMPORTS ==
import ManagerDashboardPage from "./pages/manager/dashboard/DashboardPage";
import ManagerDelegationListPage from "./pages/manager/delegations/DelegationListPage";
import ManagerDelegationForm from "./pages/manager/delegations/DelegationForm";
import ManagerDelegationDetailPage from "./pages/manager/delegations/DelegationDetailPage";
import ManagerSchedulePage from "./pages/manager/schedule/SchedulePage";
import ManagerMinutesListPage from "./pages/manager/minutes/MinutesListPage";
import ManagerMinutesDetailPage from "./pages/manager/minutes/MinutesDetailPage";
import ManagerTaskListPage from "./pages/manager/tasks/TaskListPage";
import ManagerPartnerListPage from "./pages/manager/partners/PartnerListPage";
import ManagerDocumentListPage from "./pages/manager/documents/DocumentListPage";
import ApprovalsPage from "./pages/manager/ApprovalsPage";
import UnitReportsPage from "./pages/manager/UnitReportsPage";
import TeamsPage from "./pages/manager/TeamsPage";

// == DIRECTOR IMPORTS ==
import DirectorDashboardPage from "./pages/director/dashboard/DashboardPage";
import DirectorDelegationListPage from "./pages/director/delegations/DelegationListPage";
import DirectorDelegationForm from "./pages/director/delegations/DelegationForm";
import DirectorDelegationDetailPage from "./pages/director/delegations/DelegationDetailPage";
import DirectorSchedulePage from "./pages/director/schedule/SchedulePage";
import DirectorMinutesListPage from "./pages/director/minutes/MinutesListPage";
import DirectorMinutesDetailPage from "./pages/director/minutes/MinutesDetailPage";
import DirectorTaskListPage from "./pages/director/tasks/TaskListPage";
import DirectorPartnerListPage from "./pages/director/partners/PartnerListPage";
import DirectorDocumentListPage from "./pages/director/documents/DocumentListPage";
import CityOverviewPage from "./pages/director/CityOverviewPage";
import PipelinePage from "./pages/director/PipelinePage";
import CityReportsPage from "./pages/director/CityReportsPage";

// == ADMIN APP IMPORTS ==
import AdminAppDashboardPage from "./pages/admin/dashboard/DashboardPage";
import AdminDelegationListPage from "./pages/admin/delegations/DelegationListPage";
import AdminDelegationForm from "./pages/admin/delegations/DelegationForm";
import AdminDelegationDetailPage from "./pages/admin/delegations/DelegationDetailPage";
import AdminSchedulePage from "./pages/admin/schedule/SchedulePage";
import AdminMinutesListPage from "./pages/admin/minutes/MinutesListPage";
import AdminMinutesDetailPage from "./pages/admin/minutes/MinutesDetailPage";
import AdminTaskListPage from "./pages/admin/tasks/TaskListPage";
import AdminPartnerListPage from "./pages/admin/partners/PartnerListPage";
import AdminDocumentListPage from "./pages/admin/documents/DocumentListPage";

// == ADMIN PORTAL IMPORTS ==
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import MasterDataPage from "./pages/admin/MasterDataPage";
import AuditLogPage from "./pages/admin/AuditLogPage";

export default function Router() {
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role;

  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPageV2 />} />
      <Route path="/auth/change-password" element={<ChangePasswordFirstTime />} />

      {/* Public Landing Route */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      </Route>

      {/* Main Base Route (Authenticated) */}
      <Route element={isAuthenticated ? <AppShellV2 /> : <Navigate to="/auth/login" replace />}>
        {role === "Staff" && (
          <>
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="delegations" element={<StaffDelegationListPage />} />
            <Route path="delegations/create" element={<StaffDelegationForm />} />
            <Route path="delegations/:id" element={<StaffDelegationDetailPage />} />
            <Route path="schedule" element={<StaffSchedulePage />} />
            <Route path="minutes" element={<StaffMinutesListPage />} />
            <Route path="minutes/:id" element={<StaffMinutesDetailPage />} />
            <Route path="tasks" element={<StaffTaskListPage />} />
            <Route path="partners" element={<StaffPartnerListPage />} />
            <Route path="documents" element={<StaffDocumentListPage />} />
            <Route path="notifications" element={<StaffNotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </>
        )}

        {role === "Manager" && (
          <>
            <Route path="dashboard" element={<ManagerDashboardPage />} />
            <Route path="delegations" element={<ManagerDelegationListPage />} />
            <Route path="delegations/create" element={<ManagerDelegationForm />} />
            <Route path="delegations/:id" element={<ManagerDelegationDetailPage />} />
            <Route path="schedule" element={<ManagerSchedulePage />} />
            <Route path="minutes" element={<ManagerMinutesListPage />} />
            <Route path="minutes/:id" element={<ManagerMinutesDetailPage />} />
            <Route path="tasks" element={<ManagerTaskListPage />} />
            <Route path="partners" element={<ManagerPartnerListPage />} />
            <Route path="documents" element={<ManagerDocumentListPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="reports/unit" element={<UnitReportsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="notifications" element={<StaffNotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </>
        )}

        {role === "Director" && (
          <>
            <Route path="dashboard" element={<DirectorDashboardPage />} />
            <Route path="delegations" element={<DirectorDelegationListPage />} />
            <Route path="delegations/create" element={<DirectorDelegationForm />} />
            <Route path="delegations/:id" element={<DirectorDelegationDetailPage />} />
            <Route path="schedule" element={<DirectorSchedulePage />} />
            <Route path="minutes" element={<DirectorMinutesListPage />} />
            <Route path="minutes/:id" element={<DirectorMinutesDetailPage />} />
            <Route path="tasks" element={<DirectorTaskListPage />} />
            <Route path="partners" element={<DirectorPartnerListPage />} />
            <Route path="documents" element={<DirectorDocumentListPage />} />
            <Route path="city-overview" element={<CityOverviewPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="reports/city" element={<CityReportsPage />} />
            <Route path="notifications" element={<StaffNotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </>
        )}

        {role === "Admin" && (
          <>
            <Route path="dashboard" element={<AdminAppDashboardPage />} />
            <Route path="delegations" element={<AdminDelegationListPage />} />
            <Route path="delegations/create" element={<AdminDelegationForm />} />
            <Route path="delegations/:id" element={<AdminDelegationDetailPage />} />
            <Route path="schedule" element={<AdminSchedulePage />} />
            <Route path="minutes" element={<AdminMinutesListPage />} />
            <Route path="minutes/:id" element={<AdminMinutesDetailPage />} />
            <Route path="tasks" element={<AdminTaskListPage />} />
            <Route path="partners" element={<AdminPartnerListPage />} />
            <Route path="documents" element={<AdminDocumentListPage />} />
            <Route path="notifications" element={<StaffNotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Admin Route Shell */}
      <Route path="/admin" element={isAuthenticated && role === "Admin" ? <AdminLayout /> : <Navigate to="/auth/login" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="master-data" element={<MasterDataPage />} />
        <Route path="system" element={<SystemSettingsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

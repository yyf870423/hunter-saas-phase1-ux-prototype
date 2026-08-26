import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { UserAuthPage } from "./auth/UserAuthPage";
import { OpsLoginPage } from "./auth/OpsLoginPage";
import { ComponentsPage } from "./stage1/ComponentsPage";
import { Dashboard } from "./stage1/Dashboard";
import { ReviewPage } from "./stage1/ReviewPage";
import { Stage1Shell } from "./stage1/Stage1Shell";
import { NewWork } from "./stage2/NewWork";
import { SideTaskDetail, WorksPage } from "./stage2/SideTasks";
import { SignalsPage } from "./stage2/Signals";
import { Stage2ReviewPage } from "./stage2/Stage2ReviewPage";
import { WorkstreamRoute } from "./stage3/WorkstreamRoute";
import {
  CandidatesListPage,
  CompaniesListPage,
  ContactsListPage,
  OpportunitiesListPage,
  PositionsListPage,
} from "./stage4/AssetLists";
import {
  CandidateCreatePage,
  CandidateDetailPage,
  FieldChangeReviewPage,
  IdentityMergeReviewPage,
  SourceEvidencePage,
} from "./stage4/CandidatePages";
import {
  CompanyCreatePage,
  CompanyDetailPage,
  ContactCreatePage,
  ContactDetailPage,
  OpportunityCreatePage,
  OpportunityDetailPage,
} from "./stage4/CompanyOpportunityPages";
import {
  CommonStatesPage,
  ExportsPage,
  ImportsPage,
  RecycleBinPage,
} from "./stage4/DataManagementPages";
import {
  MappingCreatePage,
  MappingDetailPage,
  MappingsListPage,
  PaperDetailPage,
  PapersListPage,
  PatentDetailPage,
  PatentsListPage,
} from "./stage4/LandscapeAcademicPages";
import {
  PositionCreatePage,
  PositionDetailPage,
} from "./stage4/RecruitingPages";
import { Stage4ReviewPage } from "./stage4/Stage4ReviewPage";
import { SettingsLayout } from "./stage5/SettingsLayout";
import {
  AutomationSettingsPage,
  ConnectionSettingsPage,
  DataPrivacySettingsPage,
  NotificationSettingsPage,
  ProfileSettingsPage,
  SubscriptionSettingsPage,
} from "./stage5/SettingsPages";
import { SettingsReviewPage } from "./stage5/SettingsReviewPage";
import { OperationsShell } from "./stage6/OperationsShell";
import { OverviewPage } from "./stage6/OverviewPage";
import {
  SubscriptionsPage,
  UsersWorkspacesPage,
} from "./stage6/ManagementPages";
import {
  CapabilitiesPage,
  SupportPage,
  TaskDetailPage,
  TasksPage,
} from "./stage6/SystemOperationsPages";
import { OperationsReviewPage } from "./stage6/OperationsReviewPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<UserAuthPage />} />
      <Route path="/ops/login" element={<OpsLoginPage />} />
      <Route path="/review" element={<Stage4ReviewPage />} />
      <Route path="/review/stage-1" element={<ReviewPage />} />
      <Route path="/review/stage-2" element={<Stage2ReviewPage />} />
      <Route path="/review/settings" element={<SettingsReviewPage />} />
      <Route path="/review/operations" element={<OperationsReviewPage />} />
      <Route element={<OperationsShell />}>
        <Route path="/ops" element={<Navigate to="/ops/overview" replace />} />
        <Route path="/ops/overview" element={<OverviewPage />} />
        <Route path="/ops/users-workspaces" element={<UsersWorkspacesPage />} />
        <Route path="/ops/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/ops/tasks" element={<TasksPage />} />
        <Route path="/ops/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/ops/capabilities" element={<CapabilitiesPage />} />
        <Route path="/ops/support" element={<SupportPage />} />
      </Route>
      <Route element={<Stage1Shell />}>
        <Route path="/home" element={<Dashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/new" element={<NewWork />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/works/:workstreamId" element={<WorkstreamRoute />} />
        <Route
          path="/workstreams/new"
          element={<Navigate to="/new" replace />}
        />
        <Route
          path="/workstreams/:workstreamId"
          element={<WorkstreamRoute />}
        />
        <Route path="/tasks" element={<Navigate to="/works" replace />} />
        <Route path="/tasks/new" element={<Navigate to="/new" replace />} />
        <Route path="/tasks/:taskId" element={<SideTaskDetail />} />
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/candidates" element={<CandidatesListPage />} />
        <Route path="/candidates/new" element={<CandidateCreatePage />} />
        <Route
          path="/candidates/:candidateId"
          element={<CandidateDetailPage />}
        />
        <Route path="/positions" element={<PositionsListPage />} />
        <Route path="/positions/new" element={<PositionCreatePage />} />
        <Route path="/positions/:positionId" element={<PositionDetailPage />} />
        <Route path="/companies" element={<CompaniesListPage />} />
        <Route path="/companies/new" element={<CompanyCreatePage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        <Route path="/contacts" element={<ContactsListPage />} />
        <Route path="/contacts/new" element={<ContactCreatePage />} />
        <Route path="/contacts/:contactId" element={<ContactDetailPage />} />
        <Route path="/opportunities" element={<OpportunitiesListPage />} />
        <Route path="/opportunities/new" element={<OpportunityCreatePage />} />
        <Route
          path="/opportunities/:opportunityId"
          element={<OpportunityDetailPage />}
        />
        <Route path="/mappings" element={<MappingsListPage />} />
        <Route path="/mappings/new" element={<MappingCreatePage />} />
        <Route path="/mappings/:mappingId" element={<MappingDetailPage />} />
        <Route path="/papers" element={<PapersListPage />} />
        <Route path="/papers/:paperId" element={<PaperDetailPage />} />
        <Route path="/patents" element={<PatentsListPage />} />
        <Route path="/patents/:patentId" element={<PatentDetailPage />} />
        <Route
          path="/reviews/identity/:candidateId"
          element={<IdentityMergeReviewPage />}
        />
        <Route
          path="/reviews/fields/:candidateId"
          element={<FieldChangeReviewPage />}
        />
        <Route path="/sources/:candidateId" element={<SourceEvidencePage />} />
        <Route path="/data/imports" element={<ImportsPage />} />
        <Route path="/data/exports" element={<ExportsPage />} />
        <Route path="/recycle-bin" element={<RecycleBinPage />} />
        <Route path="/review/stage-4/states" element={<CommonStatesPage />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/settings/profile" replace />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="notifications" element={<NotificationSettingsPage />} />
          <Route path="automation" element={<AutomationSettingsPage />} />
          <Route path="connections" element={<ConnectionSettingsPage />} />
          <Route path="subscription" element={<SubscriptionSettingsPage />} />
          <Route path="data-privacy" element={<DataPrivacySettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/review" replace />} />
    </Routes>
  );
}

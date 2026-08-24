import { Navigate, Route, Routes } from "react-router-dom";
import { ComponentsPage } from "./stage1/ComponentsPage";
import { Dashboard } from "./stage1/Dashboard";
import { ReviewPage } from "./stage1/ReviewPage";
import { Stage1Shell } from "./stage1/Stage1Shell";
import { NewWork } from "./stage2/NewWork";
import { SideTaskDetail, SideTasksPage } from "./stage2/SideTasks";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<Stage4ReviewPage />} />
      <Route path="/review/stage-1" element={<ReviewPage />} />
      <Route path="/review/stage-2" element={<Stage2ReviewPage />} />
      <Route path="/review/settings" element={<SettingsReviewPage />} />
      <Route element={<Stage1Shell />}>
        <Route path="/home" element={<Dashboard />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/new" element={<NewWork />} />
        <Route
          path="/workstreams/new"
          element={<Navigate to="/new" replace />}
        />
        <Route
          path="/workstreams/:workstreamId"
          element={<WorkstreamRoute />}
        />
        <Route path="/tasks" element={<SideTasksPage />} />
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

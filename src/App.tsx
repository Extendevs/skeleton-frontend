import { AccessDeniedPage } from '@/app/AccessDeniedPage'
import { DashboardLayout } from '@/app/layout/DashboardLayout'
import { PermissionRoute } from '@/app/router/PermissionRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import { SubscriptionGuard } from '@/app/router/SubscriptionGuard'
import { AcceptInvitationForm } from '@/components/accept-invitation-form'
import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { LoginForm } from '@/components/login-form'
import { ResetPasswordForm } from '@/components/reset-password-form'
import { SignupForm } from '@/components/signup-form'
import '@/index.css'
import { AdministrativeMinuteListPage } from '@/modules/administrativeMinute/AdministrativeMinuteListPage'
import { AreaListPage } from '@/modules/area/AreaListPage'
import { AuditListPage } from '@/modules/audit/AuditListPage'
import { SelectPlanPage } from '@/modules/checkoutSubscription/SelectPlanPage'
import { ClientDetailPage } from '@/modules/client/ClientDetailPage'
import { ClientListPage } from '@/modules/client/ClientListPage'
import { ClientMetadataListPage } from '@/modules/clientMetadata/ClientMetadataListPage'
import { CollaboratorDetailPage } from '@/modules/collaborator/CollaboratorDetailPage'
import { CollaboratorImportPage } from '@/modules/collaborator/CollaboratorImportPage'
import { CollaboratorListPage } from '@/modules/collaborator/CollaboratorListPage'
import { CollaboratorMePage } from '@/modules/collaborator/me/CollaboratorMePage'
import { CompanyListPage } from '@/modules/company/CompanyListPage'
import { CompanyMePage } from '@/modules/company/me/CompanyMePage'
import { ContractTypeListPage } from '@/modules/contractType/ContractTypeListPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { DocumentListPage } from '@/modules/document/DocumentListPage'
import { DocumentCollaboratorListPage } from '@/modules/documentCollaborator/DocumentCollaboratorListPage'
import { DocumentTemplateCollaboratorsPage } from '@/modules/documentTemplate/DocumentTemplateCollaboratorsPage'
import { DocumentTemplateDetailPage } from '@/modules/documentTemplate/DocumentTemplateDetailPage'
import { DocumentTemplateListPage } from '@/modules/documentTemplate/DocumentTemplateListPage'
import { DocumentTypeListPage } from '@/modules/documentType/DocumentTypeListPage'
import { InteractionListPage } from '@/modules/interaction/InteractionListPage'
import { JobPositionListPage } from '@/modules/jobPosition/JobPositionListPage'
import { NoteListPage } from '@/modules/note/NoteListPage'
import { ProjectListPage } from '@/modules/project/ProjectListPage'
import { RoleDetailPage } from '@/modules/role/RoleDetailPage'
import { RoleListPage } from '@/modules/role/RoleListPage'
import { StageListPage } from '@/modules/stage/StageListPage'
import { SubscriptionPlanListPage } from '@/modules/subscriptionPlan/SubscriptionPlanListPage'
import { TenantListPage } from '@/modules/tenant/TenantListPage'
import { TenantWizardPage } from '@/modules/tenant/TenantWizardPage'
import { ChangePlanPage } from '@/modules/user/ChangePlanPage'
import { SubscriptionPage } from '@/modules/user/SubscriptionPage'
import { UserListPage } from '@/modules/user/UserListPage'
import { useSession } from '@/shared/auth/useSession'
import { ERoleUserSlug, roleRoutes } from '@/shared/interfaces/Entity'
import { useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  const { role } = useSession();

  const roleRoute = useMemo(() => {
    return roleRoutes[role as ERoleUserSlug]
  }, [role])
  return (
    <Routes>
      {/* Rutas públicas (solo sin sesión) */}
      <Route element={<PublicOnlyRoute />}>
        <Route
          path="/login"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm md:max-w-5xl">
                <LoginForm />
              </div>
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm md:max-w-5xl">
                <SignupForm />
              </div>
            </div>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm">
                <ForgotPasswordForm />
              </div>
            </div>
          }
        />
        <Route
          path="/auth/reset-password/:token/:email"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm">
                <ResetPasswordForm />
              </div>
            </div>
          }
        />
        <Route
          path="/auth/accept-invitation/:token"
          element={
            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
              <div className="w-full max-w-sm">
                <AcceptInvitationForm />
              </div>
            </div>
          }
        />
      </Route>

      {/* Rutas protegidas (requieren sesión) */}
      <Route element={<ProtectedRoute />}>
        {/* Selección de plan: requiere auth pero NO requiere suscripción activa */}
        <Route path="/select-plan" element={<SelectPlanPage />} />

        {/* App principal: requiere auth + suscripción activa */}
        <Route element={<SubscriptionGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to={roleRoute ?? '/dashboard'} replace />} />
            <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

            <Route element={<PermissionRoute permissionEntity="dashboard" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="/company/me" element={<CompanyMePage />} />
            <Route element={<PermissionRoute permissionEntity="company" />}>
              <Route path="/company" element={<CompanyListPage />} />
            </Route>
            
            <Route element={<PermissionRoute permissionEntity="client" />}>
              <Route path="/client" element={<ClientListPage />} />
              <Route path="/client/:id" element={<ClientDetailPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="project" />}>
              <Route path="/project" element={<ProjectListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="user" />}>
              <Route path="/user" element={<UserListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="tenant" />}>
              <Route path="/tenant" element={<TenantListPage />} />
              <Route path="/tenant/new" element={<TenantWizardPage />} />
            </Route>
            
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/change-plan" element={<ChangePlanPage />} />

            <Route element={<PermissionRoute permissionEntity="subscription_plan" />}>
              <Route path="/subscription-plan" element={<SubscriptionPlanListPage />} />
            </Route>
            <Route element={<PermissionRoute role={[ERoleUserSlug.SUPER_ADMIN]} />}>
              
              <Route path="/role" element={<RoleListPage />} />
              <Route path="/role/:id" element={<RoleDetailPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="stage" />}>
              <Route path="/stage" element={<StageListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="note" />}>
              <Route path="/note" element={<NoteListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="interaction" />}>
              <Route path="/interaction" element={<InteractionListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="client_metadata" />}>
              <Route path="/client-metadata" element={<ClientMetadataListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="area" />}>
              <Route path="/area" element={<AreaListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document" />}>
              <Route path="/document" element={<DocumentListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document_type" />}>
              <Route path="/document-type" element={<DocumentTypeListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="job_position" />}>
              <Route path="/job-position" element={<JobPositionListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="contract_type" />}>
              <Route path="/contract-type" element={<ContractTypeListPage />} />
            </Route>

            <Route path="/collaborator/me" element={<CollaboratorMePage />} />
            <Route element={<PermissionRoute permissionEntity="collaborator" />}>
              <Route path="/collaborator" element={<CollaboratorListPage />} />
              <Route path="/collaborator/import" element={<CollaboratorImportPage />} />
              <Route path="/collaborator/:id" element={<CollaboratorDetailPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="administrative_minute" />}>
              <Route path="/administrative-minute" element={<AdministrativeMinuteListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document_collaborator" />}>
              <Route path="/document-collaborator" element={<DocumentCollaboratorListPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="document_template" />}>
              <Route path="/document-template" element={<DocumentTemplateListPage />} />
              <Route path="/document-template/:id" element={<DocumentTemplateDetailPage />} />
              <Route path="/document-template/:id/collaborators" element={<DocumentTemplateCollaboratorsPage />} />
            </Route>
            <Route element={<PermissionRoute permissionEntity="audit" />}>
              <Route path="/audit" element={<AuditListPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

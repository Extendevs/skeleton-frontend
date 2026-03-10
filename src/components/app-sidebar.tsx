import {
  IconBuilding,
  IconCamera,
  IconClipboardCheck,
  IconCreditCard,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHistory,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUser,
  IconUserStar,
} from '@tabler/icons-react'
import * as React from 'react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { NavItem } from '@/shared/hooks/useFilteredNavItems'
import { useFilteredNavItems } from '@/shared/hooks/useFilteredNavItems'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'

const navMainItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: IconDashboard,
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH],
  },
  
  /* {
    title: 'Empresas',
    url: '/company',
    icon: IconListDetails,
    permissionEntity: 'company',
  }, */
  /* {
    title: 'Clientes',
    url: '/client',
    icon: IconUsers,
    permissionEntity: 'client',
  }, */
  /* {
    title: 'Proyectos',
    url: '/project',
    icon: IconFolder,
    permissionEntity: 'project',
  }, */
  {
    title: 'Mi expediente',
    url: '/collaborator/me',
    icon: IconFileDescription,
    roles: [ERoleUserSlug.COLLABORATOR],
  },
  {
    title: 'Colaboradores',
    url: '/collaborator',
    icon: IconUserStar,
    permissionEntity: 'collaborator',
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
  },
  {
    title: 'Actas administrativas',
    url: '/administrative-minute',
    icon: IconClipboardCheck,
    permissionEntity: 'administrative_minute',
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
  },
  {
    title: 'Usuarios',
    url: '/user',
    icon: IconUser,
    permissionEntity: 'user',
  },
  {
    title: 'Roles',
    url: '/role',
    icon: IconSettings,
    permissionEntity: 'role',
  },
  {
    title: 'Tenants',
    url: '/tenant',
    icon: IconBuilding,
    permissionEntity: 'tenant',
  },
  {
    title: 'Planes de Suscripción',
    url: '/subscription-plan',
    icon: IconCreditCard,
    permissionEntity: 'subscription_plan',
  },
  /* {
    title: 'Etapas',
    url: '/stage',
    icon: IconTimeline,
    permissionEntity: 'workflow_stage',
  }, */
  {
    title: 'Catalogos',
    url: '#',
    icon: IconListDetails,
    roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH],
    items: [
      {
        title: 'Puestos de trabajo',
        url: '/job-position',
        permissionEntity: 'job_position',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Tipos de contrato',
        url: '/contract-type',
        permissionEntity: 'contract_type',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Áreas',
        url: '/area',
        permissionEntity: 'area',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Documentos',
        url: '/document',
        permissionEntity: 'document',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
      {
        title: 'Tipos de documento',
        url: '/document-type',
        permissionEntity: 'document_type',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
     /*  {
        title: 'Docs. de colaboradores',
        url: '/document-collaborator',
        permissionEntity: 'document_collaborator',
      }, */
      {
        title: 'Plantillas de documento',
        url: '/document-template',
        permissionEntity: 'document_template',
        roles: [ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.RH]
      },
    ],
  },
   {
    title: 'Auditoría',
    url: '/audit',
    icon: IconHistory,
    permissionEntity: 'audit',
    roles: [ERoleUserSlug.SUPER_ADMIN, ERoleUserSlug.ACCOUNT_OWNER, ERoleUserSlug.COMPANY_ADMIN]
  },
 /*  {
    title: 'Analytics',
    url: '#',
    icon: IconChartBar,
  }, */
]

const data = {
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
   /*  {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
    }, */
  ],
  documents: [
    /* {
      name: 'Data Library',
      url: '#',
      icon: IconDatabase,
    },
    {
      name: 'Reports',
      url: '#',
      icon: IconReport,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: IconFileWord,
    }, */
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const filteredNavMain = useFilteredNavItems(navMainItems)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Expediente Pro</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        
         {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        {data.navSecondary.length > 0 && <NavSecondary items={data.navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        {<NavUser />}
      </SidebarFooter>
    </Sidebar>
  )
}

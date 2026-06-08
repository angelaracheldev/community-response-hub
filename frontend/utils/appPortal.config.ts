import {
  ADMIN_DASHBOARD_MOCK,
  ADMIN_NAV_ITEMS,
  AdminNavItem,
  QuickAction,
} from './adminDashboard.mock';
import * as sessionAuth from './sessionAuth';

export type AppPortal = 'admin' | 'resident' | 'respondent';

export type AppPortalConfig = {
  roleLabel: string;
  defaultDisplayName: string;
  loginRoute: `/${string}`;
  navItems: AdminNavItem[];
  quickActions: QuickAction[];
  getToken: () => string | null | Promise<string | null>;
  clearToken: () => void | Promise<void>;
};

export const RESIDENT_NAV_ITEMS: AdminNavItem[] = [
  { id: 'home', label: 'Dashboard', route: '/(resident)/home', icon: '🏠' },
  { id: 'submit', label: 'Add Complaint', route: '/(resident)/submit-complaint', icon: '✍️' },
  { id: 'tracking', label: 'My Complaints', route: '/(resident)/tracking', icon: '📋' },
];

export const RESIDENT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'submit',
    label: 'Add Complaint',
    icon: '✍️',
    route: '/(resident)/submit-complaint',
    color: '#6366F1',
  },
  {
    id: 'tracking',
    label: 'My Complaints',
    icon: '📋',
    route: '/(resident)/tracking',
    color: '#3B82F6',
  },
];

export const RESPONDENT_NAV_ITEMS: AdminNavItem[] = [
  { id: 'home', label: 'Home', route: '/(respondent)/dashboard', icon: '🏠' },
  { id: 'assignments', label: 'My Assignments', route: '/(respondent)/assignments', icon: '📋' },
];

export const RESPONDENT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'assignments',
    label: 'My Assignments',
    icon: '📋',
    route: '/(respondent)/assignments',
    color: '#6366F1',
  },
];

export const APP_PORTALS: Record<AppPortal, AppPortalConfig> = {
  admin: {
    roleLabel: 'Admin',
    defaultDisplayName: 'Admin',
    loginRoute: '/(auth)/login',
    navItems: ADMIN_NAV_ITEMS,
    quickActions: ADMIN_DASHBOARD_MOCK.quickActions,
    getToken: sessionAuth.getAuthToken,
    clearToken: sessionAuth.clearAuthToken,
  },
  resident: {
    roleLabel: 'Resident',
    defaultDisplayName: 'Resident',
    loginRoute: '/(auth)/login',
    navItems: RESIDENT_NAV_ITEMS,
    quickActions: RESIDENT_QUICK_ACTIONS,
    getToken: sessionAuth.getAuthToken,
    clearToken: sessionAuth.clearAuthToken,
  },
  respondent: {
    roleLabel: 'Responder',
    defaultDisplayName: 'Responder',
    loginRoute: '/(auth)/login',
    navItems: RESPONDENT_NAV_ITEMS,
    quickActions: RESPONDENT_QUICK_ACTIONS,
    getToken: sessionAuth.getAuthToken,
    clearToken: sessionAuth.clearAuthToken,
  },
};

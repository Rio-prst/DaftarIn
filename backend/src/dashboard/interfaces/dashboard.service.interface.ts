export const DASHBOARD_SERVICE = Symbol('DASHBOARD_SERVICE');

export interface DashboardRecentItemView {
  type: 'preparation' | 'application';
  id: string;
  title: string;
  status: string;
  updated_at: string;
  primary_action: {
    label: string;
    href: string;
  };
}

export interface CitizenDashboardView {
  preparations: {
    draft: number;
    needs_completion: number;
    needs_review: number;
    ready_initial_check: number;
  };
  applications: {
    active: number;
    needs_correction: number;
  };
  open_findings_count: number;
  unread_notifications_count: number;
  recent_items: DashboardRecentItemView[];
}

export interface IDashboardService {
  getCitizenDashboard(userId: string): Promise<CitizenDashboardView>;
}

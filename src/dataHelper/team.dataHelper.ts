/** Valid display statuses for a team member. */
export type TeamMemberStatus = "In Office" | "On Field" | "On Leave";

/**
 * Interface representing a member of a team.
 */
export interface TeamMemberItem {
  /** Unique ID of the member */
  id: string | number;
  /** Full name of the team member */
  name: string;
  /** Professional role or job title */
  role: string;
  /** Work email address */
  email: string;
  /** Current work status (e.g., In Office, On Field) */
  status: TeamMemberStatus;
  /** Number of active tasks assigned */
  tasks: number;
  /** Performance metric score (percentage) */
  performance: number;
}

/**
 * Represents a recent activity performed by a team member.
 */
export interface TeamActivityItem {
  /** Name of the user who performed the activity */
  user: string;
  /** Description of the action taken */
  action: string;
  /** Time elapsed or timestamp of the activity */
  time: string;
}

export const teamMembers: TeamMemberItem[] = [
  { id: 1, name: "Trần Thu Hà", role: "Chuyên viên chính", email: "ha.tt@danang.gov.vn", status: "In Office", tasks: 12, performance: 95 },
  { id: 2, name: "Nguyễn Văn A", role: "Chuyên viên", email: "a.nv@danang.gov.vn", status: "On Field", tasks: 8, performance: 88 },
  { id: 3, name: "Lê Thị B", role: "Chuyên viên", email: "b.lt@danang.gov.vn", status: "In Office", tasks: 5, performance: 72 },
  { id: "4", name: "Phạm Minh Đức", role: "Chuyên viên", email: "duc.pm@danang.gov.vn", status: "On Leave", tasks: 0, performance: 0 },
];

export const teamActivities: TeamActivityItem[] = [
  { user: "Trần Thu Hà", action: "Hoàn thành báo cáo đoàn HQ", time: "20p trước" },
  { user: "Nguyễn Văn A", action: "Check-in Khu công nghệ cao", time: "50p trước" },
  { user: "Lê Thị B", action: "Cập nhật tài liệu dự án", time: "2h trước" },
];

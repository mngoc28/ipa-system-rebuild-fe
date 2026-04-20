/** Valid display statuses for a team member. */
export type TeamMemberStatus = "In Office" | "On Field" | "On Leave";

/**
 * Interface representing a member of a team.
 */
export interface TeamMemberItem {
    id: string | number;
    name: string;
    role: string;
    email: string;
    status: TeamMemberStatus;
    tasks: number;
    performance: number;
}

/**
 * Represents a recent activity performed by a team member.
 */
export interface TeamActivityItem {
    user: string;
    action: string;
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

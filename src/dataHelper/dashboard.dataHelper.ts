/**
 * Interface representing a user currently online on the dashboard.
 */
export interface DashboardOnlineUser {
  /** Unique ID of the online user */
  id: number;
  /** Full name of the user */
  name: string;
  /** Role of the user in the system */
  role: string;
  /** IP address from which the user is connected */
  ip: string;
}

/**
 * Sample data for online users to be displayed on the dashboard.
 */
export const onlineUsers: DashboardOnlineUser[] = [
  { id: 1, name: "Trần Thu Hà", role: "Staff", ip: "10.0.1.45" },
  { id: 2, name: "Nguyễn Minh Châu", role: "Manager", ip: "10.0.1.12" },
  { id: 3, name: "Hồ Kỳ Minh", role: "Director", ip: "10.0.2.1" },
];

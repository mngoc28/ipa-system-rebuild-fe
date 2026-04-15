export interface DashboardOnlineUser {
  id: number;
  name: string;
  role: string;
  ip: string;
}

export const onlineUsers: DashboardOnlineUser[] = [
  { id: 1, name: "Trần Thu Hà", role: "Staff", ip: "10.0.1.45" },
  { id: 2, name: "Nguyễn Minh Châu", role: "Manager", ip: "10.0.1.12" },
  { id: 3, name: "Hồ Kỳ Minh", role: "Director", ip: "10.0.2.1" },
];

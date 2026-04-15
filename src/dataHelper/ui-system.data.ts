export type StatusTone =
  | "draft"
  | "pending"
  | "pendingApproval"
  | "needsRevision"
  | "approved"
  | "inProgress"
  | "revision"
  | "completed"
  | "cancelled"
  | "todo"
  | "done"
  | "urgent"
  | "high"
  | "medium"
  | "low";

export interface DashboardStat {
  id: string;
  title: string;
  value: number;
  note: string;
  icon: "delegation" | "alert" | "task" | "bell";
}

export interface DashboardTask {
  id: string;
  title: string;
  delegation: string;
  deadline: string;
  priority: "urgent" | "high" | "medium" | "low";
  overdue: boolean;
}

export interface DelegationItem {
  id: string | number;
  code: string;
  name: string;
  country: string;
  partnerOrg: string;
  hostUnit: string;
  type: 'inbound' | 'outbound';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  status: StatusTone;
  participants: number;
  description?: string;
  staff: {
    name: string;
    avatar?: string;
  };
  actionItems: {
    total: number;
    overdue: number;
  };
}

export interface SessionItem {
  id: number;
  day: string;
  date: string;
  title: string;
  location: string;
  time: string;
  status: StatusTone;
  type: 'meeting' | 'siteVisit' | 'gala' | 'travel';
  description?: string;
}

export interface MinutesItem {
  id: number;
  title: string;
  delegation: string;
  session: string;
  version: string;
  status: 'draft' | 'final' | 'internal';
  updatedAt: string;
  author: string;
  content?: string;
}

export interface PartnerItem {
  id: number;
  name: string;
  country: string;
  sector: string;
  status: StatusTone;
  email: string;
}

export interface TaskTableItem {
  id: number;
  title: string;
  delegation: string;
  session: string;
  assignee: string;
  status: StatusTone;
  priority: StatusTone;
  deadline: string;
}

export const dashboardStats: DashboardStat[] = [
  {
    id: "delegation-total",
    title: "Tong so doan cong tac",
    value: 42,
    note: "+5 tuan nay",
    icon: "delegation",
  },
  {
    id: "delegation-revision",
    title: "Can bo sung ho so",
    value: 8,
    note: "Can xu ly trong 48h",
    icon: "alert",
  },
  {
    id: "task-total",
    title: "Dau viec dang theo doi",
    value: 27,
    note: "19 dang thuc hien",
    icon: "task",
  },
  {
    id: "task-overdue",
    title: "Dau viec qua han",
    value: 3,
    note: "Can uu tien",
    icon: "bell",
  },
];

export const dashboardTasks: DashboardTask[] = [
  {
    id: "TK-3001",
    title: "Hoan tat thu moi cho doan doanh nghiep Han Quoc",
    delegation: "Doan xuc tien Han Quoc 2026",
    deadline: "11/04/2026 17:00",
    priority: "urgent",
    overdue: false,
  },
  {
    id: "TK-3002",
    title: "Rasoat lich lam viec voi So Ke hoach Dau tu",
    delegation: "Doan nha dau tu Singapore",
    deadline: "10/04/2026 11:30",
    priority: "high",
    overdue: true,
  },
  {
    id: "TK-3003",
    title: "Tong hop cac noi dung bien ban phien hop chieu",
    delegation: "Doan nha dau tu Nhat Ban",
    deadline: "12/04/2026 15:00",
    priority: "medium",
    overdue: false,
  },
];

export const delegations: DelegationItem[] = [
  {
    id: 1,
    code: "DL-2026-001",
    name: "Đoàn xúc tiến đầu tư Hàn Quốc",
    country: "Hàn Quốc",
    partnerOrg: "KOTRA",
    hostUnit: "Trung tâm Xúc tiến Đầu tư",
    type: 'inbound',
    priority: 'high',
    startDate: "14/04/2026",
    endDate: "19/04/2026",
    status: "approved",
    participants: 12,
    staff: { name: "Nguyễn Minh Châu", avatar: "https://i.pravatar.cc/150?u=1" },
    actionItems: { total: 5, overdue: 0 }
  },
  {
    id: 2,
    code: "DL-2026-002",
    name: "Đoàn doanh nghiệp công nghệ Singapore",
    country: "Singapore",
    partnerOrg: "Enterprise Singapore",
    hostUnit: "Sở Thông tin và Truyền thông",
    type: 'inbound',
    priority: 'medium',
    startDate: "22/04/2026",
    endDate: "25/04/2026",
    status: "pendingApproval",
    participants: 8,
    staff: { name: "Trần Thu Hà", avatar: "https://i.pravatar.cc/150?u=2" },
    actionItems: { total: 3, overdue: 1 }
  },
  {
    id: 3,
    code: "DL-2026-003",
    name: "Đoàn nhà đầu tư hạ tầng Nhật Bản",
    country: "Nhật Bản",
    partnerOrg: "JETRO",
    hostUnit: "Sở Kế hoạch và Đầu tư",
    type: 'inbound',
    priority: 'high',
    startDate: "28/04/2026",
    endDate: "02/05/2026",
    status: "inProgress",
    participants: 14,
    staff: { name: "Lê Quốc Bảo", avatar: "https://i.pravatar.cc/150?u=3" },
    actionItems: { total: 8, overdue: 2 }
  },
  {
    id: 4,
    code: "DL-2026-004",
    name: "Đoàn doanh nghiệp năng lượng tái tạo Đức",
    country: "Đức",
    partnerOrg: "AHK Vietnam",
    hostUnit: "Sở Công Thương",
    type: 'inbound',
    priority: 'medium',
    startDate: "05/05/2026",
    endDate: "09/05/2026",
    status: "needsRevision",
    participants: 10,
    staff: { name: "Phạm Thanh Lan", avatar: "https://i.pravatar.cc/150?u=4" },
    actionItems: { total: 4, overdue: 0 }
  },
  {
    id: 5,
    code: "DL-2026-005",
    name: "Đoàn đối ngoại thành phố Melbourne",
    country: "Úc",
    partnerOrg: "City of Melbourne",
    hostUnit: "Văn phòng UBND Thành phố",
    type: 'inbound',
    priority: 'low',
    startDate: "15/05/2026",
    endDate: "17/05/2026",
    status: "draft",
    participants: 6,
    staff: { name: "Nguyễn Minh Châu", avatar: "https://i.pravatar.cc/150?u=1" },
    actionItems: { total: 2, overdue: 0 }
  },
  {
    id: 6,
    code: "DL-2026-006",
    name: "Đoàn khảo sát thị trường Logistics Thái Lan",
    country: "Thái Lan",
    partnerOrg: "Thai Chamber of Commerce",
    hostUnit: "Sở Giao thông Vận tải",
    type: 'inbound',
    priority: 'low',
    startDate: "20/05/2026",
    endDate: "23/05/2026",
    status: "completed",
    participants: 15,
    staff: { name: "Trần Thu Hà", avatar: "https://i.pravatar.cc/150?u=2" },
    actionItems: { total: 10, overdue: 0 }
  },
  {
    id: 7,
    code: "DL-2026-007",
    name: "Đoàn chuyển đổi số Hoa Kỳ",
    country: "Hoa Kỳ",
    partnerOrg: "USABC",
    hostUnit: "Sở Thông tin và Truyền thông",
    type: 'inbound',
    priority: 'high',
    startDate: "10/06/2026",
    endDate: "15/06/2026",
    status: "cancelled",
    participants: 20,
    staff: { name: "Lê Quốc Bảo", avatar: "https://i.pravatar.cc/150?u=3" },
    actionItems: { total: 0, overdue: 0 }
  },
  {
    id: 8,
    code: "DL-2026-008",
    name: "Đoàn Xúc tiến Thương mại tại Pháp",
    country: "Pháp",
    partnerOrg: "Business France",
    hostUnit: "IPA Đà Nẵng",
    type: 'outbound',
    priority: 'high',
    startDate: "01/07/2026",
    endDate: "10/07/2026",
    status: "draft",
    participants: 5,
    staff: { name: "Nguyễn Minh Châu", avatar: "https://i.pravatar.cc/150?u=1" },
    actionItems: { total: 4, overdue: 0 }
  },
  {
    id: 9,
    code: "DL-2026-009",
    name: "Hội nghị Xúc tiến Đầu tư tại Nhật Bản",
    country: "Nhật Bản",
    partnerOrg: "JETRO",
    hostUnit: "IPA Đà Nẵng",
    type: 'outbound',
    priority: 'high',
    startDate: "15/08/2026",
    endDate: "20/08/2026",
    status: "pendingApproval",
    participants: 7,
    staff: { name: "Trần Thu Hà", avatar: "https://i.pravatar.cc/150?u=2" },
    actionItems: { total: 6, overdue: 0 }
  },
  {
    id: 10,
    code: "DL-2026-010",
    name: "Đoàn công tác Du lịch tại Đài Loan",
    country: "Đài Loan",
    partnerOrg: "Taiwan Tourism Bureau",
    hostUnit: "Sở Du lịch",
    type: 'outbound',
    priority: 'medium',
    startDate: "05/09/2026",
    endDate: "08/09/2026",
    status: "approved",
    participants: 4,
    staff: { name: "Lê Quốc Bảo", avatar: "https://i.pravatar.cc/150?u=3" },
    actionItems: { total: 3, overdue: 0 }
  },
  {
    id: 11,
    code: "DL-2026-011",
    name: "Đoàn doanh nghiệp bán dẫn Đài Loan",
    country: "Đài Loan",
    partnerOrg: "TSIA",
    hostUnit: "Ban quản lý Khu công nghệ cao",
    type: 'inbound',
    priority: 'high',
    startDate: "10/04/2026",
    endDate: "12/04/2026",
    status: "inProgress",
    participants: 25,
    staff: { name: "Phạm Thanh Lan", avatar: "https://i.pravatar.cc/150?u=4" },
    actionItems: { total: 12, overdue: 5 }
  },
  {
    id: 12,
    code: "DL-2026-012",
    name: "Đoàn đại biểu thành phố Lyon (Pháp)",
    country: "Pháp",
    partnerOrg: "City of Lyon",
    hostUnit: "Văn phòng UBND Thành phố",
    type: 'inbound',
    priority: 'medium',
    startDate: "18/04/2026",
    endDate: "21/04/2026",
    status: "approved",
    participants: 8,
    staff: { name: "Nguyễn Minh Châu", avatar: "https://i.pravatar.cc/150?u=1" },
    actionItems: { total: 4, overdue: 0 }
  },
  {
    id: 13,
    code: "DL-2026-013",
    name: "Đoàn startup công nghệ Israel",
    country: "Israel",
    partnerOrg: "Israel Innovation Authority",
    hostUnit: "Sở Khoa học và Công nghệ",
    type: 'inbound',
    priority: 'medium',
    startDate: "25/04/2026",
    endDate: "29/04/2026",
    status: "pendingApproval",
    participants: 6,
    staff: { name: "Trần Thu Hà", avatar: "https://i.pravatar.cc/150?u=2" },
    actionItems: { total: 3, overdue: 0 }
  },
  {
    id: 14,
    code: "DL-2026-014",
    name: "Đoàn Xúc tiến FDI tại Anh",
    country: "Vương quốc Anh",
    partnerOrg: "UKABC",
    hostUnit: "IPA Đà Nẵng",
    type: 'outbound',
    priority: 'high',
    startDate: "10/10/2026",
    endDate: "18/10/2026",
    status: "needsRevision",
    participants: 6,
    staff: { name: "Lê Quốc Bảo", avatar: "https://i.pravatar.cc/150?u=3" },
    actionItems: { total: 5, overdue: 0 }
  },
  {
    id: 15,
    code: "DL-2026-015",
    name: "Đoàn doanh nghiệp hàng không Ấn Độ",
    country: "Ấn Độ",
    partnerOrg: "FICCI",
    hostUnit: "Cảng hàng không Quốc tế Đà Nẵng",
    type: 'inbound',
    priority: 'medium',
    startDate: "05/11/2026",
    endDate: "09/11/2026",
    status: "draft",
    participants: 18,
    staff: { name: "Phạm Thanh Lan", avatar: "https://i.pravatar.cc/150?u=4" },
    actionItems: { total: 2, overdue: 0 }
  }
];

export const weekSessions: SessionItem[] = [
  {
    id: 1,
    day: "Thứ 2",
    date: "14/04",
    title: "Họp khởi động với đoàn Hàn Quốc",
    location: "Phòng họp A2",
    time: "09:00 - 10:30",
    status: "approved",
    type: 'meeting',
    description: 'Giới thiệu các thành phần tham dự và tầm nhìn chung.'
  },
  {
    id: 4,
    day: "Thứ 2",
    date: "14/04",
    title: "Tham khảo thực địa Khu kinh tế",
    location: "Khu kinh tế ven biển",
    time: "14:00 - 16:30",
    status: "approved",
    type: 'siteVisit',
  },
  {
    id: 5,
    day: "Thứ 2",
    date: "14/04",
    title: "Tiệc tối chào mừng",
    location: "Khách sạn Novotel",
    time: "18:30 - 21:00",
    status: "approved",
    type: 'gala',
  },
  {
    id: 2,
    day: "Thứ 3",
    date: "15/04",
    title: "Làm việc song phương với nhà đầu tư",
    location: "Trung tâm Hành chính",
    time: "14:00 - 16:00",
    status: "inProgress",
    type: 'meeting',
  },
  {
    id: 6,
    day: "Thứ 3",
    date: "15/04",
    title: "Di chuyển đến Khu Công nghệ cao",
    location: "Hòa Vang",
    time: "08:30 - 09:30",
    status: "approved",
    type: 'travel',
  },
  {
    id: 7,
    day: "Thứ 4",
    date: "16/04",
    title: "Hội thảo Xúc tiến Đầu tư ICT",
    location: "Công viên Phần mềm số 2",
    time: "09:00 - 12:00",
    status: "pendingApproval",
    type: 'meeting',
  },
  {
    id: 3,
    day: "Thứ 5",
    date: "17/04",
    title: "Tổng kết và ký biên bản ghi nhớ",
    location: "Hội trường 2",
    time: "08:30 - 11:00",
    status: "pendingApproval",
    type: 'meeting',
  },
];

export const minutesDocs: MinutesItem[] = [
  {
    id: 701,
    title: "Biên bản họp khởi động với đoàn Hàn Quốc",
    delegation: "Đoàn xúc tiến đầu tư Hàn Quốc",
    session: "Họp khởi động",
    version: "v3",
    status: 'final',
    updatedAt: "09/04/2026 09:24",
    author: "Nguyễn Minh Châu",
    content: "Nội dung cuộc họp xoay quanh việc thống nhất các địa điểm khảo sát tại Khu công nghệ cao..."
  },
  {
    id: 702,
    title: "Biên bản phiên làm việc với Sở KHDT",
    delegation: "Đoàn doanh nghiệp Singapore",
    session: "Làm việc song phương",
    version: "v2",
    status: 'final',
    updatedAt: "08/04/2026 14:15",
    author: "Trần Thu Hà",
  },
  {
    id: 703,
    title: "Tổng hợp nội dung đề xuất hợp tác năng lượng",
    delegation: "Đoàn doanh nghiệp Đức",
    session: "Tổng kết",
    version: "v5",
    status: 'internal',
    updatedAt: "07/04/2026 16:40",
    author: "Lê Quốc Bảo",
  },
  {
    id: 704,
    title: "Biên bản ghi nhớ hợp tác ICT Đài Loan",
    delegation: "Đoàn doanh nghiệp bán dẫn Đài Loan",
    session: "Tổng kết",
    version: "v1",
    status: 'draft',
    updatedAt: "10/04/2026 11:00",
    author: "Phạm Thanh Lan",
  }
];

export const partners: PartnerItem[] = [
  {
    id: 8001,
    name: "Korea Innovation Group",
    country: "Han Quoc",
    sector: "Cong nghe cao",
    status: "inProgress",
    email: "contact@kig.kr",
  },
  {
    id: 8002,
    name: "Urban Infra Japan",
    country: "Nhat Ban",
    sector: "Ha tang do thi",
    status: "approved",
    email: "office@uij.jp",
  },
  {
    id: 8003,
    name: "BlueWind Energy GmbH",
    country: "Duc",
    sector: "Nang luong tai tao",
    status: "pending",
    email: "hello@bluewind.de",
  },
  {
    id: 8004,
    name: "SmartPort Solutions",
    country: "Singapore",
    sector: "Logistics",
    status: "revision",
    email: "biz@smartport.sg",
  },
];

export const taskTable: TaskTableItem[] = [
  {
    id: 1101,
    title: "Hoan tat danh sach thanh phan tham du",
    delegation: "Doan Han Quoc",
    session: "Hop khoi dong",
    assignee: "Tran Thu Ha",
    status: "inProgress",
    priority: "high",
    deadline: "11/04/2026",
  },
  {
    id: 1102,
    title: "Cap nhat thong tin phong hop va hau can",
    delegation: "Doan Singapore",
    session: "Phien chieu ngay 15/04",
    assignee: "Le Quoc Bao",
    status: "todo",
    priority: "medium",
    deadline: "10/04/2026",
  },
  {
    id: 1103,
    title: "Soat xet bien ban de xuat hop tac",
    delegation: "Doan Duc",
    session: "Tong ket",
    assignee: "Nguyen Minh Chau",
    status: "done",
    priority: "urgent",
    deadline: "09/04/2026",
  },
  {
    id: 1104,
    title: "Chuan bi tai lieu gioi thieu du an uu tien",
    delegation: "Doan Nhat Ban",
    session: "Lam viec song phuong",
    assignee: "Pham Thanh Lan",
    status: "cancelled",
    priority: "low",
    deadline: "08/04/2026",
  },
];

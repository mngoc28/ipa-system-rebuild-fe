/**
 * Types of audit log entries, representing the severity or category of the log.
 */
export type AuditLogType = "info" | "success" | "warning" | "system";

/**
 * Interface representing a single audit log entry.
 */
export interface AuditLogItem {
    id: number;
    user: string;
    action: string;
    detail: string;
    time: string;
    type: AuditLogType;
}

/**
 * Sample audit logs for demonstration or development purposes.
 */
export const auditLogs: AuditLogItem[] = [
  { id: 1, user: "Nguyễn Văn Quản Trị", action: "Đăng nhập hệ thống", detail: "Thực hiện đăng nhập thành công từ IP 192.168.1.5", time: "10:15 - 10/04/2026", type: "info" },
  { id: 2, user: "Trần Thu Hà", action: "Cập nhật đoàn", detail: "Chuyển trạng thái Đoàn Inbound Hàn Quốc sang \"Đang khảo sát\"", time: "09:42 - 10/04/2026", type: "success" },
  { id: 3, user: "Nguyễn Minh Châu", action: "Phê duyệt lịch", detail: "Phê duyệt lịch công tác tuần 15 cho Phòng Xúc tiến 1", time: "08:15 - 10/04/2026", type: "success" },
  { id: 4, user: "Lê Văn Giám Đốc", action: "Xem báo cáo", detail: "Truy xuất báo cáo tổng kết quý 1 city_report_q1.pdf", time: "Yesterday - 16:30", type: "info" },
  { id: 6, user: "Admin", action: "Xóa dữ liệu", detail: "Xóa 15 bản ghi tạm trong thư mục Downloads", time: "Yesterday - 08:00", type: "system" },
];

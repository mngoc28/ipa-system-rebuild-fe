/**
 * Represents a task or action item extracted from meeting minutes.
 */
export interface MinutesTaskItem {
  /** The descriptive title of the task */
  title: string;
  /** Current execution status: "done" or "pending" */
  status: "done" | "pending";
}

/**
 * Initial set of tasks derived from meeting minutes for display or tracking.
 */
export const minutesTasks: MinutesTaskItem[] = [
  { title: "Chuẩn bị tài liệu Gift & Welcome", status: "done" },
  { title: "Đặt xe di chuyển ngày 15/04", status: "pending" },
  { title: "Gửi email xác nhận danh mục họp", status: "pending" },
];

/**
 * List of filenames for documents attached to the meeting minutes.
 */
export const minutesAttachments: string[] = ["Phieu_Khao_Sat.pdf", "Anh_Khao_Sat_KCNC.zip"];

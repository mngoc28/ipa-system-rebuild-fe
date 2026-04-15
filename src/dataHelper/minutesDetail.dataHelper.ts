export interface MinutesTaskItem {
  title: string;
  status: "done" | "pending";
}

export const minutesTasks: MinutesTaskItem[] = [
  { title: "Chuẩn bị tài liệu Gift & Welcome", status: "done" },
  { title: "Đặt xe di chuyển ngày 15/04", status: "pending" },
  { title: "Gửi email xác nhận danh mục họp", status: "pending" },
];

export const minutesAttachments: string[] = ["Phieu_Khao_Sat.pdf", "Anh_Khao_Sat_KCNC.zip"];

# Quick QA Bug-Only (1 Page)

Muc dich: chi ghi ket qua loi theo tung man hinh + danh sach bug chi tiet.

## A) Ket qua theo tung man
| Role | Route | Screen | Ket qua | So loi | Bug IDs |
|---|---|---|---|---|---|
| Staff | /documents | Document List | No issue | 0 | - |
| Manager | /teams | Teams | Co loi | 2 | BUG-021, BUG-022 |

Quy uoc:
- Ket qua chi co 2 gia tri: `No issue` hoac `Co loi`.
- Neu `Co loi`, bat buoc dien so loi va Bug IDs.

## B) Bug Table (chi in loi)
| Bug ID | Role | Route | Screen | Severity | Title | Steps to reproduce | Expected | Actual | Evidence | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BUG-021 | Manager | /teams | Teams | High | Nut phan quyen khong cap nhat UI | 1) Login Manager 2) Mo /teams 3) Click nut phan quyen | UI cap nhat ngay | UI khong doi | /evidence/BUG-021.png | FE | Open |

## C) Not Tested (neu co)
| Role | Route | Screen | Ly do |
|---|---|---|---|

## D) Ket luan nhanh
- Tong man da test:
- Tong man co loi:
- Tong bug:
- Critical/High con mo:
- Khuyen nghi: GO / NO-GO

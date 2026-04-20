import * as React from "react";
import { projectDataHelper } from "@/dataHelper/projects.dataHelper";
import { PipelineProject } from "@/api/pipelineApi";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Target, User, Briefcase, Globe, Info } from "lucide-react";

interface SharedProjectDetailProps {
  project: PipelineProject;
}

export const SharedProjectDetail: React.FC<SharedProjectDetailProps> = ({ project }) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">{project.project_name}</h3>
          <p className="mt-1 text-sm font-black uppercase tracking-widest text-slate-400">
            {project.project_code}
          </p>
        </div>
        <Badge className={projectDataHelper.getStageColor(project.stage_id)}>
          {projectDataHelper.getStageLabel(project.stage_id)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Globe className="mt-1 size-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Khu vực / Quốc gia</p>
              <p className="text-sm font-bold text-slate-700">{project.country_id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Briefcase className="mt-1 size-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lĩnh vực</p>
              <p className="text-sm font-bold text-slate-700">{project.sector_id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="mt-1 size-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá trị ước tính</p>
              <p className="text-sm font-black text-slate-900">
                {projectDataHelper.formatVND(project.estimated_value)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Target className="mt-1 size-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Xác suất thành công</p>
              <p className="text-sm font-bold text-emerald-600">{project.success_probability}%</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-1 size-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ngày dự kiến kết thúc</p>
              <p className="text-sm font-bold text-slate-700">
                {project.expected_close_date || "Chưa xác định"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="mt-1 size-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Người sở hữu</p>
              <p className="text-sm font-bold text-slate-700">{project.owner_user_id}</p>
            </div>
          </div>
        </div>
      </div>

      {project.delegation_id && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-blue-700">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Thông tin đoàn liên kết</span>
          </div>
          <p className="text-xs font-medium italic text-blue-600">
            Dự án này được liên kết với một đoàn công tác. Bạn có thể xem chi tiết đoàn trong mục Quản lý đoàn.
          </p>
        </div>
      )}
    </div>
  );
};

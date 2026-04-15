import * as React from "react";
import { CircleDot, ExternalLink, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { projectDataHelper } from "@/dataHelper/projects.dataHelper";
import { PipelineProject } from "@/api/pipelineApi";

interface SharedProjectListProps {
  projects: PipelineProject[];
  onEdit?: (project: PipelineProject) => void;
  onDelete?: (project: PipelineProject) => void;
  onView?: (project: PipelineProject) => void;
  onPatchStage?: (id: string, currentStage: string) => void;
}

export const SharedProjectList: React.FC<SharedProjectListProps> = ({
  projects,
  onEdit,
  onDelete,
  onView,
  onPatchStage,
}) => {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group flex flex-col justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/30 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md md:flex-row md:items-center"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-all group-hover:text-primary group-hover:border-primary/20">
              <CircleDot size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate transition-colors group-hover:text-primary">
                {project.project_name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {project.country_id} | {project.project_code}
                </span>
                {project.delegation_id && (
                  <Link
                    to={`/delegations/${project.delegation_id}`}
                    className="flex items-center gap-1 text-[9px] font-black uppercase text-primary hover:underline"
                  >
                    <ExternalLink size={10} /> Đoàn liên kết
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 md:flex-nowrap">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Giá trị</p>
              <p className="text-sm font-black text-slate-900">
                {projectDataHelper.formatVND(project.estimated_value)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Giai đoạn</p>
              <button
                onClick={() => onPatchStage?.(project.id, project.stage_id)}
                className={cn(
                  "mt-1 inline-block rounded border px-2 py-0.5 text-[9px] font-black uppercase transition-all",
                  project.stage_id === "closed-won" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                  project.stage_id === "closed-lost" ? "border-rose-200 bg-rose-50 text-rose-700" :
                  "border-blue-200 bg-blue-50 text-blue-700 active:scale-95"
                )}
              >
                {projectDataHelper.getStageLabel(project.stage_id)}
              </button>
            </div>
            <div className="hidden text-right sm:block min-w-[100px]">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight mb-1">
                Xác suất thành công
              </p>
              <div className="flex items-center gap-2 justify-end">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${project.success_probability || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-600">
                  {project.success_probability || 0}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onView?.(project)}
                className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-slate-100 rounded-md"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onEdit?.(project)}
                className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors hover:bg-slate-100 rounded-md"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete?.(project)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors hover:bg-slate-100 rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            Chưa có dự án pipeline khớp bộ lọc
          </p>
        </div>
      )}
    </div>
  );
};

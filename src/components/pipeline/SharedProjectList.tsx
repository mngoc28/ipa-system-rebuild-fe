import * as React from "react";
import { CircleDot, ExternalLink, Edit, Trash2, Eye } from "lucide-react";
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
          className="group flex flex-col justify-between gap-4 rounded-lg border border-brand-dark/5 bg-brand-dark/[0.01] p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md md:flex-row md:items-center"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-brand-dark/5 bg-white text-brand-text-dark/40 shadow-sm transition-all group-hover:border-primary/20 group-hover:text-primary">
              <CircleDot size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-brand-text-dark transition-colors group-hover:text-primary">
                {project.project_name}
              </h4>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
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
              <p className="text-[9px] font-black uppercase tracking-tight text-brand-text-dark/40">Giá trị</p>
              <p className="text-sm font-black text-brand-text-dark">
                {projectDataHelper.formatVND(project.estimated_value)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-tight text-brand-text-dark/40">Giai đoạn</p>
              <button
                onClick={() => onPatchStage?.(project.id, project.stage_id)}
                className={cn(
                  "mt-1 inline-block rounded border px-2 py-0.5 text-[9px] font-black uppercase transition-all",
                  project.stage_id === "closed-won" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                  project.stage_id === "closed-lost" ? "border-destructive/20 bg-destructive/5 text-destructive" :
                  "border-primary/20 bg-primary/5 text-primary active:scale-95"
                )}
              >
                {projectDataHelper.getStageLabel(project.stage_id)}
              </button>
            </div>
            <div className="hidden min-w-[100px] text-right sm:block">
              <p className="mb-1 text-[9px] font-black uppercase tracking-tight text-brand-text-dark/40">
                Xác suất thành công
              </p>
              <div className="flex items-center justify-end gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full border border-brand-dark/10 bg-brand-dark/5">
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
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => onView?.(project)}
                title={`Xem chi tiết ${project.project_name}`}
                aria-label={`Xem chi tiết ${project.project_name}`}
                className="rounded-md p-1.5 text-brand-text-dark/40 transition-colors hover:bg-brand-dark/5 hover:text-primary"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onEdit?.(project)}
                title={`Chỉnh sửa ${project.project_name}`}
                aria-label={`Chỉnh sửa ${project.project_name}`}
                className="rounded-md p-1.5 text-brand-text-dark/40 transition-colors hover:bg-brand-dark/5 hover:text-amber-600"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete?.(project)}
                title={`Xóa ${project.project_name}`}
                aria-label={`Xóa ${project.project_name}`}
                className="rounded-md p-1.5 text-brand-text-dark/40 transition-colors hover:bg-brand-dark/5 hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-dark/10 bg-brand-dark/[0.02] py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-text-dark/40">
            Chưa có dự án pipeline khớp bộ lọc
          </p>
        </div>
      )}
    </div>
  );
};

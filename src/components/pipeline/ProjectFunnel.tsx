import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectDataHelper } from "@/dataHelper/projects.dataHelper";

interface ProjectFunnelProps {
  projects: any[];
}

export const ProjectFunnel: React.FC<ProjectFunnelProps> = ({ projects }) => {
  const funnelStages = projectDataHelper.calculateFunnelStats(projects);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950 p-6 shadow-xl shadow-slate-950/20 lg:p-10 border border-slate-900">
      <div className="relative z-10 grid grid-cols-1 gap-3 lg:grid-cols-4">
        {funnelStages.map((stage, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={cn(
                "group relative mb-4 flex h-20 w-full cursor-default items-center justify-center rounded-lg border border-white/5",
                stage.color,
                "opacity-95 transition-all hover:opacity-100 opacity-100 hover:shadow-lg hover:shadow-black/20",
              )}
            >
              <div className="text-center">
                <p className="text-2xl font-black text-white leading-none tracking-tight">{stage.count}</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/50">{stage.title}</p>
              </div>
              {/* Connection arrow */}
              {i < funnelStages.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-slate-950 p-0.5 lg:block">
                  <ChevronRight size={12} className="text-white/40" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Giá trị ước tính</p>
              <p className="text-lg font-black text-white tracking-tight leading-none">{stage.value}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Abstract background graphics */}
      <div className="pointer-events-none absolute left-[-10%] top-[-30%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
    </div>
  );
};

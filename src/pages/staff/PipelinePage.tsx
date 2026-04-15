import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { pipelineApi, PipelineProject } from "@/api/pipelineApi";
import { SharedProjectList } from "@/components/pipeline/SharedProjectList";
import { SharedProjectForm } from "@/components/pipeline/SharedProjectForm";
import { SharedProjectDetail } from "@/components/pipeline/SharedProjectDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function StaffPipelinePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<PipelineProject | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<PipelineProject | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["pipeline-projects"],
    queryFn: () => pipelineApi.listProjects(),
  });

  const projects = projectsQuery.data?.data?.items || [];
  
  const filteredProjects = projects.filter(p => 
    p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: PipelineProject) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleView = (project: PipelineProject) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handlePatchStage = async (id: string, currentStage: string) => {
    const stages = ["lead", "contacted", "proposal", "negotiation", "closed-won", "closed-lost"];
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = stages[(currentIndex + 1) % stages.length];
    
    try {
      await pipelineApi.patchStage(id, nextStage, "Updated by Staff");
      toast.success(`Đã chuyển sang giai đoạn ${nextStage}`);
      queryClient.invalidateQueries({ queryKey: ["pipeline-projects"] });
    } catch (error) {
      toast.error("Không thể chuyển giai đoạn");
    }
  };

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center border-b border-slate-100 pb-6">
        <div>
          <h1 className="font-title text-2xl font-black tracking-tight text-slate-900 uppercase">
            Xúc tiến Đầu tư
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Dành cho Chuyên viên: Theo dõi và cập nhật tiến độ các dự án đang phụ trách.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={14} /> TẠO DỰ ÁN
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="flex items-center gap-3 font-title text-lg font-black text-slate-900 uppercase tracking-tight">
            <Target size={20} className="text-indigo-600" /> Dự án Pipeline
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Tìm theo tên hoặc mã..." 
              className="pl-9 h-9 text-xs border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Staff list - no delete option by default in this shared view for staff */}
        <SharedProjectList 
          projects={filteredProjects}
          onEdit={handleEdit}
          onView={handleView}
          onPatchStage={handlePatchStage}
          // onDelete disabled for staff
        />
      </div>

      {/* Modals */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              {editingProject ? "Cập nhật dự án" : "Thêm dự án pipeline mới"}
            </DialogTitle>
          </DialogHeader>
          <SharedProjectForm 
            initialData={editingProject}
            onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ["pipeline-projects"] });
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-indigo-600">
              Chi tiết dự án
            </DialogTitle>
          </DialogHeader>
          {selectedProject && <SharedProjectDetail project={selectedProject} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

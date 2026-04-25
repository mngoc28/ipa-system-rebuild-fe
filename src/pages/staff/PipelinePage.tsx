import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Search } from "lucide-react";
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<PipelineProject | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["pipeline-projects"],
    queryFn: () => pipelineApi.listProjects(),
  });

  const projects = projectsQuery.data?.items || [];
  
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
    } catch {
      toast.error("Không thể chuyển giai đoạn");
    }
  };

  const handleDelete = (project: PipelineProject) => {
    setProjectToDelete(project);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      await pipelineApi.deleteProject(projectToDelete.id);
      toast.success("Đã xóa dự án thành công");
      queryClient.invalidateQueries({ queryKey: ["pipeline-projects"] });
      setIsDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch {
      toast.error("Không thể xóa dự án. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-brand-dark/5 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-text-dark">
            Xúc tiến Đầu tư
          </h1>
          <p className="mt-1 text-sm font-medium text-brand-text-dark/60">
            Dành cho Chuyên viên: Theo dõi và cập nhật tiến độ các dự án đang phụ trách.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
          >
            <Plus size={14} /> TẠO DỰ ÁN
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 border-b border-brand-dark/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-3 text-lg font-black text-brand-text-dark">
            <Target size={20} className="text-primary" /> Dự án Pipeline
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-dark/40" size={14} />
            <Input 
              placeholder="Tìm theo tên hoặc mã..." 
              className="h-9 border-brand-dark/10 pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <SharedProjectList
          projects={filteredProjects}
          isLoading={projectsQuery.isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onPatchStage={handlePatchStage}
          onDelete={handleDelete}
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
            key={editingProject?.id || "new"}
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
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-brand-dark">
              Chi tiết dự án
            </DialogTitle>
          </DialogHeader>
          {selectedProject && <SharedProjectDetail project={selectedProject} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              Xác nhận xóa dự án
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-brand-text-dark/80">
              Bạn có chắc chắn muốn xóa dự án <strong className="text-brand-text-dark">{projectToDelete?.project_name}</strong>? 
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="rounded-lg border border-brand-dark/10 bg-white px-4 py-2 text-xs font-bold text-brand-text-dark/60 hover:bg-brand-dark/5"
            >
              Hủy
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95"
            >
              Xác nhận xóa
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

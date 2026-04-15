import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";

export interface FolderItem {
  id: string;
  parentFolderId?: string | null;
  folderName: string;
  scopeType: string;
}

export interface FileItem {
  id: string;
  fileName: string;
  sizeBytes: number;
  storageKey?: string;
  folderId?: string | null;
  delegationId?: string | null;
  minutesId?: string | null;
  taskId?: string | null;
  shares?: unknown[];
  versions?: unknown[];
}

export interface FilesData {
  items: FileItem[];
}

export const documentsApi = {
  listFolders: async (query?: { parentId?: string; scopeType?: string }) => {
    const response = await axiosClient.get<ApiEnvelope<{ items: FolderItem[] }>>("/api/v1/folders", {
      params: query,
    });
    return response.data;
  },
  createFolder: async (payload: { folderName: string; scopeType: string; parentFolderId?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<FolderItem>>("/api/v1/folders", payload);
    return response.data;
  },
  listFiles: async (query?: { folderId?: string }) => {
    const response = await axiosClient.get<ApiEnvelope<FilesData>>("/api/v1/files", {
      params: query,
    });
    return response.data;
  },
  uploadFile: async (payload: { fileName: string; sizeBytes: number; folderId?: string; delegationId?: string; minutesId?: string; taskId?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<FileItem>>("/api/v1/files/upload", payload);
    return response.data;
  },
  patchFile: async (id: string, payload: { fileName?: string }) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean; file: FileItem }>>(`/api/v1/files/${id}`, payload);
    return response.data;
  },
  createDownloadUrl: async (id: string) => {
    const response = await axiosClient.post<ApiEnvelope<{ url: string; expiresAt: string }>>(`/api/v1/files/${id}/download-url`, {});
    return response.data;
  },
  shareFile: async (id: string, payload: { permissionLevel: "VIEW" | "EDIT"; sharedWithUserId?: string; sharedWithRoleId?: string; expiresAt?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ shareId: string }>>(`/api/v1/files/${id}/share`, payload);
    return response.data;
  },
};

export const toDocumentType = (fileName: string): "pdf" | "image" | "docx" => {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) return "image";
  return "docx";
};

export const toSizeLabel = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
};

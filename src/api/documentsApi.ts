import axiosClient from "@/api/axiosClient";
import { ApiEnvelope } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Represents a logical folder for file organization.
 */
export interface FolderItem {
    id: string;
    parentFolderId?: string | null;
    folderName: string;
    scopeType: string;
}

/**
 * Represents a metadata record for an uploaded file.
 */
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

const getBasePrefix = () => {
  const role = useAuthStore.getState().user?.role || "staff";
  const mappedRole = role.toLowerCase() === "admin" ? "director" : role.toLowerCase();
  return `/api/v1/${mappedRole}`;
};

/**
 * API service for document management, sharing, and storage.
 */
export const documentsApi = {
  /**
   * Lists folders, optionally filtered by parent or scope.
   * @param query - Contextual filters for folder navigation.
   * @returns List of folder items.
   */
  listFolders: async (query?: { parentId?: string; scopeType?: string }) => {
    const response = await axiosClient.get<ApiEnvelope<{ items: FolderItem[] }>>(`${getBasePrefix()}/folders`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Creates a new directory in the document system.
   * @param payload - Folder identity and scope.
   * @returns The created folder record.
   */
  createFolder: async (payload: { folderName: string; scopeType: string; parentFolderId?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<FolderItem>>(`${getBasePrefix()}/folders`, payload);
    return response.data;
  },

  /**
   * Retrieves files within a specific folder.
   * @param query - The folder ID to scope the list.
   * @returns List of file metadata records.
   */
  listFiles: async (query?: { folderId?: string }) => {
    const response = await axiosClient.get<ApiEnvelope<FilesData>>(`${getBasePrefix()}/files`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Initiates a file upload process.
   * @param payload - Metadata for the file being uploaded.
   * @returns The newly created file record.
   */
  uploadFile: async (payload: { fileName: string; sizeBytes: number; folderId?: string; delegationId?: string; minutesId?: string; taskId?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<FileItem>>(`${getBasePrefix()}/files/upload`, payload);
    return response.data;
  },

  /**
   * Renames or updates metadata for an existing file.
   * @param id - Target file ID.
   * @param payload - Updated filename.
   * @returns Update confirmation.
   */
  patchFile: async (id: string, payload: { fileName?: string }) => {
    const response = await axiosClient.patch<ApiEnvelope<{ updated: boolean; file: FileItem }>>(`${getBasePrefix()}/files/${id}`, payload);
    return response.data;
  },

  /**
   * Generates a temporary, secure URL for file downloading.
   * @param id - ID of the file to download.
   * @returns Signed URL and expiration time.
   */
  createDownloadUrl: async (id: string) => {
    const response = await axiosClient.post<ApiEnvelope<{ url: string; expiresAt: string }>>(`${getBasePrefix()}/files/${id}/download-url`, {});
    return response.data;
  },

  /**
   * Grants permissions to another user or role for a specific file.
   * @param id - ID of the file to share.
   * @param payload - Access level and recipient details.
   * @returns The share ID.
   */
  shareFile: async (id: string, payload: { permissionLevel: "VIEW" | "EDIT"; sharedWithUserId?: string; sharedWithRoleId?: string; expiresAt?: string }) => {
    const response = await axiosClient.post<ApiEnvelope<{ shareId: string }>>(`${getBasePrefix()}/files/${id}/share`, payload);
    return response.data;
  },
};

/**
 * Determines the simplified document category based on file extension.
 * @param fileName - Full name of the file.
 * @returns One of 'pdf', 'image', or 'docx'.
 */
export const toDocumentType = (fileName: string): "pdf" | "image" | "docx" => {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) return "image";
  return "docx";
};

/**
 * Formats a byte size into a human-readable string (KB or MB).
 * @param bytes - Size in bytes.
 * @returns Formatted string (e.g., "1.5MB" or "450KB").
 */
export const toSizeLabel = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
};

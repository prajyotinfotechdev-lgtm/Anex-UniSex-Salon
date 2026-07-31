export interface StorageProvider {
  uploadFile(file: any, folder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getFileUrl(filePath: string): Promise<string>;
}

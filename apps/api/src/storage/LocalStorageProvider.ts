import fs from 'fs';
import path from 'path';
import { StorageProvider } from './StorageProvider';

export class LocalStorageProvider implements StorageProvider {
  private baseDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(file: any, folder: string = ''): Promise<string> {
    const targetDir = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    const targetPath = path.join(targetDir, filename);

    fs.copyFileSync(file.path, targetPath);
    // Optionally remove original if using os.tmpdir() for multer
    if (file.path !== targetPath && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return `/uploads/${folder ? folder + '/' : ''}${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.replace('/uploads/', '');
    const absolutePath = path.join(this.baseDir, relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    return `/uploads/${filePath}`;
  }
}

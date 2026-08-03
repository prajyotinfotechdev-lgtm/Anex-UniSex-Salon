import { Router } from 'express';
import multer from 'multer';
import { mediaController } from './media.controller';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../rbac/permission.middleware';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// All media routes require authentication
router.use(requireAuth);

router.post(
  '/upload',
  upload.single('file'),
  mediaController.uploadAsset
);

router.post(
  '/upload-contextual',
  upload.single('file'),
  mediaController.uploadContextualAsset
);

router.get(
  '/',
  mediaController.listAssets
);

router.put(
  '/:id',
  mediaController.updateAssetMetadata
);

router.delete(
  '/:id',
  mediaController.deleteAsset
);

export default router;

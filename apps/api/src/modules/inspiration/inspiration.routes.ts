import { Router } from 'express';
import { InspirationController } from './inspiration.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  createInspirationPostSchema,
  updateInspirationPostSchema,
  listInspirationPostsSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from './inspiration.validator';

const router = Router();

// ─── Posts ────────────────────────────────────────────────────────────────────
router.get('/', validate(listInspirationPostsSchema), InspirationController.listPosts);
router.post('/', validate(createInspirationPostSchema), InspirationController.createPost);

router.get('/analytics', InspirationController.getAnalytics);

router.get('/:id', InspirationController.getPost);
router.put('/:id', validate(updateInspirationPostSchema), InspirationController.updatePost);
router.delete('/:id', InspirationController.deletePost);
router.post('/:id/publish', InspirationController.publishPost);
router.post('/:id/archive', InspirationController.archivePost);

// ─── Collections ──────────────────────────────────────────────────────────────
router.get('/collections', InspirationController.listCollections);
router.post('/collections', validate(createCollectionSchema), InspirationController.createCollection);
router.put('/collections/:id', validate(updateCollectionSchema), InspirationController.updateCollection);
router.delete('/collections/:id', InspirationController.deleteCollection);

export default router;

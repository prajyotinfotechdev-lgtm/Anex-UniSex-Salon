import { Request, Response, NextFunction } from 'express';
import { InspirationService } from './inspiration.service';
import { NotFoundError, UnauthorizedError } from '../../errors/AppErrors';

// Helper: extract organizationId from JWT payload (injected by auth middleware)
function getOrgId(req: Request): string {
  const orgId = (req as any).user?.organizationId as string | undefined;
  if (!orgId) throw new UnauthorizedError();
  return orgId;
}

function getCustomerId(req: Request): string | null {
  return ((req as any).customer?.id as string) ?? null;
}

// ─── Admin Controllers ────────────────────────────────────────────────────────

export const InspirationController = {
  // Posts
  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const result = await InspirationService.listPosts(organizationId, req.query as any);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const post = await InspirationService.getPost(organizationId, (req.params.id as string));
      res.json({ success: true, data: post });
    } catch (err) { next(err); }
  },

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const post = await InspirationService.createPost(organizationId, req.body);
      res.status(201).json({ success: true, data: post });
    } catch (err) { next(err); }
  },

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const post = await InspirationService.updatePost(organizationId, (req.params.id as string), req.body);
      res.json({ success: true, data: post });
    } catch (err) { next(err); }
  },

  async publishPost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const post = await InspirationService.publishPost(organizationId, (req.params.id as string));
      res.json({ success: true, data: post });
    } catch (err) { next(err); }
  },

  async archivePost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const post = await InspirationService.archivePost(organizationId, (req.params.id as string));
      res.json({ success: true, data: post });
    } catch (err) { next(err); }
  },

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const result = await InspirationService.deletePost(organizationId, (req.params.id as string));
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const data = await InspirationService.getAnalytics(organizationId);
      res.json({ success: true, ...data });
    } catch (err) { next(err); }
  },

  // Collections
  async listCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const data = await InspirationService.listCollections(organizationId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const data = await InspirationService.createCollection(organizationId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const data = await InspirationService.updateCollection(organizationId, (req.params.id as string), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async deleteCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrgId(req);
      const result = await InspirationService.deleteCollection(organizationId, (req.params.id as string));
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },
};

// ─── Public Controllers ───────────────────────────────────────────────────────

export const InspirationPublicController = {
  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).publicOrganizationId || (req as any).organizationId;
      const params = { ...(req.query as any), status: 'PUBLISHED' };
      const result = await InspirationService.listPosts(organizationId, params);

      // Track impressions async for returned posts
      const customerId = getCustomerId(req);
      result.data.forEach((post: any) => {
        InspirationService.trackEvent(post.id, customerId, 'IMPRESSION');
      });

      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).publicOrganizationId || (req as any).organizationId;
      const post = await InspirationService.getPost(organizationId, (req.params.slug as string));

      if (post.status !== 'PUBLISHED') throw new NotFoundError('Post not found');

      // Track detail open async
      const customerId = getCustomerId(req);
      InspirationService.trackEvent(post.id, customerId, 'DETAIL_OPEN');

      res.json({ success: true, data: post });
    } catch (err) { next(err); }
  },

  async listCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).publicOrganizationId || (req as any).organizationId;
      const collections = await InspirationService.listCollections(organizationId);
      const published = collections.filter((c: any) => c.status === 'PUBLISHED');
      res.json({ success: true, data: published });
    } catch (err) { next(err); }
  },

  async getCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).publicOrganizationId || (req as any).organizationId;
      const collections = await InspirationService.listCollections(organizationId);
      const col = collections.find((c: any) => c.slug === (req.params.slug as string));
      if (!col) throw new NotFoundError('Collection not found');
      res.json({ success: true, data: col });
    } catch (err) { next(err); }
  },

  async getStylistPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).publicOrganizationId || (req as any).organizationId;
      const result = await InspirationService.listPosts(organizationId, {
        employeeId: (req.params.employeeId as string),
        status: 'PUBLISHED' as any,
        limit: 30,
      });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).publicOrganizationId || (req as any).organizationId;
      const post = await InspirationService.getPost(organizationId, (req.params.id as string));
      const customerId = getCustomerId(req);
      InspirationService.trackEvent(post.id, customerId, req.body.eventType, req.body.metadata);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
};

// ─── Authenticated Customer Controllers ───────────────────────────────────────

export const InspirationMeController = {
  async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer?.id;
      if (!customerId) throw new UnauthorizedError('Unauthorized');
      const result = await InspirationService.toggleBookmark(customerId, (req.params.id as string));
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = (req as any).customer;
      if (!customer) throw new UnauthorizedError('Unauthorized');
      const result = await InspirationService.getCustomerBookmarks(customer.id, customer.organizationId);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },
};



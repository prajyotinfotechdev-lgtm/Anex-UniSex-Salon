import { InspirationContextHandler } from './inspiration.context';
import { HomepageBannerContextHandler } from './homepage-banner.context';
import { ContextHandler } from '../context.types';

// New contexts can be added here without modifying the core Media Content Engine
export const defaultContexts: ContextHandler[] = [
  new InspirationContextHandler(),
  new HomepageBannerContextHandler(),
];

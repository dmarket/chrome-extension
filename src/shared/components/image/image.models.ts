export interface ImageLoaderParams {
  isExternal?: boolean;
  disablePathOptimizer?: boolean;
}

export type ImageTypes = 'externalPathOptimized' | 'internalPathOptimized' | 'internal' | 'external';

declare module 'photoswipe-dynamic-caption-plugin' {
  import PhotoSwipeLightbox from 'photoswipe/lightbox';

  export interface PhotoSwipeDynamicCaptionOptions {
    type?: 'auto' | 'below' | 'aside';
    captionContent?: string | ((slide: any) => string);
    mobileLayoutBreakpoint?: number | ((pswp: any, captionPlugin: any) => boolean);
    horizontalEdgeThreshold?: number;
    mobileCaptionOverlapRatio?: number;
    verticallyCenterImage?: boolean;
  }

  export default class PhotoSwipeDynamicCaption {
    constructor(lightbox: PhotoSwipeLightbox, options?: PhotoSwipeDynamicCaptionOptions);
  }
}

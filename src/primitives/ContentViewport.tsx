import React from 'react';

/** Scale an entire interface uniformly, including its typography, into a window. */
export const ContentViewport: React.FC<{
  width: number;
  height: number;
  designWidth?: number;
  minimumDesignHeight?: number;
  children: React.ReactNode;
}> = ({width, height, designWidth = 800, minimumDesignHeight = 0, children}) => {
  const scale = Math.max(0.1, Math.min(width / designWidth, minimumDesignHeight ? height / minimumDesignHeight : Infinity));
  return <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
    <div data-content-scale={scale} style={{position: 'absolute', left: 0, top: 0, width: width / scale, height: height / scale, transform: `scale(${scale})`, transformOrigin: 'top left'}}>{children}</div>
  </div>;
};

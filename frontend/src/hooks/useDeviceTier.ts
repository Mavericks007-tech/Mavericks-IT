'use client';

import { useEffect, useState } from 'react';

export type DeviceTier = 'high' | 'mid' | 'low';

interface DeviceInfo {
  tier: DeviceTier;
  isMobile: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
  hasWebGL: boolean;
  ready: boolean;
}

/**
 * Detect device capability for adaptive rendering.
 * - high: full 3D + particles + shaders + post-processing
 * - mid: 3D w/ reduced geometry, fewer particles, no post
 * - low: 2D CSS fallback only, no WebGL
 */
export function useDeviceTier(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>({
    tier: 'mid',
    isMobile: false,
    isTouch: false,
    prefersReducedMotion: false,
    hasWebGL: true,
    ready: false,
  });

  useEffect(() => {
    const detect = (): DeviceInfo => {
      if (typeof window === 'undefined') {
        return { tier: 'mid', isMobile: false, isTouch: false, prefersReducedMotion: false, hasWebGL: true, ready: true };
      }

      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|Mobile/i.test(navigator.userAgent);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // WebGL probe
      let hasWebGL = false;
      let maxTexture = 0;
      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
        if (gl) {
          hasWebGL = true;
          maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
        }
      } catch {
        hasWebGL = false;
      }

      const cores = navigator.hardwareConcurrency || 4;
      // @ts-expect-error — non-standard
      const memory = (navigator.deviceMemory as number) || 4;
      const connection = (navigator as any).connection;
      const saveData = connection?.saveData === true;
      const slowNet = connection?.effectiveType && /2g|slow/.test(connection.effectiveType);

      let tier: DeviceTier;
      if (reducedMotion || saveData || !hasWebGL) {
        tier = 'low';
      } else if (isMobile && (cores <= 4 || memory <= 3 || slowNet || maxTexture < 4096)) {
        tier = 'low';
      } else if (isMobile || cores <= 4 || memory <= 4) {
        tier = 'mid';
      } else {
        tier = 'high';
      }

      return {
        tier,
        isMobile,
        isTouch,
        prefersReducedMotion: reducedMotion,
        hasWebGL,
        ready: true,
      };
    };

    setInfo(detect());

    const resize = () => setInfo(detect());
    window.addEventListener('resize', resize, { passive: true });
    return () => window.removeEventListener('resize', resize);
  }, []);

  return info;
}

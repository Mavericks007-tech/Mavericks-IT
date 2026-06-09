'use client';

import { useEffect } from 'react';

import { registerToastBridge, useToast } from './Toast';

export function ToastBridge() {
  const t = useToast();
  useEffect(() => { registerToastBridge(t); }, [t]);
  return null;
}

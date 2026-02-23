'use client';

export type SyncStatus = 'synced' | 'syncing' | 'dirty' | 'offline';

export type ConfigSection =
  | 'overview'
  | 'journey'
  | 'plans'
  | 'health'
  | 'chat'
  | 'branding'
  | 'preview';

export interface ConfigSidebarItem {
  id: ConfigSection;
  label: string;
  href: string;
  icon: string;
}

export interface DragItem {
  id: string;
  type: 'phase' | 'step';
  parentId?: string;
}

export interface PhaseCardUIState {
  expanded: boolean;
  dragging: boolean;
}

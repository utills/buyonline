import type { JourneyConfig } from '@buyonline/shared-types';

export interface ConfiguratorRecord {
  id: string;
  version: number;
  config: JourneyConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetConfigResponse {
  id: string;
  version: number;
  config: JourneyConfig;
  updatedAt: string;
}

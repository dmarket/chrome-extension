import { DmExtTabStatus, GaEventNames, MessageActionNames } from '@myth/dm-ext-shared-constants';
import { DmExtOptions } from './options-storage.util';

export interface ApiMessage {
  dmExtApi: string;
  options?: Record<string, unknown>;
  body?: Record<string, unknown>;
  error?: string;
}

export interface ActionMessage {
  action: MessageActionNames;
  currentTabStatus?: DmExtTabStatus;
  domain?: string;
  options?: DmExtOptions;
}

export interface AnalyticsMessage {
  eventName: GaEventNames;
  params?: Record<string, string | number | boolean>;
}

export const isApiMessage = (message: unknown): message is ApiMessage => {
  return Object.prototype.hasOwnProperty.call(message as ApiMessage, 'dmExtApi');
};

export const isActionMessage = (message: unknown): message is ActionMessage => {
  return Object.prototype.hasOwnProperty.call(message as ActionMessage, 'action');
};

export const isAnalyticsMessage = (message: unknown): message is AnalyticsMessage => {
  return Object.prototype.hasOwnProperty.call(message as AnalyticsMessage, 'eventName');
};

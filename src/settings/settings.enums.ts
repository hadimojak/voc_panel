export const INTEGRATION_IDS = [
  'crm',
  'coreInsurance',
  'callCenter',
  'voices',
  'ai',
] as const;

export type IntegrationId = (typeof INTEGRATION_IDS)[number];

export const INTEGRATION_STATUSES = [
  'connected',
  'degraded',
  'disconnected',
] as const;

export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

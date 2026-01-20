// Centralized query keys for settings
export const settingsKeys = {
  all: ['settings'] as const,
  categories: () => [...settingsKeys.all, 'categories'] as const,
  settings: () => [...settingsKeys.all, 'list'] as const,
  settingsByCategory: (code: string) => [...settingsKeys.settings(), code] as const,
  setting: (key: string) => [...settingsKeys.all, 'detail', key] as const,
  history: (settingId?: string) => [...settingsKeys.all, 'history', settingId] as const,
  taxRates: () => [...settingsKeys.all, 'taxRates'] as const,
  paymentMethods: () => [...settingsKeys.all, 'paymentMethods'] as const,
  businessHours: () => [...settingsKeys.all, 'businessHours'] as const,
  printers: () => [...settingsKeys.all, 'printers'] as const,
  emailTemplates: () => [...settingsKeys.all, 'emailTemplates'] as const,
  receiptTemplates: () => [...settingsKeys.all, 'receiptTemplates'] as const,
}

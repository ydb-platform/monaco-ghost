import { CodeCompletionConfig, ServiceConfig } from './types';
import { ICodeCompletionAPI } from '../types';
import { v4 } from 'uuid';

const DEFAULT_CONFIG: Required<CodeCompletionConfig> = {
  debounceTime: 200,
  suggestionCache: {
    enabled: true,
  },
  sessionId: v4(),
};

export function createServiceConfig(
  api: ICodeCompletionAPI,
  userConfig?: CodeCompletionConfig
): ServiceConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    suggestionCache: {
      ...DEFAULT_CONFIG.suggestionCache,
      ...(userConfig?.suggestionCache || {}),
    },
    api,
  };
}

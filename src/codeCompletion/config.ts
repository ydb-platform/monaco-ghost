import { CodeCompletionConfig, ServiceConfig } from "./types";
import { EventEmitter } from "../events";
import { ICodeCompletionAPI } from "../types";

const DEFAULT_CONFIG: Required<CodeCompletionConfig> = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
};

export function createServiceConfig(
  api: ICodeCompletionAPI,
  events: EventEmitter,
  userConfig?: CodeCompletionConfig
): ServiceConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    textLimits: {
      ...DEFAULT_CONFIG.textLimits,
      ...(userConfig?.textLimits || {}),
    },
    suggestionCache: {
      ...DEFAULT_CONFIG.suggestionCache,
      ...(userConfig?.suggestionCache || {}),
    },
    api,
    events,
  };
}

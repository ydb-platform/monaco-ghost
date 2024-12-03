import { CodeCompletionService } from "./CodeCompletionService";
import type { CodeCompletionConfig, ICodeCompletionAPI } from "./types";

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

export function createCodeCompletionService(
  api: ICodeCompletionAPI,
  userConfig: CodeCompletionConfig = {}
): CodeCompletionService {
  const mergedConfig: Required<CodeCompletionConfig> = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    textLimits: {
      beforeCursor:
        userConfig.textLimits?.beforeCursor ??
        DEFAULT_CONFIG.textLimits.beforeCursor,
      afterCursor:
        userConfig.textLimits?.afterCursor ??
        DEFAULT_CONFIG.textLimits.afterCursor,
    },
    suggestionCache: {
      enabled:
        userConfig.suggestionCache?.enabled ??
        DEFAULT_CONFIG.suggestionCache.enabled,
    },
  };

  return new CodeCompletionService(api, mergedConfig);
}

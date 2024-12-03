import { CodeCompletionService } from "./services/codeCompletion";
import type { CodeCompletionConfig, ICodeCompletionAPI } from "./types";

export function createCodeCompletionService(
  api: ICodeCompletionAPI,
  userConfig: CodeCompletionConfig = {}
): CodeCompletionService {
  return new CodeCompletionService(api, userConfig);
}

// Export types needed for API and store integration
export type {
  ICodeCompletionAPI,
  ICodeCompletionService,
  CodeCompletionConfig,
  PromptFile,
  Suggestions,
} from "./types";

// Export event types
export type { CompletionEvents } from "./events";
export { EventEmitter } from "./events";

// Export functions needed for Monaco editor integration
export { createCodeCompletionService } from "./factory";
export { registerCompletionCommands } from "./registerCommands";

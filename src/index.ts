export { createCodeCompletionService } from './factory';
export { registerCompletionCommands } from './registerCommands';
export { useMonacoGhost } from './hooks/useMonacoGhost';
export { createMonacoGhostInstance, MonacoGhostInstance } from './factory';
export type {
  CodeCompletionConfig,
  ICodeCompletionService,
  ICodeCompletionAPI,
  EnrichedCompletion,
  PromptFile,
  Suggestions,
  PromptPosition,
  PromptFragment,
  DiscardReason,
} from './types';

export type { AcceptEvent, DeclineEvent, IgnoreEvent } from './events';

export { MonacoEditor } from './components/MonacoEditor';

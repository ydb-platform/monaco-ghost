export { createCodeCompletionService } from './factory';
export { registerCompletionCommands } from './registerCommands';
export { useMonacoGhost } from './hooks/useMonacoGhost';
export type {
  CodeCompletionConfig,
  ICodeCompletionService,
  ICodeCompletionAPI,
  EnrichedCompletion,
} from './types';
export { MonacoEditor } from './components/MonacoEditor';

import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { AcceptEvent, DeclineEvent, GhostEventEmitter, IgnoreEvent } from './events';

export interface PromptPosition {
  lineNumber: number;
  column: number;
}

export interface PromptFragment {
  text: string;
  start: PromptPosition;
  end: PromptPosition;
}

export interface PromptFile {
  path: string;
  fragments: PromptFragment[];
  cursorPosition: PromptPosition;
}

export interface Suggestions {
  items: string[];
  requestId?: string;
}

export type DiscardReason = 'OnCancel';

export interface ICodeCompletionAPI {
  getCodeAssistSuggestions(data: PromptFile[]): Promise<Suggestions>;
}

export interface ICodeCompletionEventHandlers {
  onCompletionAccept?: (event: AcceptEvent) => void;
  onCompletionDecline?: (event: DeclineEvent) => void;
  onCompletionIgnore?: (event: IgnoreEvent) => void;
  onCompletionError?: (error: Error) => void;
}

export interface EnrichedCompletion extends monaco.languages.InlineCompletion {
  pristine: string;
}

export interface ICodeCompletionService extends monaco.languages.InlineCompletionsProvider {
  events: GhostEventEmitter;
  handleItemDidShow(
    completions: monaco.languages.InlineCompletions<EnrichedCompletion>,
    item: EnrichedCompletion
  ): void;
  handlePartialAccept(
    completions: monaco.languages.InlineCompletions,
    item: monaco.languages.InlineCompletion,
    acceptedLetters: number
  ): void;
  handleAccept(params: { requestId: string; suggestionText: string }): void;
  commandDiscard(reason: DiscardReason, editor: monaco.editor.IStandaloneCodeEditor): void;
  emptyCache(): void;
  hasActiveSuggestions(): boolean;
}

export interface CodeCompletionConfig {
  // Performance settings
  debounceTime?: number; // Time in ms to debounce API calls (default: 200)

  // Cache settings
  suggestionCache?: {
    enabled?: boolean; // Whether to enable suggestion caching (default: true)
  };

  sessionId?: string;
}

import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import type { EventEmitter } from "./events";

type IdeInfo = {
  Ide: string;
  IdeVersion: string;
  PluginFamily: string;
  PluginVersion: string;
};

export interface Prompt {
  Files: PromptFile[];
  ContextCreateType: ContextCreateType;
  ForceSuggest?: boolean;
  IdeInfo: IdeInfo;
}

export interface PromptPosition {
  Ln: number;
  Col: number;
}

export interface PromptFragment {
  Text: string;
  Start: PromptPosition;
  End: PromptPosition;
}

export interface PromptFile {
  Path: string;
  Fragments: PromptFragment[];
  Cursor: PromptPosition;
}

export type ContextCreateType = 1;

export interface Suggestions {
  Suggests: Suggestion[];
  RequestId: string;
}

export type DiscardReason = "OnCancel";

export interface Suggestion {
  Text: string;
}

export interface ICodeCompletionAPI {
  getCodeAssistSuggestions(data: PromptFile[]): Promise<Suggestions>;
}

export interface EnrichedCompletion extends monaco.languages.InlineCompletion {
  pristine: string;
}

export interface InternalSuggestion {
  items: EnrichedCompletion[];
  requestId?: string;
  shownCount: number;
  wasAccepted?: boolean;
}

export interface ICodeCompletionService
  extends monaco.languages.InlineCompletionsProvider {
  events: EventEmitter;
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
  commandDiscard(
    reason: DiscardReason,
    editor: monaco.editor.IStandaloneCodeEditor
  ): void;
  emptyCache(): void;
}

export interface CodeCompletionConfig {
  // Performance settings
  debounceTime?: number; // Time in ms to debounce API calls (default: 200)

  // Text limits
  textLimits?: {
    beforeCursor?: number; // Characters to include before cursor (default: 8000)
    afterCursor?: number; // Characters to include after cursor (default: 1000)
  };

  // Cache settings
  suggestionCache?: {
    enabled?: boolean; // Whether to enable suggestion caching (default: true)
  };
}

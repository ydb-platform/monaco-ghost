import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  CodeCompletionConfig,
  EnrichedCompletion,
  ICodeCompletionAPI,
  ICodeCompletionService,
} from '../types';

export interface TextLimits {
  beforeCursor: number;
  afterCursor: number;
}

export interface CompletionGroup {
  items: EnrichedCompletion[];
  shownCount: number;
  requestId: string;
  wasAccepted?: boolean;
}

export interface CacheManager {
  getCachedCompletion(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): EnrichedCompletion[];
  setCompletionGroup(group: CompletionGroup): void;
  emptyCache(): void;
  getCompletionGroup(): CompletionGroup | null;
  incrementShownCount(pristineText: string): void;
  markAsAccepted(pristineText: string): void;
  getActiveCompletion(): string | null;
}

export interface SuggestionProvider {
  getSuggestions(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): Promise<{ suggestions: EnrichedCompletion[]; requestId: string }>;
}

export interface ServiceConfig extends Required<CodeCompletionConfig> {
  api: ICodeCompletionAPI;
}

export type {
  ICodeCompletionService,
  CodeCompletionConfig,
  EnrichedCompletion,
  ICodeCompletionAPI,
};

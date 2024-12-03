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

export interface InternalSuggestion {
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
  addToCache(suggestions: InternalSuggestion[]): void;
  emptyCache(): void;
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

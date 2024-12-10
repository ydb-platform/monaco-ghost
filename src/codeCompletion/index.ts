import * as monaco from 'monaco-editor';
import {
  CodeCompletionConfig,
  EnrichedCompletion,
  ICodeCompletionAPI,
  ICodeCompletionService,
} from './types';
import { createServiceConfig } from './config';
import { SuggestionCacheManager } from './cache';
import { CodeSuggestionProvider } from './suggestionProvider';
import { GhostEventEmitter } from '../events';
import type { DiscardReason } from '../types';

export class CodeCompletionService implements ICodeCompletionService {
  private readonly cacheManager: SuggestionCacheManager;
  private readonly suggestionProvider: CodeSuggestionProvider;
  private readonly config: ReturnType<typeof createServiceConfig>;
  public events: GhostEventEmitter;

  constructor(api: ICodeCompletionAPI, userConfig?: CodeCompletionConfig) {
    this.events = new GhostEventEmitter();
    this.config = createServiceConfig(api, userConfig);
    this.cacheManager = new SuggestionCacheManager();
    this.suggestionProvider = new CodeSuggestionProvider(this.config, this.events);
  }

  async provideInlineCompletions(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.InlineCompletionContext,
    _token: monaco.CancellationToken
  ) {
    if (this.config.suggestionCache.enabled) {
      const cachedCompletions = this.cacheManager.getCachedCompletion(model, position);
      if (cachedCompletions.length) {
        return { items: cachedCompletions };
      }
    }

    // Clear previous suggestions and dismiss them
    const prevSuggestions = this.cacheManager.getSuggestions();
    while (prevSuggestions.length > 0) {
      this.dismissCompletion(prevSuggestions.pop());
    }

    const { suggestions, requestId } = await this.suggestionProvider.getSuggestions(
      model,
      position
    );

    if (suggestions.length) {
      this.cacheManager.addToCache([{ items: suggestions, shownCount: 0, requestId }]);
    }

    return { items: suggestions };
  }

  handleItemDidShow(
    _completions: monaco.languages.InlineCompletions<EnrichedCompletion>,
    item: EnrichedCompletion
  ) {
    if (!this.config.suggestionCache.enabled) {
      return;
    }
    this.cacheManager.incrementShownCount(item.pristine);
  }

  handlePartialAccept(
    _completions: monaco.languages.InlineCompletions,
    item: monaco.languages.InlineCompletion,
    acceptedLetters: number
  ) {
    const { command } = item;
    const commandArguments = command?.arguments?.[0] ?? {};
    const { suggestionText, requestId, prevWordLength = 0 } = commandArguments;

    if (requestId && suggestionText && typeof item.insertText === 'string') {
      const acceptedText = item.insertText.slice(prevWordLength, acceptedLetters);
      if (acceptedText) {
        this.cacheManager.markAsAccepted(suggestionText);
        this.events.emit('completion:accept', {
          requestId,
          acceptedText,
        });
      }
    }
  }

  handleAccept({ requestId, suggestionText }: { requestId: string; suggestionText: string }) {
    this.cacheManager.emptyCache();
    this.events.emit('completion:accept', {
      requestId,
      acceptedText: suggestionText,
    });
  }

  commandDiscard(
    reason: DiscardReason = 'OnCancel',
    editor: monaco.editor.IStandaloneCodeEditor
  ): void {
    const suggestions = this.cacheManager.getSuggestions();
    while (suggestions.length > 0) {
      this.discardCompletion(reason, suggestions.pop());
    }
    editor.trigger(undefined, 'editor.action.inlineSuggest.hide', undefined);
  }

  emptyCache() {
    this.cacheManager.emptyCache();
  }

  hasActiveSuggestions(): boolean {
    return this.cacheManager.getSuggestions().length > 0;
  }

  freeInlineCompletions(): void {
    // This method is required by Monaco's InlineCompletionsProvider interface
    // but we don't need to do anything here since we handle cleanup in other methods
  }

  private discardCompletion(
    reason: DiscardReason,
    completion?: {
      items: EnrichedCompletion[];
      requestId: string;
      shownCount: number;
    }
  ): void {
    if (!completion?.requestId || !completion.items?.length) {
      return;
    }

    const [firstItem, ...otherItems] = completion.items;
    if (!firstItem) {
      return;
    }

    // Emit single decline event with first suggestion as active and rest as others
    this.events.emit('completion:decline', {
      requestId: completion.requestId,
      suggestionText: firstItem.pristine,
      reason,
      hitCount: completion.shownCount,
      otherSuggestions: otherItems.map(item => item.pristine),
    });
  }

  private dismissCompletion(completion?: {
    items: EnrichedCompletion[];
    requestId: string;
    shownCount: number;
    wasAccepted?: boolean;
  }): void {
    if (
      !completion?.requestId ||
      !completion.items?.length ||
      !completion.shownCount ||
      completion.wasAccepted
    ) {
      return;
    }

    const [firstItem, ...otherItems] = completion.items;
    if (!firstItem) {
      return;
    }

    // Emit single ignore event with first suggestion as active and rest as others
    this.events.emit('completion:ignore', {
      requestId: completion.requestId,
      suggestionText: firstItem.pristine,
      otherSuggestions: otherItems.map(item => item.pristine),
    });
  }
}

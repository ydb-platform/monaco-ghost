import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  CodeCompletionConfig,
  EnrichedCompletion,
  ICodeCompletionAPI,
  ICodeCompletionService,
} from "./types";
import { createServiceConfig } from "./config";
import { SuggestionCacheManager } from "./cache";
import { CodeSuggestionProvider } from "./suggestionProvider";
import { EventEmitter } from "../events";
import type { DiscardReason } from "../types";

export class CodeCompletionService implements ICodeCompletionService {
  private readonly cacheManager: SuggestionCacheManager;
  private readonly suggestionProvider: CodeSuggestionProvider;
  private readonly config: ReturnType<typeof createServiceConfig>;
  public readonly events: EventEmitter;

  constructor(api: ICodeCompletionAPI, userConfig?: CodeCompletionConfig) {
    this.events = new EventEmitter();
    this.config = createServiceConfig(api, this.events, userConfig);
    this.cacheManager = new SuggestionCacheManager();
    this.suggestionProvider = new CodeSuggestionProvider(this.config);
  }

  async provideInlineCompletions(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.InlineCompletionContext,
    _token: monaco.CancellationToken
  ) {
    if (this.config.suggestionCache.enabled) {
      const cachedCompletions = this.cacheManager.getCachedCompletion(
        model,
        position
      );
      if (cachedCompletions.length) {
        return { items: cachedCompletions };
      }
    }

    // Clear previous suggestions and dismiss them
    const prevSuggestions = this.cacheManager.getSuggestions();
    while (prevSuggestions.length > 0) {
      this.dismissCompletion(prevSuggestions.pop());
    }

    const { suggestions, requestId } =
      await this.suggestionProvider.getSuggestions(model, position);

    if (suggestions.length) {
      this.cacheManager.addToCache([
        { items: suggestions, shownCount: 0, requestId },
      ]);
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

    if (requestId && suggestionText && typeof item.insertText === "string") {
      const acceptedText = item.insertText.slice(
        prevWordLength,
        acceptedLetters
      );
      if (acceptedText) {
        this.cacheManager.markAsAccepted(suggestionText);
        this.events.emit("completion:accept", {
          requestId,
          acceptedText,
        });
      }
    }
  }

  handleAccept({
    requestId,
    suggestionText,
  }: {
    requestId: string;
    suggestionText: string;
  }) {
    this.cacheManager.emptyCache();
    this.events.emit("completion:accept", {
      requestId,
      acceptedText: suggestionText,
    });
  }

  commandDiscard(
    reason: DiscardReason = "OnCancel",
    editor: monaco.editor.IStandaloneCodeEditor
  ): void {
    const suggestions = this.cacheManager.getSuggestions();
    while (suggestions.length > 0) {
      this.discardCompletion(reason, suggestions.pop());
    }
    editor.trigger(undefined, "editor.action.inlineSuggest.hide", undefined);
  }

  emptyCache() {
    this.cacheManager.emptyCache();
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
    if (completion === undefined) {
      return;
    }
    const { requestId, items, shownCount } = completion;
    if (!requestId || !items.length) {
      return;
    }
    for (const item of items) {
      this.events.emit("completion:decline", {
        requestId,
        suggestionText: item.pristine,
        reason,
        hitCount: shownCount,
      });
    }
  }

  private dismissCompletion(completion?: {
    items: EnrichedCompletion[];
    requestId: string;
    shownCount: number;
    wasAccepted?: boolean;
  }): void {
    if (completion === undefined) {
      return;
    }
    const { requestId, items, shownCount, wasAccepted } = completion;

    if (!requestId || !items.length || !shownCount || wasAccepted) {
      return;
    }
    for (const item of items) {
      this.events.emit("completion:ignore", {
        requestId,
        suggestionText: item.pristine,
      });
    }
  }
}

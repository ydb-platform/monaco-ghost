import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { EnrichedCompletion, ServiceConfig, SuggestionProvider } from './types';
import { getPromptFileContent } from './prompt';
import { GhostEventEmitter } from '../events';

export class CodeSuggestionProvider implements SuggestionProvider {
  private timer: number | null = null;
  private events: GhostEventEmitter;
  private pendingPromise: Promise<{ suggestions: EnrichedCompletion[]; requestId: string }> | null =
    null;
  private pendingResolve:
    | ((value: { suggestions: EnrichedCompletion[]; requestId: string }) => void)
    | null = null;

  private readonly config: ServiceConfig;

  constructor(config: ServiceConfig, events: GhostEventEmitter) {
    this.config = config;
    this.events = events;
  }

  async getSuggestions(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): Promise<{ suggestions: EnrichedCompletion[]; requestId: string }> {
    // If there's a pending timer, clear it
    if (this.timer) {
      window.clearTimeout(this.timer);
    }

    // If there's no pending promise, create one
    if (!this.pendingPromise) {
      this.pendingPromise = new Promise(resolve => {
        this.pendingResolve = resolve;
      });
    }

    // Get the current pending promise
    const currentPromise = this.pendingPromise;

    // Set up new timer
    this.timer = window.setTimeout(async () => {
      try {
        let suggestions: EnrichedCompletion[] = [];
        let requestId = '';

        const data = getPromptFileContent(model, position, {
          beforeCursor: this.config.textLimits.beforeCursor,
          afterCursor: this.config.textLimits.afterCursor,
        });

        if (!data) {
          this.pendingResolve?.({ suggestions: [], requestId: '' });
          return;
        }

        const codeAssistSuggestions = await this.config.api.getCodeAssistSuggestions(data);
        requestId = codeAssistSuggestions?.RequestId || '';

        const { word, startColumn: lastWordStartColumn } = model.getWordUntilPosition(position);

        suggestions = (codeAssistSuggestions?.Suggests || []).map(el => {
          const suggestionText = el.Text;
          const label = word + suggestionText;

          return {
            label,
            sortText: 'a',
            insertText: label,
            pristine: suggestionText,
            range: new monaco.Range(
              position.lineNumber,
              lastWordStartColumn,
              position.lineNumber,
              position.column
            ),
            command: {
              id: 'acceptCodeAssistCompletion',
              title: '',
              arguments: [
                {
                  requestId,
                  suggestionText,
                  prevWordLength: word.length,
                },
              ],
            },
          };
        });

        this.pendingResolve?.({ suggestions, requestId });
      } catch (err) {
        this.events.emit('completion:error', err instanceof Error ? err : new Error(String(err)));
        this.pendingResolve?.({ suggestions: [], requestId: '' });
      } finally {
        this.pendingPromise = null;
        this.pendingResolve = null;
        this.timer = null;
      }
    }, this.config.debounceTime);

    return currentPromise;
  }
}

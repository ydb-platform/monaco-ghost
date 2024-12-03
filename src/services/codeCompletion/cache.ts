import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { CacheManager, EnrichedCompletion, InternalSuggestion } from "./types";

export class SuggestionCacheManager implements CacheManager {
  private suggestions: InternalSuggestion[] = [];

  getCachedCompletion(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): EnrichedCompletion[] {
    const completions: EnrichedCompletion[] = [];

    for (const suggests of this.suggestions) {
      for (const completion of suggests.items) {
        if (!completion.range) {
          continue;
        }

        if (
          position.lineNumber < completion.range.startLineNumber ||
          position.column < completion.range.startColumn
        ) {
          continue;
        }

        const startCompletionPosition = new monaco.Position(
          completion.range.startLineNumber,
          completion.range.startColumn
        );
        const startOffset = model.getOffsetAt(startCompletionPosition);
        const endOffset = startOffset + completion.insertText.toString().length;
        const positionOffset = model.getOffsetAt(position);

        if (positionOffset > endOffset) {
          continue;
        }

        const completionReplaceText = completion.insertText
          .toString()
          .slice(0, positionOffset - startOffset);

        const newRange = new monaco.Range(
          completion.range.startLineNumber,
          completion.range.startColumn,
          position.lineNumber,
          position.column
        );
        const currentReplaceText = model.getValueInRange(newRange);

        if (
          completionReplaceText.toLowerCase() ===
          currentReplaceText.toLowerCase()
        ) {
          completions.push({
            insertText:
              currentReplaceText +
              completion.insertText
                .toString()
                .slice(positionOffset - startOffset),
            range: newRange,
            command: completion.command,
            pristine: completion.pristine,
          });
        }
      }
    }
    return completions;
  }

  addToCache(suggestions: InternalSuggestion[]): void {
    this.suggestions = suggestions;
  }

  emptyCache(): void {
    this.suggestions = [];
  }

  getSuggestions(): InternalSuggestion[] {
    return this.suggestions;
  }

  incrementShownCount(pristineText: string): void {
    for (const suggests of this.suggestions) {
      for (const completion of suggests.items) {
        if (completion.pristine === pristineText) {
          suggests.shownCount++;
          break;
        }
      }
    }
  }

  markAsAccepted(pristineText: string): void {
    const suggestion = this.suggestions.find((el) => {
      return el.items.some((item) => item.pristine === pristineText);
    });
    if (suggestion) {
      suggestion.wasAccepted = true;
    }
  }
}

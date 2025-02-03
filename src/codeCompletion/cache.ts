import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { CacheManager, EnrichedCompletion, CompletionGroup } from './types';

export class SuggestionCacheManager implements CacheManager {
  private currentGroup: CompletionGroup | null = null;
  private activeCompletion: string | null = null;

  setCompletionGroup(group: CompletionGroup): void {
    this.currentGroup = group;
  }

  getCompletionGroup(): CompletionGroup | null {
    return this.currentGroup;
  }

  getActiveCompletion(): string | null {
    return this.activeCompletion;
  }

  getCachedCompletion(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): EnrichedCompletion[] {
    const completions: EnrichedCompletion[] = [];

    if (this.currentGroup) {
      for (const completion of this.currentGroup.items) {
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

        if (completionReplaceText.toLowerCase() === currentReplaceText.toLowerCase()) {
          completions.push({
            insertText:
              currentReplaceText +
              completion.insertText.toString().slice(positionOffset - startOffset),
            range: newRange,
            command: completion.command,
            pristine: completion.pristine,
          });
        }
      }
    }
    return completions;
  }

  emptyCache(): void {
    this.currentGroup = null;
    this.activeCompletion = null;
  }

  incrementShownCount(pristineText: string): void {
    if (this.currentGroup) {
      for (const completion of this.currentGroup.items) {
        if (completion.pristine === pristineText) {
          this.currentGroup.shownCount++;
          this.activeCompletion = pristineText;
          break;
        }
      }
    }
  }

  markAsAccepted(pristineText: string): void {
    if (
      this.currentGroup?.items.some((item: EnrichedCompletion) => item.pristine === pristineText)
    ) {
      this.currentGroup.wasAccepted = true;
    }
  }
}

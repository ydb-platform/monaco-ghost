import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SuggestionCacheManager } from '../../cache';
import { CompletionGroup } from '../../types';

describe('SuggestionCacheManager: Tracking', () => {
  let cacheManager: SuggestionCacheManager;

  beforeEach(() => {
    cacheManager = new SuggestionCacheManager();
  });

  describe('suggestion tracking', () => {
    it('should increment shown count', () => {
      const group: CompletionGroup = {
        items: [
          {
            insertText: 'testCompletion',
            range: new monaco.Range(1, 1, 1, 5),
            pristine: 'testCompletion',
          },
        ],
        shownCount: 0,
        requestId: '123',
      };

      cacheManager.setCompletionGroup(group);
      cacheManager.incrementShownCount('testCompletion');

      const result = cacheManager.getCompletionGroup();
      expect(result?.shownCount).toBe(1);
    });

    it('should mark suggestion as accepted', () => {
      const group: CompletionGroup = {
        items: [
          {
            insertText: 'testCompletion',
            range: new monaco.Range(1, 1, 1, 5),
            pristine: 'testCompletion',
          },
        ],
        shownCount: 0,
        requestId: '123',
      };

      cacheManager.setCompletionGroup(group);
      cacheManager.markAsAccepted('testCompletion');

      const result = cacheManager.getCompletionGroup();
      expect(result?.wasAccepted).toBe(true);
    });

    it('should handle marking non-existent suggestion as accepted', () => {
      const group: CompletionGroup = {
        items: [
          {
            insertText: 'testCompletion',
            range: new monaco.Range(1, 1, 1, 5),
            pristine: 'testCompletion',
          },
        ],
        shownCount: 0,
        requestId: '123',
      };

      cacheManager.setCompletionGroup(group);
      cacheManager.markAsAccepted('nonExistentCompletion');

      const result = cacheManager.getCompletionGroup();
      expect(result?.wasAccepted).toBeUndefined();
    });
  });
});

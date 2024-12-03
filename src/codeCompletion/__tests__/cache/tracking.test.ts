import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SuggestionCacheManager } from '../../cache';
import { InternalSuggestion } from '../../types';

describe('SuggestionCacheManager: Tracking', () => {
  let cacheManager: SuggestionCacheManager;

  beforeEach(() => {
    cacheManager = new SuggestionCacheManager();
  });

  describe('suggestion tracking', () => {
    it('should increment shown count', () => {
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testCompletion',
              range: new monaco.Range(1, 1, 1, 5),
              pristine: 'testCompletion',
            },
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      cacheManager.incrementShownCount('testCompletion');

      const result = cacheManager.getSuggestions();
      expect(result[0]?.shownCount).toBe(1);
    });

    it('should mark suggestion as accepted', () => {
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testCompletion',
              range: new monaco.Range(1, 1, 1, 5),
              pristine: 'testCompletion',
            },
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      cacheManager.markAsAccepted('testCompletion');

      const result = cacheManager.getSuggestions();
      expect(result[0]?.wasAccepted).toBe(true);
    });

    it('should handle marking non-existent suggestion as accepted', () => {
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testCompletion',
              range: new monaco.Range(1, 1, 1, 5),
              pristine: 'testCompletion',
            },
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      cacheManager.markAsAccepted('nonExistentCompletion');

      const result = cacheManager.getSuggestions();
      expect(result[0]?.wasAccepted).toBeUndefined();
    });
  });
});

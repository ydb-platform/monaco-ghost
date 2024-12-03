import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SuggestionCacheManager } from '../../cache';
import { InternalSuggestion } from '../../types';

describe('SuggestionCacheManager: Core', () => {
  let cacheManager: SuggestionCacheManager;

  beforeEach(() => {
    cacheManager = new SuggestionCacheManager();
  });

  describe('cache management', () => {
    it('should store and retrieve suggestions', () => {
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
      const result = cacheManager.getSuggestions();
      expect(result).toEqual(suggestions);
    });

    it('should empty cache', () => {
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
      cacheManager.emptyCache();
      expect(cacheManager.getSuggestions()).toEqual([]);
    });
  });
});

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SuggestionCacheManager } from '../../cache';
import { CompletionGroup } from '../../types';

describe('SuggestionCacheManager: Core', () => {
  let cacheManager: SuggestionCacheManager;

  beforeEach(() => {
    cacheManager = new SuggestionCacheManager();
  });

  describe('cache management', () => {
    it('should store and retrieve completion group', () => {
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
      const result = cacheManager.getCompletionGroup();
      expect(result).toEqual(group);
    });

    it('should empty cache', () => {
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
      cacheManager.emptyCache();
      expect(cacheManager.getCompletionGroup()).toBeNull();
    });
  });
});

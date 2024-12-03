import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SuggestionCacheManager } from '../../cache';
import { EnrichedCompletion, InternalSuggestion } from '../../types';

describe('SuggestionCacheManager: Completion', () => {
  let cacheManager: SuggestionCacheManager;

  beforeEach(() => {
    cacheManager = new SuggestionCacheManager();
  });

  const createMockModel = (text: string): monaco.editor.ITextModel =>
    ({
      getOffsetAt: jest.fn((position: monaco.Position) => {
        // Mock that handles line numbers
        if (position.lineNumber > 1) {
          return text.length + (position.lineNumber - 1) + position.column - 1;
        }
        return position.column - 1;
      }),
      getValueInRange: jest.fn((range: monaco.Range) => {
        // Mock that handles line numbers
        if (range.startLineNumber === range.endLineNumber) {
          return text.slice(range.startColumn - 1, range.endColumn - 1);
        }
        return '';
      }),
    }) as unknown as monaco.editor.ITextModel;

  describe('getCachedCompletion', () => {
    it('should return matching completions for position', () => {
      const mockModel = createMockModel('test');
      const position = new monaco.Position(1, 3);
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testing',
              range: new monaco.Range(1, 1, 1, 5),
              pristine: 'testing',
              command: { id: 'test', title: 'test' },
            },
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      const completions = cacheManager.getCachedCompletion(mockModel, position);

      expect(completions).toBeDefined();
      expect(completions.length).toBeGreaterThan(0);
      expect(completions[0]?.insertText).toBe('testing');
    });

    it('should filter out completions before cursor position', () => {
      const mockModel = createMockModel('test');
      const position = new monaco.Position(2, 1); // Next line
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testing',
              range: new monaco.Range(1, 1, 1, 5), // Previous line
              pristine: 'testing',
            },
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      const completions = cacheManager.getCachedCompletion(mockModel, position);

      expect(completions).toHaveLength(0);
    });

    it('should handle completions without range', () => {
      const mockModel = createMockModel('test');
      const position = new monaco.Position(1, 3);
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testing',
              pristine: 'testing',
            } as EnrichedCompletion,
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      const completions = cacheManager.getCachedCompletion(mockModel, position);

      expect(completions).toHaveLength(0);
    });

    it('should match text case-insensitively', () => {
      const mockModel = createMockModel('TEST');
      const position = new monaco.Position(1, 5);
      const suggestions: InternalSuggestion[] = [
        {
          items: [
            {
              insertText: 'testing',
              range: new monaco.Range(1, 1, 1, 5),
              pristine: 'testing',
            },
          ],
          shownCount: 0,
          requestId: '123',
        },
      ];

      cacheManager.addToCache(suggestions);
      const completions = cacheManager.getCachedCompletion(mockModel, position);

      expect(completions).toHaveLength(1);
    });
  });
});

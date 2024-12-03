import { CodeCompletionService } from '../../index';
import {
  createMockApi,
  createMockEvents,
  createMockConfig,
  createMockPosition,
  createMockModel,
} from '../utils/testUtils';
import * as monaco from 'monaco-editor';
import { EnrichedCompletion } from '../../types';
import { getPromptFileContent } from '../../prompt';

// Mock the prompt module
jest.mock('../../prompt', () => ({
  getPromptFileContent: jest.fn(),
}));

describe('CodeCompletionService - Decline Events', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (getPromptFileContent as jest.Mock).mockReturnValue([
      { Path: 'test.ts', Fragments: [], Cursor: { Ln: 1, Col: 1 } },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('should emit decline event when suggestion is discarded', async () => {
    const mockApi = createMockApi();
    const mockEvents = createMockEvents();
    const config = createMockConfig(mockApi);
    const service = new CodeCompletionService(mockApi, config);
    service.events = mockEvents;
    const mockPosition = createMockPosition();
    const mockModel = {
      ...createMockModel(),
      getWordUntilPosition: () => ({ word: '', startColumn: 1, endColumn: 1 }),
    } as monaco.editor.ITextModel;
    const mockEditor = {
      trigger: jest.fn(),
    } as any;

    // Mock API response with the suggestion text
    const suggestionText = 'testFunction';
    const requestId = '123';
    mockApi.getCodeAssistSuggestions.mockResolvedValue({
      Suggests: [{ Text: suggestionText }],
      RequestId: requestId,
    });

    // Get suggestions
    const suggestionsPromise = service.provideInlineCompletions(
      mockModel,
      mockPosition,
      {} as any,
      {} as any
    );

    // Fast-forward timers to trigger the debounced API call
    jest.advanceTimersByTime(config.debounceTime);

    const result = await suggestionsPromise;
    expect(result.items).toHaveLength(1);

    const firstItem = result.items[0] as EnrichedCompletion;
    expect(firstItem).toBeDefined();
    expect(firstItem.pristine).toBe(suggestionText);

    // Show the suggestion
    service.handleItemDidShow(
      {
        items: [firstItem],
      } as monaco.languages.InlineCompletions<EnrichedCompletion>,
      firstItem
    );

    // Discard the suggestion
    service.commandDiscard('OnCancel', mockEditor);

    // Verify decline event was emitted
    expect(mockEvents.emit).toHaveBeenCalledWith(
      'completion:decline',
      expect.objectContaining({
        requestId,
        suggestionText,
        reason: 'OnCancel',
        hitCount: 1,
      })
    );
  });
});

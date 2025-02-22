import { CodeSuggestionProvider } from '../../suggestionProvider';
import { getPromptFileContent } from '../../prompt';
import {
  createMockApi,
  createMockConfig,
  createMockPosition,
  createMockModel,
  createMockEvents,
} from '../utils/testUtils';

// Mock the prompt module
jest.mock('../../prompt', () => ({
  getPromptFileContent: jest.fn(),
}));

describe('CodeSuggestionProvider - Core Functionality', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should format suggestions correctly', async () => {
    const mockApi = createMockApi();
    const config = createMockConfig(mockApi);
    const events = createMockEvents();
    const provider = new CodeSuggestionProvider(config, events);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    const mockPromptData = [
      {
        Path: 'test.ts',
        Fragments: [
          {
            Text: 'test',
            Start: { lineNumber: 1, column: 1 },
            End: { lineNumber: 1, column: 4 },
          },
        ],
        Cursor: { lineNumber: 1, column: 5 },
      },
    ];

    (getPromptFileContent as jest.Mock).mockReturnValue(mockPromptData);
    mockApi.getCodeAssistSuggestions.mockResolvedValue({
      items: ['testFunction'],
      requestId: '123',
    });

    const promise = provider.getSuggestions(mockModel, mockPosition);

    // Fast-forward timers
    jest.advanceTimersByTime(config.debounceTime);

    // Wait for promise to resolve
    const result = await promise;

    expect(result.suggestions).toHaveLength(1);

    if (result.suggestions.length === 0) {
      fail('Expected suggestions array to not be empty');
    }

    const suggestion = result.suggestions[0];
    expect(suggestion).toMatchObject({
      label: 'testtestFunction', // Current word 'test' + suggestion 'testFunction'
      sortText: 'a',
      insertText: 'testtestFunction',
      pristine: 'testFunction',
      command: {
        id: 'acceptCodeAssistCompletion',
        arguments: [
          {
            requestId: '123',
            suggestionText: 'testFunction',
            prevWordLength: 4,
          },
        ],
      },
    });

    // Verify range property exists
    if (!suggestion) {
      fail('Expected suggestion to be defined');
    }
    expect(suggestion.range).toBeDefined();
  });

  it('should handle empty prompt data', async () => {
    const mockApi = createMockApi();
    const events = createMockEvents();
    const config = createMockConfig(mockApi);
    const provider = new CodeSuggestionProvider(config, events);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    (getPromptFileContent as jest.Mock).mockReturnValue(null);

    const promise = provider.getSuggestions(mockModel, mockPosition);

    // Fast-forward timers
    jest.advanceTimersByTime(config.debounceTime);

    // Wait for promise to resolve
    const result = await promise;

    expect(result.suggestions).toHaveLength(0);
    expect(result.requestId).toBe('');
    expect(mockApi.getCodeAssistSuggestions).not.toHaveBeenCalled();
  });
});

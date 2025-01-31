import { CodeSuggestionProvider } from '../../suggestionProvider';
import { getPromptFileContent } from '../../prompt';
import {
  createMockApi,
  createMockEvents,
  createMockConfig,
  createMockPosition,
  createMockModel,
} from '../utils/testUtils';

// Mock the prompt module
jest.mock('../../prompt', () => ({
  getPromptFileContent: jest.fn(),
}));

describe('CodeSuggestionProvider - Error Handling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle API errors gracefully', async () => {
    const mockApi = createMockApi();
    const mockEvents = createMockEvents();
    const config = createMockConfig(mockApi);
    const provider = new CodeSuggestionProvider(config, mockEvents);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    const mockPromptData = [
      { Path: 'test.ts', Fragments: [], Cursor: { lineNumber: 1, column: 5 } },
    ];
    const mockError = new Error('API Error');

    (getPromptFileContent as jest.Mock).mockReturnValue(mockPromptData);
    mockApi.getCodeAssistSuggestions.mockRejectedValue(mockError);

    const promise = provider.getSuggestions(mockModel, mockPosition);

    // Fast-forward timers
    jest.advanceTimersByTime(config.debounceTime);

    // Wait for promise to resolve
    const result = await promise;

    // Should return empty suggestions but not crash
    expect(result.suggestions).toHaveLength(0);
    expect(result.requestId).toBe('');
    expect(mockEvents.emit).toHaveBeenCalledWith('completion:error', mockError);
  });

  it('should handle null API response', async () => {
    const mockApi = createMockApi();
    const mockEvents = createMockEvents();
    const config = createMockConfig(mockApi);
    const provider = new CodeSuggestionProvider(config, mockEvents);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    const mockPromptData = [
      { Path: 'test.ts', Fragments: [], Cursor: { lineNumber: 1, column: 5 } },
    ];

    (getPromptFileContent as jest.Mock).mockReturnValue(mockPromptData);
    mockApi.getCodeAssistSuggestions.mockResolvedValue(null as any);

    const promise = provider.getSuggestions(mockModel, mockPosition);

    // Fast-forward timers
    jest.advanceTimersByTime(config.debounceTime);

    // Wait for promise to resolve
    const result = await promise;

    expect(result.suggestions).toHaveLength(0);
    expect(result.requestId).toBe('');
  });

  it('should handle empty API response suggestions', async () => {
    const mockApi = createMockApi();
    const mockEvents = createMockEvents();
    const config = createMockConfig(mockApi);
    const provider = new CodeSuggestionProvider(config, mockEvents);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    const mockPromptData = [
      { Path: 'test.ts', Fragments: [], Cursor: { lineNumber: 1, column: 5 } },
    ];

    (getPromptFileContent as jest.Mock).mockReturnValue(mockPromptData);
    mockApi.getCodeAssistSuggestions.mockResolvedValue({
      suggestions: [],
      requestId: '123',
    });

    const promise = provider.getSuggestions(mockModel, mockPosition);

    // Fast-forward timers
    jest.advanceTimersByTime(config.debounceTime);

    // Wait for promise to resolve
    const result = await promise;

    expect(result.suggestions).toHaveLength(0);
    expect(result.requestId).toBe('123');
  });
});

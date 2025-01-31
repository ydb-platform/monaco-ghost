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

describe('CodeSuggestionProvider - Debouncing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce requests', async () => {
    const mockApi = createMockApi();
    const events = createMockEvents();
    const config = createMockConfig(mockApi);
    const provider = new CodeSuggestionProvider(config, events);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    const mockPromptData = [
      { Path: 'test.ts', Fragments: [], Cursor: { lineNumber: 1, column: 5 } },
    ];

    (getPromptFileContent as jest.Mock).mockReturnValue(mockPromptData);
    mockApi.getCodeAssistSuggestions.mockResolvedValue({
      suggestions: ['suggestion'],
      requestId: '123',
    });

    const promise = provider.getSuggestions(mockModel, mockPosition);

    // Fast-forward timers
    jest.advanceTimersByTime(config.debounceTime);

    // Wait for promise to resolve
    const result = await promise;

    expect(mockApi.getCodeAssistSuggestions).toHaveBeenCalledTimes(1);
    expect(result.suggestions).toHaveLength(1);
    expect(result.requestId).toBe('123');
  });

  it('should clear existing timer on new request', async () => {
    const mockApi = createMockApi();
    const events = createMockEvents();
    const config = createMockConfig(mockApi);
    const provider = new CodeSuggestionProvider(config, events);
    const mockPosition = createMockPosition();
    const mockModel = createMockModel();

    const mockPromptData = [
      { Path: 'test.ts', Fragments: [], Cursor: { lineNumber: 1, column: 5 } },
    ];

    (getPromptFileContent as jest.Mock).mockReturnValue(mockPromptData);
    mockApi.getCodeAssistSuggestions.mockImplementation(async () => ({
      suggestions: ['suggestion'],
      requestId: '123',
    }));

    // Start first request
    const promise1 = provider.getSuggestions(mockModel, mockPosition);

    // Advance timer partially
    jest.advanceTimersByTime(config.debounceTime / 2);

    // Start second request
    const promise2 = provider.getSuggestions(mockModel, mockPosition);

    // Advance timer fully
    jest.advanceTimersByTime(config.debounceTime);

    // Ensure all promises are resolved
    await Promise.resolve();
    await jest.runAllTimersAsync();

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(mockApi.getCodeAssistSuggestions).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
  });
});

import { createServiceConfig } from '../../config';
import { ICodeCompletionAPI } from '../../../types';

describe('createServiceConfig - Default Configuration', () => {
  const mockApi: ICodeCompletionAPI = {
    getCodeAssistSuggestions: jest.fn(),
  };

  it('should return default configuration when no user config provided', () => {
    const config = createServiceConfig(mockApi);

    expect(config).toEqual({
      debounceTime: 200,
      textLimits: {
        beforeCursor: 8000,
        afterCursor: 1000,
      },
      suggestionCache: {
        enabled: true,
      },
      sessionId: config.sessionId,
      api: mockApi,
    });
  });

  it('should include required api and events fields', () => {
    const config = createServiceConfig(mockApi);

    expect(config.api).toBe(mockApi);
  });
});

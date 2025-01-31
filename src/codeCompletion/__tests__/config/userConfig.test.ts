import { createServiceConfig } from '../../config';
import { ICodeCompletionAPI } from '../../../types';

describe('createServiceConfig - User Configuration', () => {
  const mockApi: ICodeCompletionAPI = {
    getCodeAssistSuggestions: jest.fn(),
  };

  it('should merge top-level user configuration', () => {
    const userConfig = {
      debounceTime: 500,
    };

    const config = createServiceConfig(mockApi, userConfig);

    expect(config.debounceTime).toBe(500);
    expect(config.textLimits).toEqual({
      beforeCursor: 8000,
      afterCursor: 1000,
    });
    expect(config.suggestionCache).toEqual({
      enabled: true,
    });
  });

  it('should merge nested textLimits configuration', () => {
    const userConfig = {
      textLimits: {
        beforeCursor: 5000,
      },
    };

    const config = createServiceConfig(mockApi, userConfig);

    expect(config.textLimits).toEqual({
      beforeCursor: 5000,
      afterCursor: 1000,
    });
  });

  it('should merge nested suggestionCache configuration', () => {
    const userConfig = {
      suggestionCache: {
        enabled: false,
      },
    };

    const config = createServiceConfig(mockApi, userConfig);

    expect(config.suggestionCache).toEqual({
      enabled: false,
    });
  });

  it('should handle complete user configuration override', () => {
    const userConfig = {
      debounceTime: 300,
      textLimits: {
        beforeCursor: 4000,
        afterCursor: 500,
      },
      suggestionCache: {
        enabled: false,
      },
      sessionId: 'test',
    };

    const config = createServiceConfig(mockApi, userConfig);

    expect(config).toEqual({
      ...userConfig,
      api: mockApi,
    });
  });
});

import { createServiceConfig } from '../../config';
import { ICodeCompletionAPI } from '../../../types';

describe('createServiceConfig - Edge Cases', () => {
  const mockApi: ICodeCompletionAPI = {
    getCodeAssistSuggestions: jest.fn(),
  };

  it('should handle undefined nested configurations', () => {
    const userConfig = {
      debounceTime: 300,
      suggestionCache: undefined,
    };

    const config = createServiceConfig(mockApi, userConfig);

    expect(config.suggestionCache).toEqual({
      enabled: true,
    });
  });

  it('should handle partial nested configurations', () => {
    const userConfig = {
      suggestionCache: {
        // Empty object should not override defaults
      },
    };

    const config = createServiceConfig(mockApi, userConfig);

    expect(config.suggestionCache).toEqual({
      enabled: true,
    });
  });

  it('should always use provided api and events regardless of user config', () => {
    const customApi: ICodeCompletionAPI = {
      getCodeAssistSuggestions: jest.fn(),
    };

    const userConfig = {
      debounceTime: 300,
    };

    const config = createServiceConfig(customApi, userConfig);

    expect(config.api).toBe(customApi);
    expect(config.debounceTime).toBe(300);
  });
});

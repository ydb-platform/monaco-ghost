import { createServiceConfig } from '../../config';
import { EventEmitter } from '../../../events';
import { ICodeCompletionAPI } from '../../../types';

describe('createServiceConfig - Edge Cases', () => {
  const mockApi: ICodeCompletionAPI = {
    getCodeAssistSuggestions: jest.fn(),
  };

  const mockEvents = new EventEmitter();

  it('should handle undefined nested configurations', () => {
    const userConfig = {
      debounceTime: 300,
      textLimits: undefined,
      suggestionCache: undefined,
    };

    const config = createServiceConfig(mockApi, mockEvents, userConfig);

    expect(config.textLimits).toEqual({
      beforeCursor: 8000,
      afterCursor: 1000,
    });
    expect(config.suggestionCache).toEqual({
      enabled: true,
    });
  });

  it('should handle partial nested configurations', () => {
    const userConfig = {
      textLimits: {
        // Only override beforeCursor
        beforeCursor: 3000,
      },
      suggestionCache: {
        // Empty object should not override defaults
      },
    };

    const config = createServiceConfig(mockApi, mockEvents, userConfig);

    expect(config.textLimits).toEqual({
      beforeCursor: 3000,
      afterCursor: 1000,
    });
    expect(config.suggestionCache).toEqual({
      enabled: true,
    });
  });

  it('should always use provided api and events regardless of user config', () => {
    const customApi: ICodeCompletionAPI = {
      getCodeAssistSuggestions: jest.fn(),
    };
    const customEvents = new EventEmitter();

    const userConfig = {
      debounceTime: 300,
      textLimits: {
        beforeCursor: 3000,
      },
    };

    const config = createServiceConfig(customApi, customEvents, userConfig);

    expect(config.api).toBe(customApi);
    expect(config.events).toBe(customEvents);
    expect(config.debounceTime).toBe(300);
  });
});

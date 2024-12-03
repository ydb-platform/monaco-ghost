import { createServiceConfig } from '../../config';
import { EventEmitter } from '../../../events';
import { ICodeCompletionAPI } from '../../../types';

describe('createServiceConfig - Default Configuration', () => {
  const mockApi: ICodeCompletionAPI = {
    getCodeAssistSuggestions: jest.fn(),
  };

  const mockEvents = new EventEmitter();

  it('should return default configuration when no user config provided', () => {
    const config = createServiceConfig(mockApi, mockEvents);

    expect(config).toEqual({
      debounceTime: 200,
      textLimits: {
        beforeCursor: 8000,
        afterCursor: 1000,
      },
      suggestionCache: {
        enabled: true,
      },
      api: mockApi,
      events: mockEvents,
    });
  });

  it('should include required api and events fields', () => {
    const config = createServiceConfig(mockApi, mockEvents);

    expect(config.api).toBe(mockApi);
    expect(config.events).toBe(mockEvents);
  });
});

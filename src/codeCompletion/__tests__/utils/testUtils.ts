/// <reference types="jest" />
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { GhostEventEmitter } from '../../../events';
import { ICodeCompletionAPI, Suggestions } from '../../../types';
import { ServiceConfig } from '../../types';

export const createMockApi = (): jest.Mocked<ICodeCompletionAPI> => ({
  getCodeAssistSuggestions: jest.fn<Promise<Suggestions>, any>(),
});

export const createMockEvents = () => {
  const mockEvents = new GhostEventEmitter();
  jest.spyOn(mockEvents, 'emit');
  jest.spyOn(mockEvents, 'on');
  jest.spyOn(mockEvents, 'off');
  return mockEvents;
};

export const createMockConfig = (api: ICodeCompletionAPI): ServiceConfig => ({
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
  api,
});

export const createMockPosition = () =>
  ({
    lineNumber: 1,
    column: 5,
  }) as monaco.Position;

export const createMockModel = () =>
  ({
    getWordUntilPosition: jest.fn().mockReturnValue({
      word: 'test',
      startColumn: 1,
    }),
  }) as unknown as monaco.editor.ITextModel;

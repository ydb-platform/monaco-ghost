import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getPromptFileContent } from '../../prompt';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-session-id'),
}));

describe('getPromptFileContent - Basic Functionality', () => {
  const createMockModel = (lines: string[]): monaco.editor.ITextModel =>
    ({
      getLinesContent: jest.fn().mockReturnValue(lines),
    }) as unknown as monaco.editor.ITextModel;

  it('should generate correct fragments for cursor in middle of text', () => {
    const model = createMockModel(['line 1', 'line 2', 'line 3']);
    const position = { lineNumber: 2, column: 3 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.fragments) {
      return;
    }

    expect(result[0].fragments).toEqual([
      {
        text: 'line 1\nli',
        start: { lineNumber: 1, column: 1 },
        end: { lineNumber: 2, column: 3 },
      },
      {
        text: 'ne 2\nline 3',
        start: { lineNumber: 2, column: 3 },
        end: { lineNumber: 3, column: 6 },
      },
    ]);
  });

  it('should handle cursor at start of file', () => {
    const model = createMockModel(['line 1', 'line 2']);
    const position = { lineNumber: 1, column: 1 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.fragments) {
      return;
    }

    expect(result[0].fragments).toEqual([
      {
        text: 'line 1\nline 2',
        start: { lineNumber: 1, column: 1 },
        end: { lineNumber: 2, column: 6 },
      },
    ]);
  });

  it('should handle cursor at end of file', () => {
    const model = createMockModel(['line 1', 'line 2']);
    const position = { lineNumber: 2, column: 7 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.fragments) {
      return;
    }

    expect(result[0].fragments).toEqual([
      {
        text: 'line 1\nline 2',
        start: { lineNumber: 1, column: 1 },
        end: { lineNumber: 2, column: 7 },
      },
    ]);
  });
});

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
    if (!result?.[0]?.Fragments) {
      return;
    }

    expect(result[0].Fragments).toEqual([
      {
        Text: 'line 1\nli',
        Start: { Ln: 1, Col: 1 },
        End: { Ln: 2, Col: 3 },
      },
      {
        Text: 'ne 2\nline 3',
        Start: { Ln: 2, Col: 3 },
        End: { Ln: 3, Col: 6 },
      },
    ]);
  });

  it('should handle cursor at start of file', () => {
    const model = createMockModel(['line 1', 'line 2']);
    const position = { lineNumber: 1, column: 1 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.Fragments) {
      return;
    }

    expect(result[0].Fragments).toEqual([
      {
        Text: 'line 1\nline 2',
        Start: { Ln: 1, Col: 1 },
        End: { Ln: 2, Col: 6 },
      },
    ]);
  });

  it('should handle cursor at end of file', () => {
    const model = createMockModel(['line 1', 'line 2']);
    const position = { lineNumber: 2, column: 7 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.Fragments) {
      return;
    }

    expect(result[0].Fragments).toEqual([
      {
        Text: 'line 1\nline 2',
        Start: { Ln: 1, Col: 1 },
        End: { Ln: 2, Col: 7 },
      },
    ]);
  });
});

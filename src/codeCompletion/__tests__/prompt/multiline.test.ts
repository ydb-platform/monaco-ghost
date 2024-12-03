import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getPromptFileContent } from '../../prompt';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-session-id'),
}));

describe('getPromptFileContent - Multiline Handling', () => {
  const createMockModel = (lines: string[]): monaco.editor.ITextModel =>
    ({
      getLinesContent: jest.fn().mockReturnValue(lines),
    }) as unknown as monaco.editor.ITextModel;

  it('should handle multiline text with correct line numbers', () => {
    const model = createMockModel(['function example() {', '  const x = 1;', '  return x;', '}']);
    const position = { lineNumber: 2, column: 8 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.Fragments) {
      fail('Expected fragments to be defined');
    }

    expect(result[0].Fragments).toEqual([
      {
        Text: 'function example() {\n  const',
        Start: { Ln: 1, Col: 1 },
        End: { Ln: 2, Col: 8 },
      },
      {
        Text: ' x = 1;\n  return x;\n}',
        Start: { Ln: 2, Col: 8 },
        End: { Ln: 4, Col: 1 },
      },
    ]);
  });

  it('should handle multiline text with mixed indentation', () => {
    const model = createMockModel([
      'class Example {',
      '    constructor() {',
      '      this.value = 1;',
      '    }',
      '}',
    ]);
    const position = { lineNumber: 3, column: 7 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.Fragments) {
      fail('Expected fragments to be defined');
    }

    expect(result[0].Fragments).toEqual([
      {
        Text: 'class Example {\n    constructor() {\n      ',
        Start: { Ln: 1, Col: 1 },
        End: { Ln: 3, Col: 7 },
      },
      {
        Text: 'this.value = 1;\n    }\n}',
        Start: { Ln: 3, Col: 7 },
        End: { Ln: 5, Col: 1 },
      },
    ]);
  });
});

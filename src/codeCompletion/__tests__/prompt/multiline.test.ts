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
    if (!result?.[0]?.fragments) {
      fail('Expected fragments to be defined');
    }

    expect(result[0].fragments).toEqual([
      {
        text: 'function example() {\n  const',
        start: { lineNumber: 1, column: 1 },
        end: { lineNumber: 2, column: 8 },
      },
      {
        text: ' x = 1;\n  return x;\n}',
        start: { lineNumber: 2, column: 8 },
        end: { lineNumber: 4, column: 1 },
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
    if (!result?.[0]?.fragments) {
      fail('Expected fragments to be defined');
    }

    expect(result[0].fragments).toEqual([
      {
        text: 'class Example {\n    constructor() {\n      ',
        start: { lineNumber: 1, column: 1 },
        end: { lineNumber: 3, column: 7 },
      },
      {
        text: 'this.value = 1;\n    }\n}',
        start: { lineNumber: 3, column: 7 },
        end: { lineNumber: 5, column: 1 },
      },
    ]);
  });
});

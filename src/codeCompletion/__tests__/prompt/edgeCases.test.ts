import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getPromptFileContent } from '../../prompt';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-session-id'),
}));

describe('getPromptFileContent - Edge Cases', () => {
  const createMockModel = (lines: string[]): monaco.editor.ITextModel =>
    ({
      getLinesContent: jest.fn().mockReturnValue(lines),
    }) as unknown as monaco.editor.ITextModel;

  it('should handle empty file', () => {
    const model = createMockModel([]);
    const position = { lineNumber: 1, column: 1 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeUndefined();
  });

  it('should handle empty lines', () => {
    const model = createMockModel(['', '', '']);
    const position = { lineNumber: 2, column: 1 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeUndefined();
  });

  it('should handle invalid cursor position', () => {
    const model = createMockModel(['line 1']);
    const position = { lineNumber: 2, column: 1 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeUndefined();
  });
});

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getPromptFileContent } from '../../prompt';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-session-id'),
}));

describe('getPromptFileContent - Text Limits', () => {
  const createMockModel = (lines: string[]): monaco.editor.ITextModel =>
    ({
      getLinesContent: jest.fn().mockReturnValue(lines),
    }) as unknown as monaco.editor.ITextModel;

  it('should respect beforeCursor limit', () => {
    const longText = 'a'.repeat(10000);
    const model = createMockModel([longText]);
    const position = { lineNumber: 1, column: longText.length + 1 } as monaco.Position;

    const result = getPromptFileContent(model, position, { beforeCursor: 100 });

    expect(result).toBeDefined();
    if (!result?.[0]?.fragments?.[0]) {
      return;
    }

    const fragment = result[0].fragments[0];
    expect(fragment.text.length).toBe(100);
    expect(fragment.text).toBe('a'.repeat(100));
  });

  it('should respect afterCursor limit', () => {
    const longText = 'a'.repeat(10000);
    const model = createMockModel([longText]);
    const position = { lineNumber: 1, column: 1 } as monaco.Position;

    const result = getPromptFileContent(model, position, { afterCursor: 100 });

    expect(result).toBeDefined();
    if (!result?.[0]?.fragments?.[0]) {
      return;
    }

    const fragment = result[0].fragments[0];
    expect(fragment.text.length).toBe(100);
    expect(fragment.text).toBe('a'.repeat(100));
  });

  it('should use default limits when not provided', () => {
    const longText = 'a'.repeat(20000);
    const model = createMockModel([longText]);
    const position = { lineNumber: 1, column: 10000 } as monaco.Position;

    const result = getPromptFileContent(model, position);

    expect(result).toBeDefined();
    if (!result?.[0]?.fragments) {
      fail('Expected fragments to be defined');
    }

    const fragments = result[0].fragments;
    if (fragments.length < 2) {
      fail('Expected at least 2 fragments');
    }

    const fragment0 = fragments[0];
    const fragment1 = fragments[1];

    if (!fragment0 || !fragment1) {
      fail('Expected both fragments to be defined');
    }

    expect(fragment0.text.length).toBe(8000); // Default beforeCursor
    expect(fragment1.text.length).toBe(1000); // Default afterCursor
  });
});

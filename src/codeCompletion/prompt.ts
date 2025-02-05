import type Monaco from 'monaco-editor';
import type { PromptFile } from '../types';
import { v4 } from 'uuid';

export interface TextLimits {
  beforeCursor: number;
  afterCursor: number;
}

const DEFAULT_LIMITS: Required<TextLimits> = {
  beforeCursor: 8_000,
  afterCursor: 1_000,
};

export function getPromptFileContent(
  model: Monaco.editor.ITextModel,
  position: Monaco.Position,
  limits?: Partial<TextLimits>,
  sessionId: string = v4()
): PromptFile[] | undefined {
  // Merge with defaults to ensure we always have valid numbers
  const finalLimits: Required<TextLimits> = {
    ...DEFAULT_LIMITS,
    ...limits,
  };

  const linesContent = model.getLinesContent();
  const currentLine = linesContent[position.lineNumber - 1];

  if (!currentLine) {
    return undefined;
  }

  const prevTextInCurrentLine = currentLine.slice(0, position.column - 1);
  const postTextInCurrentLine = currentLine.slice(position.column - 1);
  const prevText = linesContent
    .slice(0, position.lineNumber - 1)
    .concat([prevTextInCurrentLine])
    .join('\n');
  const postText = [postTextInCurrentLine]
    .concat(linesContent.slice(position.lineNumber))
    .join('\n');
  const cursorPosition = { lineNumber: position.lineNumber, column: position.column };

  const fragments = [];
  if (prevText) {
    fragments.push({
      text:
        prevText.length > finalLimits.beforeCursor
          ? prevText.slice(prevText.length - finalLimits.beforeCursor)
          : prevText,
      start: { lineNumber: 1, column: 1 },
      end: cursorPosition,
    });
  }
  if (postText) {
    const lastLine = linesContent[linesContent.length - 1];
    if (!lastLine) {
      return undefined;
    }

    fragments.push({
      text: postText.slice(0, finalLimits.afterCursor),
      start: cursorPosition,
      end: {
        lineNumber: linesContent.length,
        column: lastLine.length,
      },
    });
  }

  return fragments.length
    ? [
        {
          fragments,
          cursorPosition,
          path: `${sessionId}`,
        },
      ]
    : undefined;
}

import type Monaco from 'monaco-editor';
import type { PromptFile } from '../types';
import { v4 } from 'uuid';

export function getPromptFileContent(
  model: Monaco.editor.ITextModel,
  position: Monaco.Position,
  sessionId: string = v4()
): PromptFile[] | undefined {
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
      text: prevText,
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
      text: postText,
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

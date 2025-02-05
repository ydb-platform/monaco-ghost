import type * as monaco from 'monaco-editor';

import type { ICodeCompletionService } from './types';

export function registerCompletionCommands(
  monacoInstance: typeof monaco,
  completionService: ICodeCompletionService,
  editor: monaco.editor.IStandaloneCodeEditor
): monaco.IDisposable[] {
  const disposables: monaco.IDisposable[] = [];

  const acceptCommand = monacoInstance.editor.registerCommand(
    'acceptCodeAssistCompletion',
    (_accessor, ...args) => {
      const data = args[0] ?? {};
      if (!data || typeof data !== 'object') {
        return;
      }
      const { requestId, suggestionText } = data;
      if (requestId && suggestionText) {
        completionService.handleAccept({ requestId, suggestionText });
      }
    }
  );
  disposables.push(acceptCommand);

  const declineCommand = monacoInstance.editor.registerCommand(
    'declineCodeAssistCompletion',
    () => {
      completionService.commandDiscard('OnCancel', editor);
    }
  );
  disposables.push(declineCommand);

  const keyDownDisposable = editor.onKeyDown(e => {
    if (e.keyCode === monacoInstance.KeyCode.Escape) {
      const hasInlineSuggestion = completionService.hasActiveSuggestions();
      if (hasInlineSuggestion) {
        e.preventDefault();
        editor.trigger('keyboard', 'declineCodeAssistCompletion', null);
      }
    }
  });
  disposables.push(keyDownDisposable);

  return disposables;
}

import type * as monaco from 'monaco-editor';

import type { ICodeCompletionService } from './types';

export function registerCompletionCommands(
  monacoInstance: typeof monaco,
  completionService: ICodeCompletionService,
  editor: monaco.editor.IStandaloneCodeEditor
) {
  monacoInstance.editor.registerCommand('acceptCodeAssistCompletion', (_accessor, ...args) => {
    const data = args[0] ?? {};
    if (!data || typeof data !== 'object') {
      return;
    }
    const { requestId, suggestionText } = data;
    if (requestId && suggestionText) {
      completionService.handleAccept({ requestId, suggestionText });
    }
  });

  monacoInstance.editor.registerCommand('declineCodeAssistCompletion', () => {
    completionService.commandDiscard('OnCancel', editor);
  });

  // Add keybinding for Escape key to decline suggestions
  editor.addCommand(monacoInstance.KeyCode.Escape, () => {
    const hasInlineSuggestion = completionService.hasActiveSuggestions();
    if (hasInlineSuggestion) {
      editor.trigger('keyboard', 'declineCodeAssistCompletion', null);
    }
  });
}

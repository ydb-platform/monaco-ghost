import { useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { createCodeCompletionService, registerCompletionCommands } from '../index';
import type { ICodeCompletionAPI, CodeCompletionConfig, ICodeCompletionService } from '../types';

interface UseMonacoGhostProps {
  api: ICodeCompletionAPI;
  config: CodeCompletionConfig & {
    language: string; // Single language identifier (e.g., 'typescript')
  };
  onCompletionAccept?: (text: string) => void;
  onCompletionDecline?: (text: string, reason: string, otherSuggestions: string[]) => void;
  onCompletionIgnore?: (text: string, otherSuggestions: string[]) => void;
  onCompletionError?: (error: Error) => void;
}

interface UseMonacoGhostResult {
  registerMonacoGhost: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  dispose: () => void;
}

export function useMonacoGhost({
  api,
  config,
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
  onCompletionError,
}: UseMonacoGhostProps): UseMonacoGhostResult {
  const disposables = useRef<monaco.IDisposable[]>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const completionProviderRef = useRef<ICodeCompletionService | null>(null);

  const dispose = useCallback(() => {
    editorRef.current?.dispose();
    editorRef.current = null;
    disposables.current.forEach(d => d.dispose());
    disposables.current = [];
  }, []);

  const registerMonacoGhost = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;

      // Create completion provider when editor is available
      completionProviderRef.current = createCodeCompletionService(api, config);

      // Register provider with Monaco for the specified language
      const disposable = monaco.languages.registerInlineCompletionsProvider(
        [config.language],
        completionProviderRef.current
      );
      disposables.current.push(disposable);

      // Register commands
      registerCompletionCommands(monaco, completionProviderRef.current, editor);

      // Set up event handlers
      const provider = completionProviderRef.current;
      provider.events.on('completion:accept', data => {
        onCompletionAccept?.(data.acceptedText);
      });

      provider.events.on('completion:decline', data => {
        onCompletionDecline?.(data.suggestionText, data.reason, data.otherSuggestions);
      });

      provider.events.on('completion:ignore', data => {
        onCompletionIgnore?.(data.suggestionText, data.otherSuggestions);
      });

      provider.events.on('completion:error', error => {
        onCompletionError?.(error);
      });
    },
    [api, config, onCompletionAccept, onCompletionDecline, onCompletionIgnore, onCompletionError]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  return {
    registerMonacoGhost,
    dispose,
  };
}

import { useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { createCodeCompletionService, registerCompletionCommands } from '../index';
import type { ICodeCompletionAPI, CodeCompletionConfig, ICodeCompletionService } from '../types';

interface UseMonacoGhostProps {
  api: ICodeCompletionAPI;
  config: CodeCompletionConfig;
  onCompletionAccept?: (text: string) => void;
  onCompletionDecline?: (text: string, reason: string) => void;
  onCompletionIgnore?: (text: string) => void;
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

      // Register provider with Monaco
      const disposable = monaco.languages.registerInlineCompletionsProvider(
        ['typescript', 'javascript'],
        completionProviderRef.current
      );
      disposables.current.push(disposable);

      // Register commands
      registerCompletionCommands(monaco, completionProviderRef.current, editor);

      // Set up event handlers
      const provider = completionProviderRef.current;
      provider.events.on('completion:accept', data => {
        console.log('Accept:', data.acceptedText);
        onCompletionAccept?.(data.acceptedText);
      });

      provider.events.on('completion:decline', data => {
        console.log('Decline:', data.suggestionText, data.reason);
        onCompletionDecline?.(data.suggestionText, data.reason);
      });

      provider.events.on('completion:ignore', data => {
        console.log('Ignore:', data.suggestionText);
        onCompletionIgnore?.(data.suggestionText);
      });
    },
    [api, config, onCompletionAccept, onCompletionDecline, onCompletionIgnore]
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

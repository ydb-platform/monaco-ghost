import React, { useEffect, useMemo, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { createCodeCompletionService, registerCompletionCommands } from '../index';
import 'monaco-editor/min/vs/editor/editor.main.css';

export interface MonacoEditorProps {
  initialValue?: string;
  language?: string;
  theme?: string;
  onCompletionAccept?: (text: string) => void;
  onCompletionDecline?: (text: string, reason: string) => void;
  onCompletionIgnore?: (text: string) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  initialValue = '// Type your code here\n',
  language = 'typescript',
  theme = 'vs-dark',
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const disposables = useRef<monaco.IDisposable[]>([]);

  const api = {
    getCodeAssistSuggestions: async () => ({
      Suggests: [
        { Text: 'console.log()' },
        { Text: 'console.error()' },
        { Text: 'console.info()' },
      ],
      RequestId: 'demo-request',
    }),
  };

  const config = {
    debounceTime: 200,
    textLimits: {
      beforeCursor: 8000,
      afterCursor: 1000,
    },
    suggestionCache: {
      enabled: true,
    },
  };

  const completionProvider = useMemo(() => createCodeCompletionService(api, config), []);

  // Create completion service once
  useEffect(() => {
    // Register with Monaco
    const disposable = monaco.languages.registerInlineCompletionsProvider(
      ['typescript', 'javascript'],
      completionProvider
    );
    disposables.current.push(disposable);

    return () => {
      disposables.current.forEach(d => d.dispose());
      disposables.current = [];
    };
  }, []); // Empty dependency array as this should only run once

  // Handle completion events
  useEffect(() => {
    if (!completionProvider) return;

    const acceptHandler = (data: any) => {
      console.log('Accept:', data.acceptedText);
      onCompletionAccept?.(data.acceptedText);
    };

    const declineHandler = (data: any) => {
      onCompletionDecline?.(data.suggestionText, data.reason);
    };

    const ignoreHandler = (data: any) => {
      onCompletionIgnore?.(data.suggestionText);
    };

    completionProvider.events.on('completion:accept', acceptHandler);
    completionProvider.events.on('completion:decline', declineHandler);
    completionProvider.events.on('completion:ignore', ignoreHandler);

    return () => {
      completionProvider.events.off('completion:accept', acceptHandler);
      completionProvider.events.off('completion:decline', declineHandler);
      completionProvider.events.off('completion:ignore', ignoreHandler);
    };
  }, [onCompletionAccept, onCompletionDecline, onCompletionIgnore]);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current || editor.current) return;

    editor.current = monaco.editor.create(editorRef.current, {
      value: initialValue,
      language,
      theme,
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      roundedSelection: false,
      padding: { top: 10 },
    });

    if (completionProvider) {
      registerCompletionCommands(monaco, completionProvider, editor.current);
    }

    return () => {
      editor.current?.dispose();
      editor.current = null;
    };
  }, []); // Empty dependency array as we only want to create the editor once

  // Update editor value when initialValue prop changes
  useEffect(() => {
    if (editor.current) {
      const currentValue = editor.current.getValue();
      if (currentValue !== initialValue) {
        editor.current.setValue(initialValue);
      }
    }
  }, [initialValue]);

  // Update editor options when language or theme changes
  useEffect(() => {
    if (editor.current) {
      const model = editor.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
      editor.current.updateOptions({
        theme,
      });
    }
  }, [language, theme]);

  return (
    <div
      ref={editorRef}
      style={{
        width: '800px',
        height: '400px',
        border: '1px solid #ccc',
        overflow: 'hidden',
      }}
    />
  );
};

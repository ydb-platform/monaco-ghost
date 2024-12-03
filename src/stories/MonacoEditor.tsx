import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { createCodeCompletionService, registerCompletionCommands } from '../index';
import 'monaco-editor/min/vs/editor/editor.main.css';

export interface MonacoEditorProps {
  initialValue?: string;
  language?: string;
  theme?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  initialValue = '// Type your code here\n',
  language = 'typescript',
  theme = 'vs-dark',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Monaco Editor
    const init = async () => {
      // Create the editor
      editor.current = monaco.editor.create(editorRef.current!, {
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

      // Example completion service that suggests "console.log"
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

      // Configure the completion service
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

      // Create and register the completion provider
      const completionProvider = createCodeCompletionService(api, config);

      // Register with Monaco
      monaco.languages.registerInlineCompletionsProvider(
        ['typescript', 'javascript'],
        completionProvider
      );

      // Register completion commands
      if (editor.current) {
        registerCompletionCommands(monaco, completionProvider, editor.current);
      }

      // Event listeners for completion events
      completionProvider.events.on('completion:accept', data => {
        console.log('Completion accepted:', data.acceptedText);
      });

      completionProvider.events.on('completion:decline', data => {
        console.log('Completion declined:', data.suggestionText, 'reason:', data.reason);
      });

      completionProvider.events.on('completion:ignore', data => {
        console.log('Completion ignored:', data.suggestionText);
      });
    };

    init();

    return () => {
      editor.current?.dispose();
    };
  }, [initialValue, language, theme]);

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

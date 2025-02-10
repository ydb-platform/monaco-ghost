import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';
import { demoLanguages } from './utils/demoData';
import { Disclaimer } from './components/Disclaimer';
import 'monaco-editor/min/vs/editor/editor.main.css';
import { ICodeCompletionEventHandlers } from '../types';

export interface MonacoEditorProps {
  initialValue?: string;
  language?: string;
  theme?: string;
  eventHandlers?: ICodeCompletionEventHandlers;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  initialValue = '// Type your code here\n',
  language = 'sql',
  theme = 'vs-dark',
  eventHandlers,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Use SQL as default demo language if the current language isn't supported
  const demoLang = language in demoLanguages ? language : 'sql';
  const { api, config } = demoLanguages[demoLang as keyof typeof demoLanguages];

  const { register } = useMonacoGhost({
    api,
    eventHandlers,
    config: {
      ...config,
      language,
    },
  });

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const editorInstance = monaco.editor.create(editorRef.current, {
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

    editor.current = editorInstance;
    register(editorInstance);
  }, [language, initialValue]); // Re-initialize when language or initialValue changes

  // Update theme when it changes
  useEffect(() => {
    if (editor.current) {
      editor.current.updateOptions({
        theme,
      });
    }
  }, [theme]);

  return (
    <div>
      <Disclaimer />
      <div
        ref={editorRef}
        style={{
          height: '400px',
          border: '1px solid #ccc',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

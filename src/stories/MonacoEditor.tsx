import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';
import { demoLanguages } from './utils/demoData';
import { Disclaimer } from './components/Disclaimer';
import 'monaco-editor/min/vs/editor/editor.main.css';
import { AcceptEvent, DeclineEvent, IgnoreEvent } from '../events';

export interface MonacoEditorProps {
  initialValue?: string;
  language?: string;
  theme?: string;
  onCompletionAccept?: (event: AcceptEvent) => void;
  onCompletionDecline?: (event: DeclineEvent) => void;
  onCompletionIgnore?: (event: IgnoreEvent) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  initialValue = '// Type your code here\n',
  language = 'sql',
  theme = 'vs-dark',
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Use SQL as default demo language if the current language isn't supported
  const demoLang = language in demoLanguages ? language : 'sql';
  const { api, config } = demoLanguages[demoLang as keyof typeof demoLanguages];

  const { registerMonacoGhost, dispose } = useMonacoGhost({
    api,
    config: {
      ...config,
      language,
    },
    onCompletionAccept,
    onCompletionDecline,
    onCompletionIgnore,
  });

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    // Dispose of existing editor if it exists
    if (editor.current) {
      dispose();
      editor.current.dispose();
      editor.current = null;
    }

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
    registerMonacoGhost(editorInstance);

    return () => {
      dispose();
      if (editor.current) {
        editor.current.dispose();
        editor.current = null;
      }
    };
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

import React, { useState, useCallback, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';
import { demoLanguages } from './utils/demoData';
import type { ICodeCompletionAPI, CodeCompletionConfig } from '../types';
import { Disclaimer } from './components/Disclaimer';

export interface EditorProps {
  code?: string;
  language?: string;
  theme?: string;
  api?: ICodeCompletionAPI;
  config?: CodeCompletionConfig;
  onCompletionAccept?: (text: string) => void;
  onCompletionDecline?: (text: string, reason: string) => void;
  onCompletionIgnore?: (text: string) => void;
}

export const ReactMonacoEditor: React.FC<EditorProps> = ({
  code: initialCode = '// Type your code here\n',
  language = 'sql',
  theme = 'vs-dark',
  api: providedApi,
  config: providedConfig,
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
}) => {
  const [code, setCode] = useState(initialCode);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Use provided api/config or fall back to demo values
  const demoLang = language in demoLanguages ? language : 'sql';
  const { api: sqlApi, config: demoConfig } = demoLanguages[demoLang as keyof typeof demoLanguages];

  const api = providedApi || sqlApi;
  const baseConfig = providedConfig || demoConfig;

  const { registerMonacoGhost, dispose } = useMonacoGhost({
    api,
    config: {
      ...baseConfig,
      language, // Ensure the current language is used in the config
    },
    onCompletionAccept,
    onCompletionDecline,
    onCompletionIgnore,
  });

  const editorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorInstance.current = editor;
      editor.focus();
      registerMonacoGhost(editor);
    },
    [registerMonacoGhost]
  );

  const onChange = useCallback((newValue: string) => {
    setCode(newValue);
  }, []);

  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    roundedSelection: false,
    padding: { top: 10 },
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      dispose();
      editorInstance.current = null;
    };
  }, [dispose]);

  return (
    <div>
      <Disclaimer />
      <MonacoEditor
        width="800"
        height="600"
        language={language}
        theme={theme}
        value={code}
        options={options}
        onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </div>
  );
};

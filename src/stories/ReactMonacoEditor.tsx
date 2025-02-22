import React, { useState, useCallback, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';
import { demoLanguages } from './utils/demoData';
import type {
  ICodeCompletionAPI,
  CodeCompletionConfig,
  ICodeCompletionEventHandlers,
} from '../types';
import { Disclaimer } from './components/Disclaimer';

export interface EditorProps {
  code?: string;
  language?: string;
  theme?: string;
  api?: ICodeCompletionAPI;
  config?: CodeCompletionConfig;
  eventHandlers?: ICodeCompletionEventHandlers;
}

export const ReactMonacoEditor: React.FC<EditorProps> = ({
  code: initialCode = '// Type your code here\n',
  language = 'sql',
  theme = 'vs-dark',
  api: providedApi,
  config: providedConfig,
  eventHandlers,
}) => {
  const [code, setCode] = useState(initialCode);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Use provided api/config or fall back to demo values
  const demoLang = language in demoLanguages ? language : 'sql';
  const { api: sqlApi, config: demoConfig } = demoLanguages[demoLang as keyof typeof demoLanguages];

  const api = providedApi || sqlApi;
  const baseConfig = providedConfig || demoConfig;

  const { register } = useMonacoGhost({
    api,
    eventHandlers,
    config: {
      ...baseConfig,
      language, // Ensure the current language is used in the config
    },
  });

  const editorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorInstance.current = editor;
      editor.focus();
      register(editor);
    },
    [register]
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

  return (
    <div>
      <Disclaimer />
      <MonacoEditor
        width="100%"
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

import React, { useState, useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';

interface EditorProps {
  code?: string;
  language?: string;
  theme?: string;
  onCompletionAccept?: (text: string) => void;
  onCompletionDecline?: (text: string, reason: string) => void;
  onCompletionIgnore?: (text: string) => void;
}

export const ReactMonacoEditor: React.FC<EditorProps> = ({
  code: initialCode = '// Type "con" to see completion suggestions\n// for console.log, console.error, etc.\n\nfunction example() {\n  con\n}',
  language = 'typescript',
  theme = 'vs-dark',
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
}) => {
  const [code, setCode] = useState(initialCode);

  // Initialize completion provider
  const api = {
    getCodeAssistSuggestions: async () => ({
      Suggests: [
        { Text: 'console.log()' },
        { Text: 'console.error()' },
        { Text: 'console.info()' },
      ],
      RequestId: 'demo-request',
    }),
    // Here can be a request to your marvelous LLM.
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

  const { registerEditor } = useMonacoGhost({
    api,
    config,
    onCompletionAccept,
    onCompletionDecline,
    onCompletionIgnore,
  });

  const editorDidMount = useCallback(
    (editor: any) => {
      console.log('editorDidMount', editor);
      editor.focus();
      registerEditor(editor);
    },
    [registerEditor]
  );

  const onChange = useCallback((newValue: string, e: any) => {
    setCode(newValue);
    console.log('onChange', newValue, e);
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
  );
};

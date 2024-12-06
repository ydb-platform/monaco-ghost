import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';
import type { ICodeCompletionAPI, CodeCompletionConfig } from '../types';
import 'monaco-editor/min/vs/editor/editor.main.css';

export interface MonacoEditorProps {
  /**
   * Initial value/content of the editor
   */
  initialValue?: string;

  /**
   * The language to use in the editor (e.g., 'typescript', 'javascript')
   */
  language?: string;

  /**
   * The theme to use (e.g., 'vs-dark', 'vs-light')
   */
  theme?: string;

  /**
   * API implementation for the completion service
   */
  api: ICodeCompletionAPI;

  /**
   * Configuration for the completion service
   */
  config: CodeCompletionConfig;

  /**
   * Callback fired when a completion suggestion is accepted
   */
  onCompletionAccept?: (text: string) => void;

  /**
   * Callback fired when a completion suggestion is declined
   */
  onCompletionDecline?: (text: string, reason: string) => void;

  /**
   * Callback fired when a completion suggestion is ignored
   */
  onCompletionIgnore?: (text: string) => void;

  /**
   * Additional Monaco editor options
   */
  editorOptions?: monaco.editor.IStandaloneEditorConstructionOptions;

  /**
   * CSS class name for the editor container
   */
  className?: string;

  /**
   * Inline styles for the editor container
   */
  style?: React.CSSProperties;
}

/**
 * Pre-built Monaco Editor component with ghost text completion integration.
 * Provides an easy way to add a code editor with AI-powered completions to your React application.
 */
export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  initialValue = '',
  language = 'typescript',
  theme = 'vs-dark',
  api,
  config,
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
  editorOptions = {},
  className,
  style,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { registerMonacoGhost, dispose } = useMonacoGhost({
    api,
    config,
    onCompletionAccept,
    onCompletionDecline,
    onCompletionIgnore,
  });

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current || editor.current) return;

    const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
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
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      codeLens: false,
      renderLineHighlight: 'all',
      matchBrackets: 'always',
      selectionHighlight: true,
      occurrencesHighlight: 'singleFile',
      links: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
    };

    editor.current = monaco.editor.create(editorRef.current, {
      ...defaultOptions,
      ...editorOptions,
    });

    registerMonacoGhost(editor.current);

    return () => {
      dispose();
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
        ...editorOptions,
      });
    }
  }, [language, theme, editorOptions]);

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    height: '600px',
    border: '1px solid #ccc',
    overflow: 'hidden',
  };

  return <div ref={editorRef} className={className} style={{ ...defaultStyle, ...style }} />;
};

export default MonacoEditor;

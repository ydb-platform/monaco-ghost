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
   * The language to use in the editor (e.g., 'sql', 'java')
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
   * @param text The declined suggestion text
   * @param reason The reason for declining
   * @param allSuggestions Array of all available suggestions
   */
  onCompletionDecline?: (text: string, reason: string, allSuggestions: string[]) => void;

  /**
   * Callback fired when a completion suggestion is ignored
   * @param text The ignored suggestion text
   * @param allSuggestions Array of all available suggestions
   */
  onCompletionIgnore?: (text: string, allSuggestions: string[]) => void;

  /**
   * Callback fired when a completion error occurs
   */
  onCompletionError?: (error: Error) => void;

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
  language = 'sql',
  theme = 'vs-dark',
  api,
  config,
  onCompletionAccept,
  onCompletionDecline,
  onCompletionIgnore,
  onCompletionError,
  editorOptions = {},
  className,
  style,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { registerMonacoGhost, dispose } = useMonacoGhost({
    api,
    config: {
      ...config,
      language,
    },
    onCompletionAccept,
    onCompletionDecline,
    onCompletionIgnore,
    onCompletionError,
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
      if (editor.current) {
        editor.current.dispose();
        editor.current = null;
      }
    };
  }, [language, initialValue]); // Re-initialize when language or initialValue changes

  // Update theme and editor options
  useEffect(() => {
    if (editor.current) {
      editor.current.updateOptions({
        theme,
        ...editorOptions,
      });
    }
  }, [theme, editorOptions]);

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    height: '600px',
    border: '1px solid #ccc',
    overflow: 'hidden',
  };

  return <div ref={editorRef} className={className} style={{ ...defaultStyle, ...style }} />;
};

export default MonacoEditor;

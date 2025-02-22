import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useMonacoGhost } from '../hooks/useMonacoGhost';
import type {
  ICodeCompletionAPI,
  CodeCompletionConfig,
  ICodeCompletionEventHandlers,
} from '../types';
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
   * Event handler for code completion
   */
  eventHandlers?: ICodeCompletionEventHandlers;

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
  eventHandlers,
  editorOptions = {},
  className,
  style,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { register } = useMonacoGhost({
    api,
    config: {
      ...config,
      language,
    },
    eventHandlers,
  });

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

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

    register(editor.current);
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

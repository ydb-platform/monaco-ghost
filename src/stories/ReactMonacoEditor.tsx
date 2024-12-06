import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { createCodeCompletionService, registerCompletionCommands } from '../index';

interface EditorProps {
  code?: string;
  language?: string;
  theme?: string;
  onCompletionAccept?: (text: string) => void;
  onCompletionDecline?: (text: string, reason: string) => void;
  onCompletionIgnore?: (text: string) => void;
}

interface EditorState {
  code: string;
}

export class ReactMonacoEditor extends React.Component<EditorProps, EditorState> {
  private disposables: monaco.IDisposable[] = [];
  private completionProvider: any;

  constructor(props: EditorProps) {
    super(props);
    this.state = {
      code:
        props.code ||
        '// Type "con" to see completion suggestions\n// for console.log, console.error, etc.\n\nfunction example() {\n  con\n}',
    };

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

    this.completionProvider = createCodeCompletionService(api, config);
  }

  componentWillUnmount() {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  componentDidUpdate(prevProps: EditorProps) {
    if (prevProps.code !== this.props.code && this.props.code !== this.state.code) {
      this.setState({ code: this.props.code || '' });
    }
  }

  editorDidMount(editor: any, monacoInstance: any) {
    console.log('editorDidMount', editor);
    editor.focus();

    // Register completion provider
    const disposable = monacoInstance.languages.registerInlineCompletionsProvider(
      ['typescript', 'javascript'],
      this.completionProvider
    );
    this.disposables.push(disposable);

    // Register completion commands
    registerCompletionCommands(monacoInstance, this.completionProvider, editor);

    // Handle completion events
    this.completionProvider.events.on('completion:accept', (data: any) => {
      console.log('Completion accepted:', data.acceptedText);
      this.props.onCompletionAccept?.(data.acceptedText);
    });

    this.completionProvider.events.on('completion:decline', (data: any) => {
      console.log('Completion declined:', data.suggestionText, data.reason);
      this.props.onCompletionDecline?.(data.suggestionText, data.reason);
    });

    this.completionProvider.events.on('completion:ignore', (data: any) => {
      console.log('Completion ignored:', data.suggestionText);
      this.props.onCompletionIgnore?.(data.suggestionText);
    });
  }

  onChange(newValue: string, e: any) {
    this.setState({ code: newValue });
    console.log('onChange', newValue, e);
  }

  render() {
    const { code } = this.state;
    const { language = 'typescript', theme = 'vs-dark' } = this.props;
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
        onChange={this.onChange.bind(this)}
        editorDidMount={this.editorDidMount.bind(this)}
      />
    );
  }
}

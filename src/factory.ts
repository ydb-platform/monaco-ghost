import { CodeCompletionService } from './codeCompletion';
import type {
  CodeCompletionConfig,
  ICodeCompletionAPI,
  ICodeCompletionEventHandlers,
  ICodeCompletionService,
} from './types';
import * as monaco from 'monaco-editor';
import { registerCompletionCommands } from './index';

export function createCodeCompletionService(
  api: ICodeCompletionAPI,
  userConfig: CodeCompletionConfig = {}
): CodeCompletionService {
  return new CodeCompletionService(api, userConfig);
}

interface RegisterGhostProps {
  api: ICodeCompletionAPI;
  eventHandlers?: ICodeCompletionEventHandlers;
  config: CodeCompletionConfig & {
    language: string;
  };
}

export class MonacoGhostInstance {
  private disposables: monaco.IDisposable[] = [];
  private completionProvider: ICodeCompletionService | null = null;

  constructor(private editor: monaco.editor.IStandaloneCodeEditor) {}

  register({ api, config, eventHandlers }: RegisterGhostProps) {
    // Create completion provider
    this.completionProvider = createCodeCompletionService(api, config);

    // Register provider with Monaco
    const disposable = monaco.languages.registerInlineCompletionsProvider(
      [config.language],
      this.completionProvider
    );
    this.disposables.push(disposable);

    // Register commands
    const commandDisposables = registerCompletionCommands(
      monaco,
      this.completionProvider,
      this.editor
    );
    this.disposables.push(...commandDisposables);

    // Set up event handlers
    if (eventHandlers) {
      const provider = this.completionProvider;
      if (eventHandlers.onCompletionAccept) {
        provider.events.on('completion:accept', eventHandlers.onCompletionAccept);
      }
      if (eventHandlers.onCompletionDecline) {
        provider.events.on('completion:decline', eventHandlers.onCompletionDecline);
      }
      if (eventHandlers.onCompletionIgnore) {
        provider.events.on('completion:ignore', eventHandlers.onCompletionIgnore);
      }
      if (eventHandlers.onCompletionError) {
        provider.events.on('completion:error', eventHandlers.onCompletionError);
      }
    }
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    this.completionProvider = null;
  }
}

export function createMonacoGhostInstance(editor: monaco.editor.IStandaloneCodeEditor) {
  const instance = new MonacoGhostInstance(editor);
  return {
    register: (props: RegisterGhostProps) => instance.register(props),
    unregister: () => instance.dispose(),
  };
}

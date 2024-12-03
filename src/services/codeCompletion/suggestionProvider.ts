import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { EnrichedCompletion, ServiceConfig, SuggestionProvider } from "./types";
import { getPromptFileContent } from "../../promptContent";

export class CodeSuggestionProvider implements SuggestionProvider {
  private timer: number | null = null;
  private readonly config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
  }

  async getSuggestions(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): Promise<{ suggestions: EnrichedCompletion[]; requestId: string }> {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }

    // Debounce the suggestion request
    await new Promise((resolve) => {
      this.timer = window.setTimeout(resolve, this.config.debounceTime);
    });

    let suggestions: EnrichedCompletion[] = [];
    let requestId = "";

    try {
      const data = getPromptFileContent(model, position, {
        beforeCursor: this.config.textLimits.beforeCursor,
        afterCursor: this.config.textLimits.afterCursor,
      });

      if (!data) {
        return { suggestions: [], requestId: "" };
      }

      const codeAssistSuggestions =
        await this.config.api.getCodeAssistSuggestions(data);
      requestId = codeAssistSuggestions.RequestId;

      const { word, startColumn: lastWordStartColumn } =
        model.getWordUntilPosition(position);

      suggestions = codeAssistSuggestions.Suggests.map((el) => {
        const suggestionText = el.Text;
        const label = word + suggestionText;

        return {
          label: label,
          sortText: "a",
          insertText: label,
          pristine: suggestionText,
          range: new monaco.Range(
            position.lineNumber,
            lastWordStartColumn,
            position.lineNumber,
            position.column
          ),
          command: {
            id: "acceptCodeAssistCompletion",
            title: "",
            arguments: [
              {
                requestId,
                suggestionText: suggestionText,
                prevWordLength: word.length,
              },
            ],
          },
        };
      });
    } catch (err) {
      // Handle error silently as per original implementation
    }

    return { suggestions, requestId };
  }
}

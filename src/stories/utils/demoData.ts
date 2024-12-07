// Demo API implementation
export const demoApi = {
  getCodeAssistSuggestions: async () => ({
    Suggests: [
      { Text: 'SELECT * FROM users;' },
      { Text: 'SELECT id, name FROM customers;' },
      { Text: 'SELECT COUNT(*) FROM orders;' },
    ],
    RequestId: 'demo-request',
  }),
};

export const javaApi = {
  getCodeAssistSuggestions: async () => ({
    Suggests: [
      { Text: 'System.out.println("Hello, World!");' },
      { Text: 'System.out.print("Hello");' },
      { Text: 'System.err.println("Error occurred");' },
    ],
    RequestId: 'demo-request',
  }),
};

// Base configuration
const baseConfig = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
};

// Language-specific configurations
export const sqlConfig = {
  ...baseConfig,
  language: 'sql',
};

export const javaConfig = {
  ...baseConfig,
  language: 'java',
};

// For backward compatibility
export const demoConfig = sqlConfig;

export const demoLanguages = {
  sql: {
    code: `-- Try these actions to see completion events:
-- 1. Type 'SELECT' and wait for suggestions
-- 2. Press Tab to accept a suggestion
-- 3. Press Escape to decline a suggestion
-- 4. Type something else to ignore a suggestion

SELECT`,
    api: demoApi,
    config: sqlConfig,
  },
  java: {
    code: `// Try these actions to see completion events:
// 1. Type 'System' and wait for suggestions
// 2. Press Tab to accept a suggestion
// 3. Press Escape to decline a suggestion
// 4. Type something else to ignore a suggestion

public class Example {
    public static void main(String[] args) {
        System`,
    api: {
      ...demoApi,
      getCodeAssistSuggestions: async () => ({
        Suggests: [
          { Text: 'System.out.println("Hello, World!");' },
          { Text: 'System.out.print("Hello");' },
          { Text: 'System.err.println("Error occurred");' },
        ],
        RequestId: 'demo-request',
      }),
    },
    config: javaConfig,
  },
};

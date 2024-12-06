import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MonacoEditor } from '../components/MonacoEditor';

const meta = {
  title: 'Pre-built Monaco Editor',
  component: MonacoEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A pre-built Monaco Editor component with integrated ghost text completion.

## Features
- Inline code completion suggestions powered by AI
- TypeScript/JavaScript support
- Dark and light themes
- Customizable editor options
- Event handling for completion actions
- Responsive layout
- Automatic cleanup

## Usage
\`\`\`tsx
import { MonacoEditor } from 'monaco-ghost';

function MyApp() {
  return (
    <MonacoEditor
      initialValue="// Your code here"
      language="typescript"
      theme="vs-dark"
      api={completionApi}
      config={completionConfig}
      onCompletionAccept={(text) => console.log('Accepted:', text)}
    />
  );
}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialValue: {
      description: 'Initial code content',
      control: 'text',
    },
    language: {
      description: 'Programming language',
      control: 'select',
      options: ['typescript', 'javascript'],
    },
    theme: {
      description: 'Editor theme',
      control: 'select',
      options: ['vs-dark', 'vs-light'],
    },
  },
} satisfies Meta<typeof MonacoEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Demo API implementation
const demoApi = {
  getCodeAssistSuggestions: async () => ({
    Suggests: [
      { Text: 'console.log("Hello, world!");' },
      { Text: 'const message = "Hello!";' },
      { Text: 'function greet() { return "Hello!"; }' },
    ],
    RequestId: 'demo-request',
  }),
};

// Demo configuration
const demoConfig = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
};

export const Default: Story = {
  args: {
    initialValue: `// Type to see ghost text suggestions
// Try typing 'con' for console suggestions

function example() {
  con
}`,
    language: 'typescript',
    theme: 'vs-dark',
    api: demoApi,
    config: demoConfig,
    style: {
      width: '800px',
      height: '400px',
    },
  },
};

// Event log component to display completion events
const EventLog = ({
  events,
}: {
  events: Array<{ type: string; data: any; timestamp: number }>;
}) => (
  <div
    style={{
      width: '400px',
      height: '400px',
      border: '1px solid #ccc',
      padding: '10px',
      overflow: 'auto',
      backgroundColor: '#f5f5f5',
      fontFamily: 'monospace',
      fontSize: '12px',
    }}
  >
    <h3 style={{ margin: '0 0 10px 0' }}>Completion Events Log</h3>
    <div style={{ height: 'calc(100% - 30px)', overflow: 'auto' }}>
      {[...events].reverse().map((event, index) => (
        <div
          key={index}
          style={{
            marginBottom: '5px',
            borderBottom: '1px solid #eee',
            paddingBottom: '5px',
          }}
        >
          <span style={{ color: '#666' }}>[{new Date(event.timestamp).toLocaleTimeString()}]</span>{' '}
          <span
            style={{
              color: event.type.includes('error')
                ? '#dc3545'
                : event.type.includes('accept')
                ? '#28a745'
                : event.type.includes('decline')
                ? '#ffc107'
                : '#17a2b8',
            }}
          >
            {event.type}
          </span>{' '}
          <span>{JSON.stringify(event.data)}</span>
        </div>
      ))}
    </div>
  </div>
);

// Event handling demonstration story
const EventHandlingDemo = () => {
  const [events, setEvents] = useState<Array<{ type: string; data: any; timestamp: number }>>([]);

  const addEvent = (type: string, data: any) => {
    setEvents(prev => [...prev, { type, data, timestamp: Date.now() }]);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        maxWidth: '1220px',
      }}
    >
      <div style={{ flex: '0 0 auto' }}>
        <MonacoEditor
          initialValue={`// Try these actions to see completion events:
// 1. Type 'con' and wait for suggestions
// 2. Press Tab/Enter to accept a suggestion
// 3. Press Escape to decline a suggestion
// 4. Type something else to ignore a suggestion

function demonstrateEvents() {
  con
}`}
          language="typescript"
          theme="vs-dark"
          api={demoApi}
          config={demoConfig}
          onCompletionAccept={(text: string) =>
            addEvent('completion:accept', { acceptedText: text })
          }
          onCompletionDecline={(text: string, reason: string) =>
            addEvent('completion:decline', { suggestionText: text, reason })
          }
          onCompletionIgnore={(text: string) =>
            addEvent('completion:ignore', { suggestionText: text })
          }
          style={{ width: '800px', height: '400px' }}
        />
      </div>
      <EventLog events={events} />
    </div>
  );
};

export const EventHandling: Story = {
  args: {
    api: demoApi,
    config: demoConfig,
  },
  render: () => <EventHandlingDemo />,
};

export const LightTheme: Story = {
  args: {
    ...Default.args,
    theme: 'vs-light',
    initialValue: `// Light theme example
// Type to see ghost text suggestions

function example() {
  con
}`,
  },
};

export const CustomOptions: Story = {
  args: {
    ...Default.args,
    editorOptions: {
      fontSize: 16,
      lineHeight: 24,
      padding: { top: 16, bottom: 16 },
      minimap: { enabled: true },
      wordWrap: 'on',
      lineNumbers: 'off',
    },
    style: {
      width: '900px',
      height: '500px',
      border: '2px solid #007acc',
      borderRadius: '4px',
    },
  },
};

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ReactMonacoEditor } from './ReactMonacoEditor';

const meta = {
  title: 'React Monaco Editor',
  component: ReactMonacoEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A Monaco Editor component using react-monaco-editor library with ghost text completion.

## Features
- Inline code completion suggestions
- TypeScript/JavaScript support
- Dark and light themes
- Event handling for completion actions

## Usage
Type 'con' to see completion suggestions for console methods.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    code: {
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
} satisfies Meta<typeof ReactMonacoEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  args: {
    code: `// Type 'con' to see completion suggestions
// for console.log, console.error, etc.

function example() {
  con
}`,
    language: 'typescript',
    theme: 'vs-dark',
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
const EventHandlingStory = () => {
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
        <ReactMonacoEditor
          code={`// Try these actions to see completion events:
// 1. Type 'con' and wait for suggestions
// 2. Press Tab/Enter to accept a suggestion
// 3. Press Escape to decline a suggestion
// 4. Type something else to ignore a suggestion

function demonstrateEvents() {
  con
}`}
          language="typescript"
          theme="vs-dark"
          onCompletionAccept={text => addEvent('completion:accept', { acceptedText: text })}
          onCompletionDecline={(text, reason) =>
            addEvent('completion:decline', { suggestionText: text, reason })
          }
          onCompletionIgnore={text => addEvent('completion:ignore', { suggestionText: text })}
        />
      </div>
      <EventLog events={events} />
    </div>
  );
};

export const EventHandling: Story = {
  render: () => <EventHandlingStory />,
};

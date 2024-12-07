import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MonacoEditor } from '../../components/MonacoEditor';
import { demoLanguages } from '../utils/demoData';

const meta = {
  title: 'Pre-built Monaco/Basic Examples',
  component: MonacoEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A pre-built Monaco Editor component with integrated ghost text completion.

## Features
- Inline code completion suggestions powered by AI
- SQL and Java support
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
      language="sql" // or "java"
      theme="vs-dark"
      api={completionApi}
      config={{
        language: 'sql',
        debounceTime: 200,
        textLimits: {
          beforeCursor: 8000,
          afterCursor: 1000,
        }
      }}
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
      options: ['sql', 'java'],
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

export const SQL: Story = {
  args: {
    initialValue: demoLanguages.sql.code,
    language: 'sql',
    theme: 'vs-dark',
    api: demoLanguages.sql.api,
    config: demoLanguages.sql.config,
    style: {
      width: '800px',
      height: '400px',
    },
  },
};

export const Java: Story = {
  args: {
    initialValue: demoLanguages.java.code,
    language: 'java',
    theme: 'vs-dark',
    api: demoLanguages.java.api,
    config: demoLanguages.java.config,
    style: {
      width: '800px',
      height: '400px',
    },
  },
};

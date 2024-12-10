import type { Meta, StoryObj } from '@storybook/react';
import { ReactMonacoEditor, EditorProps } from '../ReactMonacoEditor';
import { demoLanguages } from '../utils/demoData';

const meta = {
  title: 'React Monaco/Basic Examples',
  component: ReactMonacoEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A Monaco Editor component using react-monaco-editor library with ghost text completion.

## Features
- Inline code completion suggestions
- SQL and Java support
- Dark and light themes
- Event handling for completion actions

## Usage
Try SQL queries with 'SELECT' or Java code with 'System'.
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<EditorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SQL: Story = {
  args: {
    code: demoLanguages.sql.code,
    language: 'sql',
    theme: 'vs-dark',
  },
};

export const Java: Story = {
  args: {
    code: demoLanguages.java.code,
    language: 'java',
    theme: 'vs-dark',
  },
};

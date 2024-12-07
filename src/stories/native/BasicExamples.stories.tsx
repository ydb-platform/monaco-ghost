import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MonacoEditor } from '../MonacoEditor';

const meta = {
  title: 'Native Monaco/Basic Examples',
  component: MonacoEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A Monaco Editor component with ghost text completion capabilities.

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
    initialValue: `-- Type 'SELECT' to see completion suggestions
-- for SQL queries

SELECT`,
    language: 'sql',
    theme: 'vs-dark',
  },
};

export const Java: Story = {
  args: {
    initialValue: `// Type 'System' to see completion suggestions
// for Java code

public class Example {
    public static void main(String[] args) {
        System`,
    language: 'java',
    theme: 'vs-dark',
  },
};

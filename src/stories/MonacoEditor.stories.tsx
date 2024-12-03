import type { Meta, StoryObj } from "@storybook/react";
import { MonacoEditor } from "./MonacoEditor";

const meta = {
  title: "Monaco Ghost/Editor",
  component: MonacoEditor,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A Monaco Editor component with ghost text completion capabilities.

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
  tags: ["autodocs"],
  argTypes: {
    initialValue: {
      description: "Initial code content",
      control: "text",
    },
    language: {
      description: "Programming language",
      control: "select",
      options: ["typescript", "javascript"],
    },
    theme: {
      description: "Editor theme",
      control: "select",
      options: ["vs-dark", "vs-light"],
    },
  },
} satisfies Meta<typeof MonacoEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  args: {
    initialValue: `// Type 'con' to see completion suggestions
// for console.log, console.error, etc.

function example() {
  con
}`,
    language: "typescript",
    theme: "vs-dark",
  },
};

export const JavaScript: Story = {
  args: {
    initialValue: `// JavaScript example
// Type 'con' to see suggestions

function example() {
  con
}`,
    language: "javascript",
    theme: "vs-dark",
  },
};

export const LightTheme: Story = {
  args: {
    initialValue: `// Light theme example
// Type 'con' to see suggestions

function example() {
  con
}`,
    language: "typescript",
    theme: "vs-light",
  },
};

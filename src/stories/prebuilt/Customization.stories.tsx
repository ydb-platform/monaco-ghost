import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MonacoEditor } from '../../components/MonacoEditor';
import { demoLanguages } from '../utils/demoData';
import { Disclaimer } from '../components/Disclaimer';

// Wrapper component to add disclaimer
const EditorWithDisclaimer = (props: React.ComponentProps<typeof MonacoEditor>) => (
  <div>
    <Disclaimer />
    <MonacoEditor {...props} />
  </div>
);

const meta = {
  title: 'Pre-built Monaco/Customization',
  component: EditorWithDisclaimer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Demonstrates customization options for the pre-built Monaco Editor.

## Features
- Theme customization
- Editor options
- Styling options
        `,
      },
    },
  },
} satisfies Meta<typeof EditorWithDisclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightTheme: Story = {
  args: {
    initialValue: `-- Light theme example
-- Type to see ghost text suggestions

SELECT`,
    language: 'sql',
    theme: 'vs-light',
    api: demoLanguages.sql.api,
    config: demoLanguages.sql.config,
    style: {
      width: '100%',
      height: '400px',
    },
  },
};

export const CustomOptions: Story = {
  args: {
    initialValue: `-- Customized editor example
-- With enhanced styling and options

SELECT * FROM users
WHERE status = 'active'
  AND created_at >= '2024-01-01'
ORDER BY last_login DESC
LIMIT 10;`,
    language: 'sql',
    theme: 'vs-dark',
    api: demoLanguages.sql.api,
    config: demoLanguages.sql.config,
    editorOptions: {
      fontSize: 16,
      lineHeight: 24,
      padding: { top: 16, bottom: 16 },
      minimap: { enabled: true },
      wordWrap: 'on',
      lineNumbers: 'off',
    },
    style: {
      width: '100%',
      height: '500px',
      border: '2px solid #007acc',
      borderRadius: '4px',
    },
  },
};

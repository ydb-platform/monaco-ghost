import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ReactMonacoEditor, EditorProps } from '../ReactMonacoEditor';
import { EventLog, Event } from '../components/EventLog';
import { demoLanguages } from '../utils/demoData';

const meta = {
  title: 'React Monaco/Event Handling',
  component: ReactMonacoEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Demonstrates event handling capabilities of the React Monaco Editor with ghost text completion.

## Events
- completion:accept - When a suggestion is accepted
- completion:decline - When a suggestion is declined (includes active suggestion and all suggestions)
- completion:ignore - When a suggestion is ignored (includes active suggestion and all suggestions)
        `,
      },
    },
  },
} satisfies Meta<EditorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const EventHandlingDemo = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [language, setLanguage] = useState('sql');

  const addEvent = (type: string, data: any) => {
    setEvents(prev => [...prev, { type, data, timestamp: Date.now() }]);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Clear events when switching languages
    setEvents([]);
  };

  const currentLanguage = language as keyof typeof demoLanguages;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>Language:</label>
        <select
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value="sql">SQL</option>
          <option value="java">Java</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1 1 auto', maxWidth: '800px' }}>
          <ReactMonacoEditor
            key={language} // Force re-mount when language changes
            code={demoLanguages[currentLanguage].code}
            language={language}
            theme="vs-dark"
            onCompletionAccept={text => addEvent('completion:accept', { acceptedText: text })}
            onCompletionDecline={(text, reason, allSuggestions) =>
              addEvent('completion:decline', {
                suggestionText: text,
                reason,
                allSuggestions,
              })
            }
            onCompletionIgnore={(text, allSuggestions) =>
              addEvent('completion:ignore', {
                suggestionText: text,
                allSuggestions,
              })
            }
          />
        </div>
        <div style={{ flex: '0 0 400px' }}>
          <EventLog events={events} />
        </div>
      </div>
    </div>
  );
};

export const EventHandling: Story = {
  render: () => <EventHandlingDemo />,
};

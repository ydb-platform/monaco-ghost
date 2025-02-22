import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MonacoEditor } from '../../components/MonacoEditor';
import { EventLog, Event } from '../components/EventLog';
import { Disclaimer } from '../components/Disclaimer';
import { demoLanguages } from '../utils/demoData';

const meta = {
  title: 'Pre-built Monaco/Event Handling',
  component: MonacoEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Demonstrates event handling capabilities of the pre-built Monaco Editor with ghost text completion.

## Events
- completion:accept - When a suggestion is accepted
- completion:decline - When a suggestion is declined (includes active suggestion and all suggestions)
- completion:ignore - When a suggestion is ignored (includes active suggestion and all suggestions)
        `,
      },
    },
  },
} satisfies Meta<typeof MonacoEditor>;

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
  const { code, api, config } = demoLanguages[currentLanguage];

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
          <Disclaimer />
          <MonacoEditor
            key={language} // Force re-mount when language changes
            initialValue={code}
            language={language}
            theme="vs-dark"
            api={api}
            config={config}
            eventHandlers={{
              onCompletionAccept: event =>
                addEvent('completion:accept', { acceptedText: event.acceptedText }),

              onCompletionDecline: event =>
                addEvent('completion:decline', {
                  suggestionText: event.suggestionText,
                  reason: event.reason,
                  allSuggestions: event.allSuggestions,
                }),

              onCompletionIgnore: event =>
                addEvent('completion:ignore', {
                  suggestionText: event.suggestionText,
                  allSuggestions: event.allSuggestions,
                }),
            }}
            style={{ width: '', height: '400px' }}
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
  args: {
    // Default args required by Storybook
    api: demoLanguages.sql.api,
    config: demoLanguages.sql.config,
  },
  render: () => <EventHandlingDemo />,
};

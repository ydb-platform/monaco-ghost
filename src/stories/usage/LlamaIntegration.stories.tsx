import type { Meta, StoryObj } from '@storybook/react';
import { MonacoEditor } from '../../components/MonacoEditor';
import { PromptFile, Suggestions } from '../../types';
import React, { useState, useCallback, useEffect } from 'react';

// Configuration form component
const LlamaConfigForm = ({
  onSubmit,
  initialUrl = 'http://localhost:8080',
  initialEndpoint = '/completion',
}: {
  onSubmit: (url: string, endpoint: string) => void;
  initialUrl?: string;
  initialEndpoint?: string;
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [endpoint, setEndpoint] = useState(initialEndpoint);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url, endpoint);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Llama Server URL:</label>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ width: '300px', padding: '5px' }}
          placeholder="http://localhost:8080"
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Endpoint:</label>
        <input
          type="text"
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          style={{ width: '300px', padding: '5px' }}
          placeholder="/completion"
        />
      </div>
      <button type="submit" style={{ padding: '5px 10px' }}>
        Update Configuration
      </button>
    </form>
  );
};

// Create a reusable API factory
const createLlamaApi = (
  baseUrl: string,
  endpoint: string,
  options = { maxTokens: 100, temperature: 0.7 }
) => {
  const fullUrl = `${baseUrl}${endpoint}`;

  return {
    getCodeAssistSuggestions: async (files: PromptFile[]): Promise<Suggestions> => {
      try {
        if (!files.length || !files[0]?.fragments) {
          return {
            items: [],
            requestId: 'llama-request-empty',
          };
        }

        const text = files[0].fragments.map(f => f.text).join('');

        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            max_tokens: options.maxTokens,
            temperature: options.temperature,
          }),
        });

        if (!response.ok) {
          console.error('Llama API error:', response.status, response.statusText);
          throw new Error('Failed to fetch from Llama API');
        }

        const data = await response.json();
        return {
          items: data.completion,
          requestId: 'llama-request',
        };
      } catch (error) {
        console.error('Error fetching from Llama:', error);
        return {
          items: [],
          requestId: 'llama-request-error',
        };
      }
    },
  };
};

// Wrapper component for the editor with configuration
const LlamaEditorWithConfig = ({
  config,
  initialValue,
  options = { maxTokens: 100, temperature: 0.7 },
}: {
  config: any;
  initialValue: string;
  options?: { maxTokens: number; temperature: number };
}) => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:8080');
  const [endpoint, setEndpoint] = useState('/completion');
  const [api, setApi] = useState(() => createLlamaApi(baseUrl, endpoint, options));

  // Update API when configuration changes
  const handleConfigUpdate = useCallback(
    (newBaseUrl: string, newEndpoint: string) => {
      console.log('Updating Llama configuration:', { newBaseUrl, newEndpoint });
      setBaseUrl(newBaseUrl);
      setEndpoint(newEndpoint);
      const newApi = createLlamaApi(newBaseUrl, newEndpoint, options);
      setApi(newApi);
    },
    [options]
  );

  // Effect to recreate API when URL or endpoint changes
  useEffect(() => {
    console.log('Recreating API with:', { baseUrl, endpoint });
    const newApi = createLlamaApi(baseUrl, endpoint, options);
    setApi(newApi);
  }, [baseUrl, endpoint, options]);

  return (
    <div>
      <LlamaConfigForm
        onSubmit={handleConfigUpdate}
        initialUrl={baseUrl}
        initialEndpoint={endpoint}
      />
      <div style={{ marginBottom: '10px' }}>
        Current Llama URL:{' '}
        <code>
          {baseUrl}
          {endpoint}
        </code>
      </div>
      <MonacoEditor
        key={`${baseUrl}${endpoint}`} // Force recreation when URL changes
        initialValue={initialValue}
        language="python"
        theme="vs-dark"
        api={api}
        config={config}
        style={{
          width: '800px',
          height: '400px',
          border: '2px solid #4a9eff',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

const meta = {
  title: 'Usage/Llama',
  component: LlamaEditorWithConfig,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Demonstrates integration with Llama code completion API.

## Configuration
To use this example:
1. Enter your Llama server URL and endpoint
2. Click "Update Configuration" to apply changes
3. Start typing to see AI-powered suggestions

The configuration form allows you to:
- Set the base URL of your Llama server
- Configure the completion endpoint
- Update the connection settings in real-time
        `,
      },
    },
  },
} satisfies Meta<typeof LlamaEditorWithConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

const llamaConfig = {
  debounceTime: 300,
  textLimits: {
    beforeCursor: 12000,
    afterCursor: 2000,
  },
  suggestionCache: {
    enabled: true,
  },
};

export const LlamaCodeCompletion: Story = {
  args: {
    initialValue: `# Example Python code with Llama completion
# Start typing below to see AI-powered suggestions

def process_data(data):
    `,
    config: llamaConfig,
    options: {
      maxTokens: 100,
      temperature: 0.7,
    },
  },
};

export const CustomizedLlama: Story = {
  args: {
    initialValue: `# Customized Llama integration example
# With different temperature and token settings

class DataProcessor:
    def __init__(self):
        `,
    config: {
      ...llamaConfig,
      debounceTime: 400,
      textLimits: {
        beforeCursor: 16000,
        afterCursor: 3000,
      },
    },
    options: {
      maxTokens: 150, // Increased token limit
      temperature: 0.5, // Lower temperature for more focused completions
    },
  },
};

import React from 'react';

export interface Event {
  type: string;
  data: any;
  timestamp: number;
}

interface EventLogProps {
  events: Event[];
}

export const EventLog = ({ events }: EventLogProps) => (
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

import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <div
      style={{
        padding: '10px',
        marginBottom: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        borderRadius: '4px',
        color: '#856404',
        fontSize: '14px',
      }}
    >
      ⚠️ Note: All code suggestions are randomly generated to demonstrate the functionality. They
      may not represent optimal or correct solutions.
    </div>
  );
};

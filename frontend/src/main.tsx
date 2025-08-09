import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize any global configurations here
import './utils/init';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
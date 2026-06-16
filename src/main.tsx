import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Custom stylesheets
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

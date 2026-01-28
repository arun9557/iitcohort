
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error('Failed to find the root element');
    document.body.innerHTML = '<div style="color:red; padding: 20px;"><h1>Error: Root element not found</h1></div>';
} else {
    try {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } catch (err) {
        console.error('Error mounting React app:', err);
        rootElement.innerHTML = `<div style="color:red; padding: 20px;"><h1>Error mounting app</h1><pre>${err.message}</pre></div>`;
    }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { queryClient } from './core/api/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './auth/components/SessionProvider';
import { ToastProvider } from './shared/components/ToastProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

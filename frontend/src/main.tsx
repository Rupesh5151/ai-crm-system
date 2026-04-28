import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { useThemeStore } from './stores/themeStore';

const theme = useThemeStore.getState();
if (theme.isDark) document.documentElement.classList.add('dark');

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster position="top-right" toastOptions={{
                    className: 'dark:bg-slate-800 dark:text-white dark:border-slate-700',
                    duration: 4000,
                }} />
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
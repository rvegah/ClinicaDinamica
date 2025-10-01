import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeContextProvider } from './app/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <App />
        </SnackbarProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
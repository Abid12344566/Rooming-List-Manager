import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import BookingsModal from './components/BookingsModal';
import './index.css';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <Dashboard />
        <AuthModal />
        <BookingsModal />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </AppProvider>
  );
}

export default App; 
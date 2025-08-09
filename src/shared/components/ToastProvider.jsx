import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [timeouts, setTimeouts] = useState(new Map());
  const MAX_TOASTS = 3; // Maximum number of toasts visible at once

  const showToast = (message, type = 'info', duration = 4000) => {
    // Check if toast with same message and type already exists
    const existingToast = toasts.find(toast => 
      toast.message === message && toast.type === type
    );
    
    if (existingToast) {
      // If duplicate exists, clear its timeout and don't show again
      const existingTimeout = timeouts.get(existingToast.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        setTimeouts(prev => {
          const newMap = new Map(prev);
          newMap.delete(existingToast.id);
          return newMap;
        });
      }
      
      // Reset the duration for the existing toast
      const timeoutId = setTimeout(() => {
        removeToast(existingToast.id);
      }, duration);
      
      setTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.set(existingToast.id, timeoutId);
        return newMap;
      });
      
      return; // Don't create a new toast
    }

    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => {
      const newToasts = [...prev, toast];
      // Keep only the most recent toasts (FIFO - remove oldest first)
      if (newToasts.length > MAX_TOASTS) {
        const removedToasts = newToasts.slice(0, newToasts.length - MAX_TOASTS);
        // Clear timeouts for removed toasts
        removedToasts.forEach(removedToast => {
          const timeoutId = timeouts.get(removedToast.id);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        });
        setTimeouts(prev => {
          const newMap = new Map(prev);
          removedToasts.forEach(removedToast => {
            newMap.delete(removedToast.id);
          });
          return newMap;
        });
      }
      return newToasts.slice(-MAX_TOASTS);
    });
    
    // Auto-remove toast after duration
    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, duration);
    
    setTimeouts(prev => {
      const newMap = new Map(prev);
      newMap.set(id, timeoutId);
      return newMap;
    });
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    // Clear timeout for removed toast
    setTimeouts(prev => {
      const newMap = new Map(prev);
      const timeoutId = newMap.get(id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        newMap.delete(id);
      }
      return newMap;
    });
  };

  const showSuccess = (message, duration) => showToast(message, 'success', duration);
  const showError = (message, duration) => showToast(message, 'error', duration);
  const showWarning = (message, duration) => showToast(message, 'warning', duration);
  const showInfo = (message, duration) => showToast(message, 'info', duration);

  const clearAllToasts = () => {
    // Clear all timeouts
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    setTimeouts(new Map());
    setToasts([]);
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [timeouts]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container top-right">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
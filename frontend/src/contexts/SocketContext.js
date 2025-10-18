import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        
        // Join user's personal room
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('receiveMessage', (data) => {
        const { from, message, timestamp } = data;
        setMessages(prev => ({
          ...prev,
          [from]: [
            ...(prev[from] || []),
            { from, message, timestamp, isOwn: false }
          ]
        }));
      });

      newSocket.on('messageSent', (data) => {
        const { to, message, timestamp } = data;
        setMessages(prev => ({
          ...prev,
          [to]: [
            ...(prev[to] || []),
            { to, message, timestamp, isOwn: true }
          ]
        }));
      });

      newSocket.on('userTyping', (data) => {
        const { from, isTyping } = data;
        setTypingUsers(prev => ({
          ...prev,
          [from]: isTyping
        }));

        // Clear typing indicator after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [from]: false
            }));
          }, 3000);
        }
      });

      newSocket.on('userStatusUpdate', (data) => {
        const { userId, isOnline } = data;
        // Handle user online/offline status
        console.log(`User ${userId} is ${isOnline ? 'online' : 'offline'}`);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (to, message) => {
    if (socket && connected) {
      socket.emit('sendMessage', {
        to,
        message,
        from: user.id
      });
    }
  };

  const sendTyping = (to, isTyping) => {
    if (socket && connected) {
      socket.emit('typing', {
        to,
        from: user.id,
        isTyping
      });
    }
  };

  const updateUserStatus = (to, isOnline) => {
    if (socket && connected) {
      socket.emit('userStatus', {
        to,
        userId: user.id,
        isOnline
      });
    }
  };

  const getMessages = (userId) => {
    return messages[userId] || [];
  };

  const clearMessages = (userId) => {
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[userId];
      return newMessages;
    });
  };

  const isUserTyping = (userId) => {
    return typingUsers[userId] || false;
  };

  const value = {
    socket,
    connected,
    sendMessage,
    sendTyping,
    updateUserStatus,
    getMessages,
    clearMessages,
    isUserTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

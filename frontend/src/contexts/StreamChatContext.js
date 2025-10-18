import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from './AuthContext';
import { streamAPI } from '../services/api';

const StreamChatContext = createContext();

// Stream Chat API Keys - Now handled by backend
// const STREAM_API_KEY = process.env.REACT_APP_STREAM_API_KEY || 'cm6gt9re6pnp';
// const STREAM_SECRET = process.env.REACT_APP_STREAM_SECRET || 'fp7npfygectyp8zeu6fhzc5ghbbg5g33sd84x9awcwj87hd69fuv5u5negwnffw9'; // Replace with your actual Stream secret

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  return context;
};

export const StreamChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Debug client state
  console.log('StreamChatProvider state:', { 
    isAuthenticated, 
    hasUser: !!user, 
    client: !!client, 
    isLoading, 
    isConnecting 
  });

  useEffect(() => {
    let streamClient;
    let isMounted = true;

    const initStream = async () => {
      if (!isAuthenticated || !user) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // Prevent multiple connection attempts
      if (isConnecting) {
        return;
      }

      // Check if client is already connected
      if (streamClient && streamClient.userID === user.id) {
        console.log('Stream Chat client already connected for user:', user.name);
        if (isMounted) {
          setClient(streamClient);
          setIsLoading(false);
        }
        return;
      }

      // Validate user object has required fields
      if (!user.id || !user.name) {
        console.error('User object missing required fields:', user);
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsConnecting(true);
      }

      try {
        console.log('Starting Stream Chat initialization for user:', user.name);
        
        // Get token from backend with timeout
        console.log('Getting token from backend...');
        const tokenPromise = streamAPI.getToken();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Token request timeout')), 10000)
        );
        
        const tokenResponse = await Promise.race([tokenPromise, timeoutPromise]);
        const { token, apiKey } = tokenResponse.data;
        console.log('Token received from backend:', { hasToken: !!token, hasApiKey: !!apiKey });
        
        // Initialize Stream Chat client
        console.log('Initializing Stream Chat client...');
        streamClient = StreamChat.getInstance(apiKey);
        console.log('Stream Chat client instance created');

        // Connect user to Stream Chat with server-generated token and timeout
        console.log('Connecting user to Stream Chat...');
        
        // Check if already connected to prevent WebSocket errors
        if (streamClient.userID === user.id) {
          console.log('User already connected, skipping connection');
          if (isMounted) {
            setClient(streamClient);
            setIsLoading(false);
            setIsConnecting(false);
          }
          return;
        }
        
        const connectPromise = streamClient.connectUser(
          {
            id: user.id,
            name: user.name || 'Unknown User',
            email: user.email || '',
            image: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
            role: user.roles?.[0] || 'user',
            // Add custom fields based on user role
            ...(user.roles?.includes('vendor') && { 
              vendorId: user.id,
              isVendor: true 
            }),
            ...(user.roles?.includes('ngo') && { 
              ngoId: user.id,
              isNGO: true 
            }),
            ...(user.roles?.includes('customer') && { 
              customerId: user.id,
              isCustomer: true 
            })
          },
          token
        );
        
        const connectTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stream Chat connection timeout')), 15000)
        );
        
        await Promise.race([connectPromise, connectTimeoutPromise]);

        console.log('Stream Chat connected successfully for user:', user.name);

        if (isMounted) {
          setClient(streamClient);
          console.log('Stream Chat client set in state');
        }
      } catch (error) {
        console.error('Error initializing Stream Chat:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error stack:', error.stack);
      } finally {
        if (isMounted) {
          console.log('Setting loading and connecting states to false');
          setIsLoading(false);
          setIsConnecting(false);
        }
      }
    };

    initStream();

    // Cleanup function
    return () => {
      isMounted = false;
      if (streamClient) {
        streamClient.disconnectUser();
      }
    };
  }, [isAuthenticated, user?.id, user?.name]);

  const createChannel = async (channelType, channelId, members, metadata = {}) => {
    if (!client) return null;

    try {
      const channel = client.channel(channelType, channelId, {
        name: metadata.name || `Channel ${channelId}`,
        members: members,
        ...metadata
      });

      await channel.create();
      return channel;
    } catch (error) {
      console.error('Error creating channel:', error);
      return null;
    }
  };

  const waitForClient = async () => {
    if (client) return client;
    
    console.log('Waiting for Stream Chat client...');
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (!client && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!client) {
      console.error('Stream Chat client not available after waiting');
      return null;
    }
    
    console.log('Stream Chat client is now available');
    return client;
  };

  const getOrCreateChannel = async (channelType, channelId, members, metadata = {}) => {
    const currentClient = await waitForClient();
    if (!currentClient) {
      return null;
    }

    try {
      console.log('Creating channel via backend API:', { channelType, channelId, members, metadata });
      
      // Use backend endpoint to create channel (which handles user creation)
      const response = await streamAPI.createChannel({
        channelType: channelType,
        channelId: channelId,
        members: members,
        metadata: {
          name: metadata.name || `Channel ${channelId}`,
          ...metadata
        }
      });
      
      console.log('Backend channel creation response:', response);
      
      // Get the channel from Stream Chat client
      const channel = currentClient.channel(channelType, channelId);
      console.log('Getting channel from client:', channel);
      
      await channel.watch();
      console.log('Channel watched successfully:', channel);
      
      return channel;
    } catch (error) {
      console.error('Error getting/creating channel:', error);
      console.error('Error details:', error.response?.data || error.message);
      return null;
    }
  };

  const retryConnection = async () => {
    console.log('Manual retry of Stream Chat connection...');
    if (isConnecting) {
      console.log('Already connecting, skipping retry');
      return;
    }
    
    // Reset states
    setIsLoading(true);
    setIsConnecting(false);
    setClient(null);
    
    // Trigger reconnection by calling initStream
    const initStream = async () => {
      if (!isAuthenticated || !user) return;
      
      let streamClient;
      let isMounted = true;
      
      try {
        console.log('Retrying Stream Chat initialization for user:', user.name);
        
        // Get token from backend with timeout
        const tokenPromise = streamAPI.getToken();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Token request timeout')), 10000)
        );
        
        const tokenResponse = await Promise.race([tokenPromise, timeoutPromise]);
        const { token, apiKey } = tokenResponse.data;
        
        // Initialize Stream Chat client
        streamClient = StreamChat.getInstance(apiKey);

        // Connect user to Stream Chat with server-generated token and timeout
        const connectPromise = streamClient.connectUser(
          {
            id: user.id,
            name: user.name || 'Unknown User',
            email: user.email || '',
            image: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
            role: user.roles?.[0] || 'user',
            ...(user.roles?.includes('vendor') && { 
              vendorId: user.id,
              isVendor: true 
            }),
            ...(user.roles?.includes('ngo') && { 
              ngoId: user.id,
              isNGO: true 
            }),
            ...(user.roles?.includes('customer') && { 
              customerId: user.id,
              isCustomer: true 
            })
          },
          token
        );
        
        const connectTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stream Chat connection timeout')), 15000)
        );
        
        await Promise.race([connectPromise, connectTimeoutPromise]);

        console.log('Stream Chat reconnected successfully for user:', user.name);

        if (isMounted) {
          setClient(streamClient);
        }
      } catch (error) {
        console.error('Error retrying Stream Chat connection:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsConnecting(false);
        }
      }
    };
    
    await initStream();
  };

  const value = {
    client,
    isLoading,
    createChannel,
    getOrCreateChannel,
    waitForClient,
    retryConnection,
    isConnected: !!client
  };

  return (
    <StreamChatContext.Provider value={value}>
      {children}
    </StreamChatContext.Provider>
  );
};

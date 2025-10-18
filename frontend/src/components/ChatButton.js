import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStreamChat } from '../contexts/StreamChatContext';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, X } from 'lucide-react';

const ChatButton = ({ 
  targetUserId, 
  targetUserName, 
  targetUserRole,
  donationId,
  className = "" 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getOrCreateChannel, waitForClient, isConnected, retryConnection } = useStreamChat();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const startChat = async () => {
    if (!targetUserId || !user) return;

    console.log('Starting chat with:', { targetUserId, targetUserName, targetUserRole, user: user.id });
    console.log('Stream Chat connection status:', { isConnected, hasClient: !!waitForClient });
    
    setIsLoading(true);
    
    // Ensure Stream Chat client is ready
    if (!isConnected) {
      console.log('Stream Chat not connected, waiting for connection...');
      const client = await waitForClient();
      if (!client) {
        console.error('Failed to establish Stream Chat connection, attempting retry...');
        try {
          await retryConnection();
          const retryClient = await waitForClient();
          if (!retryClient) {
            alert('Chat service is not available. Please refresh the page and try again.');
            setIsLoading(false);
            return;
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          alert('Chat service is not available. Please refresh the page and try again.');
          setIsLoading(false);
          return;
        }
      }
    }
    
    try {
      // Create a unique channel ID based on the users and context
      const channelId = donationId 
        ? `donation-${donationId}-${user.id}-${targetUserId}`
        : `chat-${user.id}-${targetUserId}`;

      console.log('Channel ID:', channelId);

      // Determine channel type and metadata based on context
      const channelType = 'messaging';
      const members = [user.id, targetUserId];
      
      let metadata = {
        name: `Chat with ${targetUserName}`,
        members: members
      };

      // Add donation context if available
      if (donationId) {
        metadata = {
          ...metadata,
          donationId: donationId,
          type: 'donation-chat'
        };
      }

      // Add role-specific metadata
      if (user.roles?.includes('vendor') && targetUserRole === 'customer') {
        metadata = {
          ...metadata,
          vendor: { id: user.id, name: user.name },
          customer: { id: targetUserId, name: targetUserName },
          type: 'vendor-customer'
        };
      } else if (user.roles?.includes('vendor') && targetUserRole === 'ngo') {
        metadata = {
          ...metadata,
          vendor: { id: user.id, name: user.name },
          ngo: { id: targetUserId, name: targetUserName },
          type: 'vendor-ngo'
        };
      } else if (user.roles?.includes('ngo') && targetUserRole === 'vendor') {
        metadata = {
          ...metadata,
          ngo: { id: user.id, name: user.name },
          vendor: { id: targetUserId, name: targetUserName },
          type: 'ngo-vendor'
        };
      }

      console.log('Creating channel with:', { channelType, channelId, members, metadata });

      const channel = await getOrCreateChannel(channelType, channelId, members, metadata);
      
      console.log('Channel result:', channel);
      
      if (channel) {
        console.log('Navigating to chat page:', `/chat?channel=${channelId}`);
        // Navigate to chat page with the specific channel
        navigate(`/chat?channel=${channelId}`);
      } else {
        console.error('Failed to create channel - channel is null');
        alert('Failed to create chat channel. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Error starting chat: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!targetUserId || targetUserId === user?.id) {
    return null; // Don't show chat button for self
  }

  return (
    <>
      <button
        onClick={startChat}
        disabled={isLoading}
        className={`inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>
          {isLoading ? t('common.loading') : t('chat.startConversation')}
        </span>
      </button>

      {/* Chat Modal (Optional - for inline chat) */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Chat with {targetUserName}
              </h3>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Start a conversation with {targetUserName} about this donation.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={startChat}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? t('common.loading') : 'Start Chat'}
                </button>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;

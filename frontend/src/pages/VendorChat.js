import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useStreamChat } from '../contexts/StreamChatContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Chat as StreamChatComponent,
  Channel,
  ChannelList,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
  LoadingIndicator
} from 'stream-chat-react';
import { 
  MessageCircle, 
  Users, 
  Search, 
  Plus,
  Store,
  User,
  Package,
  Heart,
  X
} from 'lucide-react';

// Import Stream Chat CSS
import 'stream-chat-react/dist/css/v2/index.css';

const VendorChat = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { client, isLoading, getOrCreateChannel } = useStreamChat();
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(null);
  const [showChannelList, setShowChannelList] = useState(true);
  const [channels, setChannels] = useState([]);
  const [channelMembers, setChannelMembers] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Handle channel parameter from URL
  useEffect(() => {
    const channelId = searchParams.get('channel');
    if (channelId && client) {
      console.log('Setting active channel from URL:', channelId);
      // Find and set the active channel
      const channel = client.channel('messaging', channelId);
      
      // Watch the channel to ensure it's ready for messaging
      channel.watch().then(() => {
        console.log('Channel watched successfully:', channelId);
        setActiveChannel(channel);
        
        // Update members when channel is ready
        if (channel.state?.members) {
          setChannelMembers(channel.state.members);
        }
        
        // Listen for member updates
        channel.on('member.added', (event) => {
          console.log('Member added:', event);
          setChannelMembers(channel.state.members);
        });
        
        channel.on('member.updated', (event) => {
          console.log('Member updated:', event);
          setChannelMembers(channel.state.members);
        });
        
      }).catch((error) => {
        console.error('Error watching channel:', error);
        // Still set the channel even if watch fails
        setActiveChannel(channel);
      });
    }
  }, [searchParams, client]);

  // Get vendor-specific channels
  const getVendorChannelFilters = () => {
    if (!user || !user.roles?.includes('vendor')) return {};

    return {
      type: 'messaging',
      members: { $in: [user.id] },
      $or: [
        { 'vendor.id': user.id },
        { 'vendorId': user.id }
      ]
    };
  };

  // Create a new customer chat channel
  const createCustomerChat = async (customerId, customerName) => {
    if (!client) return;

    try {
      const channelId = `vendor-${user.id}-customer-${customerId}`;
      const channel = await getOrCreateChannel(
        'messaging',
        channelId,
        [user.id, customerId],
        {
          name: `Chat with ${customerName}`,
          vendor: {
            id: user.id,
            name: user.name
          },
          customer: {
            id: customerId,
            name: customerName
          },
          type: 'vendor-customer'
        }
      );

      if (channel) {
        setActiveChannel(channel);
      }
    } catch (error) {
      console.error('Error creating customer chat:', error);
    }
  };

  // Get or create NGO chat channel
  const createNGOChat = async (ngoId, ngoName) => {
    if (!client) return;

    try {
      const channelId = `vendor-${user.id}-ngo-${ngoId}`;
      const channel = await getOrCreateChannel(
        'messaging',
        channelId,
        [user.id, ngoId],
        {
          name: `Donation Chat with ${ngoName}`,
          vendor: {
            id: user.id,
            name: user.name
          },
          ngo: {
            id: ngoId,
            name: ngoName
          },
          type: 'vendor-ngo'
        }
      );

      if (channel) {
        setActiveChannel(channel);
      }
    } catch (error) {
      console.error('Error creating NGO chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingIndicator />
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('navigation.vendorChat')}
          </h3>
          <p className="text-gray-600">
            {t('chat.noMessages')}
          </p>
        </div>
      </div>
    );
  }

  // Get the other participant's name
  const getOtherParticipantName = () => {
    if (!activeChannel || !user) {
      console.log('getOtherParticipantName: Missing activeChannel or user');
      return 'Unknown User';
    }
    
    console.log('getOtherParticipantName: Channel state:', activeChannel.state);
    console.log('getOtherParticipantName: Channel members (state):', activeChannel.state?.members);
    console.log('getOtherParticipantName: Channel members (tracked):', channelMembers);
    console.log('getOtherParticipantName: Current user ID:', user.id);
    
    // Try both sources for members
    const members = channelMembers || activeChannel.state?.members || {};
    const memberIds = Object.keys(members);
    
    console.log('getOtherParticipantName: Member IDs:', memberIds);
    
    // Find the member who is not the current user
    const otherMemberId = memberIds.find(id => id !== user.id);
    
    console.log('getOtherParticipantName: Other member ID:', otherMemberId);
    
    if (otherMemberId && members[otherMemberId]) {
      const otherMember = members[otherMemberId];
      console.log('getOtherParticipantName: Other member data:', otherMember);
      return otherMember.user?.name || 'Unknown User';
    }
    
    // Fallback: try to get name from channel data or metadata
    const channelData = activeChannel.data;
    console.log('getOtherParticipantName: Channel data:', channelData);
    
    // Check if we can get the name from channel metadata
    if (channelData?.name && channelData.name !== 'Channel') {
      return channelData.name.replace('Chat with ', '');
    }
    
    return 'Unknown User';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowChannelList(!showChannelList)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Store className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {t('navigation.vendorChat')}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Search messages"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        <StreamChatComponent client={client}>
            {/* Channel List Sidebar */}
            <div className={`${showChannelList ? 'flex' : 'hidden'} lg:flex flex-col w-80 border-r border-gray-200 bg-white`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  {t('navigation.vendorChat')}
                </h2>
                <div className="space-y-2">
                  <button 
                    onClick={() => {/* Open customer list modal */}}
                    className="w-full bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Chat with Customer</span>
                  </button>
                  <button 
                    onClick={() => {/* Open NGO list modal */}}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Chat with NGO</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ChannelList
                  filters={getVendorChannelFilters()}
                  sort={{ last_message_at: -1 }}
                  showChannelSearch
                  Preview={(props) => (
                    <VendorChannelPreview {...props} setActiveChannel={setActiveChannel} activeChannel={activeChannel} />
                  )}
                />
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeChannel ? (
                <Channel channel={activeChannel}>
                <Window>
                  <ChannelHeader>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Store className="w-5 h-5 text-primary-600" />
                        <span className="font-medium">Chat with {getOtherParticipantName()}</span>
                      </div>
                    </div>
                  </ChannelHeader>
                  
                  <MessageList
                    disableDateSeparator={false}
                  />
                  
                  <MessageInput />
                </Window>
                
                <Thread />
              </Channel>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('chat.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('chat.noMessages')}
                    </p>
                  </div>
                </div>
              )}
            </div>
        </StreamChatComponent>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Messages</h3>
              <button 
                onClick={() => setShowSearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search in messages..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-600">
                Search through all your vendor chat messages.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Start New Conversation</h3>
              <button 
                onClick={() => setShowNewChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Choose who you want to start a conversation with:
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setShowNewChat(false);
                    // Navigate to find customers page
                    window.location.href = '/find-customers';
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Find Customers</div>
                  <div className="text-sm text-gray-600">Start chatting with customers</div>
                </button>
                <button 
                  onClick={() => {
                    setShowNewChat(false);
                    // Navigate to find NGOs page
                    window.location.href = '/find-ngos';
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Find NGOs</div>
                  <div className="text-sm text-gray-600">Start chatting with NGOs</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Vendor Channel Preview Component
const VendorChannelPreview = ({ channel, setActiveChannel, setToggleMobile, activeChannel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const channelName = channel.data?.name || channel.data?.id || 'Unknown Channel';
  const lastMessage = channel.state?.messages?.[channel.state.messages.length - 1];
  const unreadCount = channel.state?.unreadCount || 0;
  const channelType = channel.data?.type || 'general';
  const isActive = activeChannel && channel.cid === activeChannel.cid;

  const handleClick = () => {
    if (setActiveChannel) {
      setActiveChannel(channel);
    }
    if (setToggleMobile) {
      setToggleMobile((prevState) => !prevState);
    }
  };

  const getChannelIcon = () => {
    switch (channelType) {
      case 'vendor-customer':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'vendor-ngo':
        return <Heart className="w-5 h-5 text-green-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getChannelTypeLabel = () => {
    switch (channelType) {
      case 'vendor-customer':
        return 'Customer Chat';
      case 'vendor-ngo':
        return 'NGO Chat';
      default:
        return 'General';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
        isActive ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {getChannelIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {channelName}
            </h3>
            {lastMessage && (
              <span className="text-xs text-gray-500">
                {new Date(lastMessage.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {getChannelTypeLabel()}
            </span>
          </div>
          
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate mt-1">
              {lastMessage.user?.name}: {lastMessage.text || 'Sent an attachment'}
            </p>
          )}
          
          {unreadCount > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
              </span>
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom Vendor Message Component removed - using default Stream Chat message rendering

// Custom Vendor Message Input Component removed - using default Stream Chat message input

export default VendorChat;

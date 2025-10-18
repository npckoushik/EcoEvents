# Stream Chat Integration Setup

This document explains how to set up and configure Stream Chat for the EcoFesta application.

## Overview

The chat system uses Stream Chat SDK which provides:
- Real-time messaging
- No need to store chat data in MongoDB
- Scalable for large numbers of users
- Built-in features like typing indicators, read receipts, etc.

## Setup Instructions

### 1. Create Stream Account

1. Go to [https://getstream.io/](https://getstream.io/)
2. Sign up for a free account
3. Create a new app in the Stream dashboard
4. Note down your API Key and Secret

### 2. Environment Variables

Create a `.env.local` file in the `frontend` directory with:

```env
# Stream Chat Configuration
# Get these from https://getstream.io/dashboard/
REACT_APP_STREAM_API_KEY=your_stream_api_key_here
REACT_APP_STREAM_SECRET=your_stream_secret_here

# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# Other environment variables
REACT_APP_ENVIRONMENT=development
```

**Note**: The current implementation uses hardcoded API keys for development. In production, make sure to use environment variables and implement server-side token generation.

### 3. Features Implemented

#### Chat Components
- **Main Chat Page** (`/chat`): General chat interface for all users
- **Vendor Chat Page** (`/vendor-chat`): Specialized chat for vendors
- **Chat Button Component**: Quick chat initiation from donation/product pages

#### Chat Types
- **General Chat**: Between any users
- **Vendor-Customer Chat**: For product inquiries
- **Vendor-NGO Chat**: For donation coordination
- **NGO-Vendor Chat**: For donation requests

#### Features
- Real-time messaging
- Channel management
- User presence indicators
- Message search
- File sharing (built-in)
- Typing indicators
- Read receipts
- Thread support

### 4. Usage

#### Starting a Chat
```jsx
import ChatButton from '../components/ChatButton';

// In your component
<ChatButton 
  targetUserId={userId}
  targetUserName={userName}
  targetUserRole={userRole}
  donationId={donationId} // Optional
/>
```

#### Accessing Chat Context
```jsx
import { useStreamChat } from '../contexts/StreamChatContext';

const { client, createChannel, getOrCreateChannel } = useStreamChat();
```

### 5. Channel Types

The system creates different types of channels:

- **messaging**: Standard chat channels
- **donation-chat**: Channels related to specific donations
- **vendor-customer**: Vendor and customer communication
- **vendor-ngo**: Vendor and NGO communication
- **ngo-vendor**: NGO and vendor communication

### 6. User Roles Integration

The chat system integrates with the existing user roles:

- **Vendors**: Can chat with customers and NGOs
- **NGOs**: Can chat with vendors about donations
- **Customers**: Can chat with vendors about products

### 7. Security

- User tokens are generated using Stream's dev token (for development)
- In production, implement server-side token generation
- Channels are created with proper member restrictions
- User data is synced with the existing authentication system

### 8. Customization

The chat interface can be customized by:

- Modifying the CSS classes in chat components
- Customizing message components
- Adding custom channel types
- Implementing custom channel filters

### 9. Production Considerations

For production deployment:

1. **Server-side Token Generation**: Implement proper JWT token generation on your backend
2. **Rate Limiting**: Configure appropriate rate limits in Stream dashboard
3. **Moderation**: Set up content moderation rules
4. **Analytics**: Enable Stream's analytics features
5. **Backup**: Configure data retention policies

### 10. Troubleshooting

Common issues and solutions:

- **Connection Issues**: Check API keys and network connectivity
- **User Not Found**: Ensure user is properly authenticated
- **Channel Creation Failed**: Verify user permissions and channel settings
- **Messages Not Sending**: Check user token validity

### 11. Stream Dashboard

Access your Stream dashboard to:
- Monitor chat activity
- Configure moderation rules
- View analytics
- Manage users and channels
- Set up webhooks

## Support

For Stream Chat specific issues, refer to:
- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Chat React Documentation](https://getstream.io/chat/docs/react/)
- [Stream Support](https://getstream.io/support/)

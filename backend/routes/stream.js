const express = require('express');
const { StreamChat } = require('stream-chat');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Stream Chat configuration
const STREAM_API_KEY = process.env.STREAM_API_KEY || 'cm6gt9re6pnp';
const STREAM_SECRET = process.env.STREAM_SECRET || 'fp7npfygectyp8zeu6fhzc5ghbbg5g33sd84x9awcwj87hd69fuv5u5negwnffw9';

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET);

// Generate Stream Chat token for authenticated user
router.post('/token', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const userId = user._id.toString();
    
    console.log(`Generating Stream Chat token for user: ${user.name} (${userId})`);
    
    // Generate token for the user
    const token = serverClient.createToken(userId);
    
    res.json({
      token,
      apiKey: STREAM_API_KEY,
      userId: userId
    });
  } catch (error) {
    console.error('Error generating Stream Chat token:', error);
    res.status(500).json({ 
      message: 'Failed to generate chat token',
      error: error.message 
    });
  }
});

// Get or create channel
router.post('/channel', authenticateToken, async (req, res) => {
  try {
    const { channelType, channelId, members, metadata } = req.body;
    const { user } = req;
    
    // Ensure the current user is in the members list
    const currentUserId = user._id.toString();
    const channelMembers = [...new Set([currentUserId, ...members])];
    
    // Create users in Stream Chat if they don't exist
    for (const memberId of channelMembers) {
      try {
        // Try to get user info from our database
        const User = require('../models/User');
        const memberUser = await User.findById(memberId);
        
        if (memberUser) {
          const userId = memberUser._id.toString();
          console.log(`Creating Stream Chat user for channel: ${memberUser.name} with ID: ${userId}`);
          
          // Upsert user in Stream Chat
          const userData = {
            id: userId,
            name: memberUser.name,
            email: memberUser.email,
            image: memberUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberUser.name)}&background=random`,
            // Add custom fields based on user role
            ...(memberUser.roles?.includes('vendor') && { 
              vendorId: userId,
              isVendor: true,
              userType: 'vendor'
            }),
            ...(memberUser.roles?.includes('ngo') && { 
              ngoId: userId,
              isNGO: true,
              userType: 'ngo'
            }),
            ...(memberUser.roles?.includes('customer') && { 
              customerId: userId,
              isCustomer: true,
              userType: 'customer'
            })
          };
          
          const result = await serverClient.upsertUser(userData);
          console.log(`Stream Chat user created for channel: ${memberUser.name} (${userId})`, result);
        }
      } catch (userError) {
        console.error(`Error creating Stream Chat user ${memberId}:`, userError);
        // Continue with channel creation even if user creation fails
      }
    }
    
    // Create or get channel
    const channel = serverClient.channel(channelType, channelId, {
      members: channelMembers,
      created_by_id: currentUserId,
      ...metadata
    });
    
    // Create the channel if it doesn't exist
    await channel.create(currentUserId);
    
    res.json({
      channelId: channel.id,
      channelType: channel.type,
      members: channelMembers
    });
  } catch (error) {
    console.error('Error creating Stream Chat channel:', error);
    res.status(500).json({ 
      message: 'Failed to create chat channel',
      error: error.message 
    });
  }
});

module.exports = router;

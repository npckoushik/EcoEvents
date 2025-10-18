# EcoEvents Platform

A comprehensive eco-friendly platform connecting Customers, Vendors, and NGOs through location-based matching, product marketplace, and donation system with vendor leaderboard.

## 🌱 Features

### Core User System
- **Three User Types**: Customer, Vendor, NGO with flexible dual roles
- **RBAC Authentication**: JWT-based authentication with role-based access control
- **Location-Based Matching**: GPS coordinates for proximity-based searches
- **Real-time Chat**: Socket.io powered messaging system

### Customer Features
- Search eco-friendly products by location and category
- Find and contact local vendors
- Discover NGOs for personal donations
- View vendor leaderboard for credibility
- Real-time chat with vendors

### Vendor Features
- Manage product listings with images and pricing
- Create donations for NGO pickup
- Track donation completion and earn reputation points
- View performance stats and leaderboard position
- Chat with customers and NGOs

### NGO Features
- Browse available donations from vendors
- Request specific items for pickup
- Track donation history and impact
- View vendor leaderboard for partnership building

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ecoevents/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file with your configuration
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecoevents
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ecoevents/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
ecoevents/
├── backend/
│   ├── models/          # MongoDB schemas (User, Product, Donation)
│   ├── routes/          # API routes (auth, products, donations, users)
│   ├── middleware/      # Authentication and validation middleware
│   ├── server.js        # Main server file with Socket.io
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard and feature pages
│   │   ├── contexts/    # React contexts (Auth, Socket)
│   │   ├── services/    # API service functions
│   │   ├── utils/       # Helper functions
│   │   └── App.js       # Main React app
│   └── package.json
└── uploads/             # Image storage directory
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with role selection
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get products with location filtering
- `POST /api/products` - Create new product (Vendor only)
- `PUT /api/products/:id` - Update product (Owner only)
- `DELETE /api/products/:id` - Delete product (Owner only)
- `POST /api/products/:id/contact` - Get vendor contact info

### Donations
- `GET /api/donations` - Get donations with location filtering
- `POST /api/donations` - Create donation (Vendor only)
- `POST /api/donations/:id/request` - Request donation (NGO only)
- `POST /api/donations/:id/confirm` - Confirm donation (Vendor only)
- `POST /api/donations/:id/complete` - Complete donation (Vendor only)

### Users
- `GET /api/users/vendors/nearby` - Get nearby vendors
- `GET /api/users/ngos/nearby` - Get nearby NGOs
- `GET /api/users/leaderboard` - Get vendor leaderboard
- `GET /api/users/:id/stats` - Get user statistics

## 🎯 Key Features Implementation

### Location-Based Matching
- GPS coordinates captured during signup
- Geospatial MongoDB queries for proximity search
- Distance calculations and radius filtering
- Real-time location updates

### Donation System
- Vendor creates donations with expiry dates
- NGO requests and vendor confirms
- Scoring system: +10 points per completed donation
- Leaderboard rankings and badges

### Real-time Chat
- Socket.io for instant messaging
- User presence indicators
- Typing indicators
- Message history

### Role-Based Access Control
- JWT tokens with embedded roles
- Middleware for route protection
- Flexible role combinations (e.g., Customer + Vendor)

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with geospatial indexing
- **JWT** - Authentication tokens
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Express Validator** - Input validation

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

## 📱 User Journeys

### Customer Journey
1. Sign up with location and role selection
2. Search products by category and distance
3. View vendor details and contact information
4. Chat with vendors for inquiries
5. Make direct purchases (platform facilitates contact only)

### Vendor Journey
1. Sign up and add product listings
2. Receive customer inquiries via chat
3. Create donations for leftover items
4. Confirm NGO requests and complete donations
5. Build reputation through leaderboard scoring

### NGO Journey
1. Sign up and browse available donations
2. Request specific items from vendors
3. Coordinate pickup with confirmed vendors
4. Track donation history and impact
5. Build partnerships with top donor vendors

## 🔒 Security Features

- JWT-based authentication with role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)
- File upload restrictions

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  roles: [String], // ['customer', 'vendor', 'ngo']
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  address: String,
  phone: String,
  donationScore: Number,
  profileImage: String,
  isActive: Boolean
}
```

### Products Collection
```javascript
{
  vendor: ObjectId (ref: User),
  name: String,
  description: String,
  category: String, // ['food', 'attire', 'decor', 'lighting', 'flowers', 'other']
  price: Number,
  images: [String],
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  isAvailable: Boolean,
  ecoFriendly: Boolean
}
```

### Donations Collection
```javascript
{
  vendor: ObjectId (ref: User),
  ngo: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  quantity: String,
  images: [String],
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  expiryDate: Date,
  status: String, // ['available', 'requested', 'confirmed', 'completed', 'expired']
  requestedBy: ObjectId (ref: User),
  pointsAwarded: Number
}
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up file storage for image uploads

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Future Enhancements

- Push notifications for mobile apps
- Advanced search filters
- Payment integration
- Review and rating system
- Analytics dashboard
- Multi-language support
- Mobile app development

---

**EcoEvents** - Connecting communities for a sustainable future! 🌱

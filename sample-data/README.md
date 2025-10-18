# EcoEvents Sample Data

This directory contains sample data for the EcoEvents platform to help with testing and development.

## Files

- `sample-users.json` - Sample user data (vendors, NGOs, customers)
- `sample-products.json` - Sample product data from vendors
- `sample-donations.json` - Sample donation data from vendors
- `upload-sample-data.js` - Script to upload data to MongoDB

## Data Overview

### Users (12 total)
- **5 Vendors**: Eco-friendly event service providers
- **4 NGOs**: Non-profit organizations for donations
- **3 Customers**: Event organizers and individuals

### Products (10 total)
- Various eco-friendly event products
- Categories: decor, attire, flowers, lighting, food, other
- Price range: $3.50 - $45.99

### Donations (10 total)
- Various donation items from vendors
- Different statuses: available, requested, confirmed, completed
- Categories: decor, attire, flowers, lighting, food, other

## Login Credentials

All users have the password: **password123**

### Sample Login Emails:
- **Vendor**: contact@greenevents.com
- **NGO**: contact@hopefoundation.org  
- **Customer**: sarah.johnson@email.com

## Upload Instructions

To upload the sample data to MongoDB:

1. Navigate to the backend directory:
   ```bash
   cd ecoevents/backend
   ```

2. Run the upload script:
   ```bash
   node upload-sample-data.js
   ```

The script will:
- Clear existing data
- Hash passwords
- Upload users, products, and donations
- Create proper relationships between data

## Data Features

### Geographic Distribution
- Users and data are distributed across major US cities
- Includes proper geolocation coordinates for location-based features

### Realistic Data
- Realistic business names and descriptions
- Proper categorization and pricing
- Various donation statuses and timelines
- Contact information and addresses

### Relationships
- Products are linked to vendors
- Donations are linked to vendors and NGOs
- Proper user roles and permissions

## Testing Scenarios

With this sample data, you can test:

1. **Vendor Features**:
   - Product management
   - Donation creation
   - NGO request handling

2. **NGO Features**:
   - Browsing available donations
   - Requesting donations
   - Tracking donation history

3. **Customer Features**:
   - Finding nearby vendors
   - Finding nearby NGOs
   - Viewing leaderboard

4. **Location Features**:
   - Distance calculations
   - Location-based filtering
   - Geospatial queries

## Notes

- All passwords are hashed using bcrypt
- Images are referenced but not included (use placeholder images)
- Dates are realistic and recent
- All data follows the application's schema requirements

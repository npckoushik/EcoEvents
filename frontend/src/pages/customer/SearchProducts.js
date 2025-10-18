import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Star, MessageCircle, Phone, Mail } from 'lucide-react';
import { productsAPI, getLocation, formatDistance, formatPrice } from '../../services/api';
import { getCategoryIcon, getCategoryColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SearchProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [radius, setRadius] = useState(50);
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [contactVisible, setContactVisible] = useState({});

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'attire', label: 'Attire' },
    { value: 'decor', label: 'Decor' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'flowers', label: 'Flowers' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchProducts();
    }
  }, [userLocation, selectedCategory, radius]);

  const getUserLocation = async () => {
    try {
      const location = await getLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Unable to get your location. Please enable location services.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        radius: radius,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      };

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleGetContact = async (productId) => {
    try {
      const response = await productsAPI.getContact(productId);
      setContactVisible(prev => ({
        ...prev,
        [productId]: response.data.vendor
      }));
      toast.success('Contact information retrieved');
    } catch (error) {
      console.error('Error getting contact:', error);
      toast.error('Failed to get contact information');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Products</h1>
        <p className="text-gray-600">Find eco-friendly products from local vendors</p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search products..."
              />
            </div>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius: {radius}km
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Location Info */}
      {userLocation && (
        <div className="mb-6 card">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Searching near your location</p>
              <p className="text-sm text-gray-500">Radius: {radius}km</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="card-hover">
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9 mb-4">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={`http://localhost:5000/uploads/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-gray-400">Image not found</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <span className={`badge ${getCategoryColor(product.category)}`}>
                    {getCategoryIcon(product.category)} {product.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </span>
                  {product._distance && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {formatDistance(product._distance)}
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {product.vendor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.vendor.name}</p>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500 ml-1">
                          {product.vendor.donationScore} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex space-x-2 pt-3">
                  {contactVisible[product._id] ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{contactVisible[product._id].phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{contactVisible[product._id].email}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGetContact(product._id)}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Get Contact</span>
                    </button>
                  )}
                  <button className="btn-outline flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or expanding your search radius.</p>
        </div>
      )}
    </div>
  );
};

export default SearchProducts;

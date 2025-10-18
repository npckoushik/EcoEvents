import React from 'react';
import { MapPin } from 'lucide-react';
import { formatDistance } from '../services/api';

const DistanceDisplay = ({ distance, className = '' }) => {
  if (!distance && distance !== 0) return null;

  return (
    <div className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`}>
      <MapPin className="w-4 h-4" />
      <span>{formatDistance(distance)}</span>
    </div>
  );
};

export default DistanceDisplay;

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Product } from '../types/shop';
import { CartIcon, PlayIcon } from './Icons';

interface Props {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Devotional':
      return '#040725';
    case 'Worship':
      return '#059669';
    case 'Spiritual Growth':
      return '#7C3AED';
    case 'Prophetic':
      return '#DC2626';
    default:
      return '#64748B';
  }
};

const ProductCard: React.FC<Props> = ({ product, onPress, onAddToCart }) => {
  const categoryColor = getCategoryColor(product.category);

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    onAddToCart();
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl overflow-hidden shadow-sm mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={onPress} 
      activeOpacity={0.7}
    >
      {/* Image Container */}
      <View className="relative h-40 bg-slate-100">
        <Image
          source={{ uri: typeof product.image === 'string' ? product.image : '' }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Category Badge */}
        <View 
          className="absolute top-2 left-2 px-2 py-1 rounded"
          style={{ backgroundColor: categoryColor }}
        >
          <Text className="text-[9px] font-semibold text-white uppercase tracking-wide">
            {product.category}
          </Text>
        </View>

        {/* Play Button for Albums */}
        {product.isAlbum && (
          <View className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-black/60 justify-center items-center">
            <PlayIcon size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-[13px] font-bold text-slate-800 leading-[18px] mb-1" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="text-[11px] text-slate-500 mb-2" numberOfLines={1}>
          {product.author}
        </Text>
        
        {/* Languages */}
        <View className="flex-row items-center mb-2.5 flex-wrap">
          <Text className="text-[10px] text-slate-400">
            Languages:{' '}
          </Text>
          {product.languages.map((lang) => (
            <View key={lang} className="bg-slate-100 px-1.5 py-0.5 rounded mr-1">
              <Text className="text-[9px] font-semibold text-slate-500">
                {lang}
              </Text>
            </View>
          ))}
        </View>

        {/* Price and Add Button Row */}
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-red-600">
            {product.currency || '$'} {(product.price || 0).toFixed(2)}
          </Text>
          <TouchableOpacity
            className="flex-row items-center bg-[#040725] px-3 py-1.5 rounded-md gap-1"
            onPress={handleAddToCart}
          >
            <Text className="text-xs font-semibold text-white">
              Add
            </Text>
            <CartIcon size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
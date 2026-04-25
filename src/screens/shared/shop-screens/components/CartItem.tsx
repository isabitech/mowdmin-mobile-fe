import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CartItem as CartItemType } from '../types/shop';
import { CloseIcon, PlusIcon, MinusIcon } from './Icons';

interface Props {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
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

const CartItemComponent: React.FC<Props> = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity, selectedLanguages } = item;
  const categoryColor = getCategoryColor(product.category);

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryBadgeText}>{product.category}</Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <CloseIcon size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.author}>{product.author}</Text>
        
        {/* Language Tags */}
        <View style={styles.languageRow}>
          {selectedLanguages.map((lang) => (
            <View key={lang} style={styles.languageTag}>
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>

        {/* Price and Quantity */}
        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            {product.currency} {product.price}
          </Text>
          
          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(quantity - 1)}
            >
              <MinusIcon size={14} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(quantity + 1)}
            >
              <PlusIcon size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  categoryBadgeText: {
    fontSize: 7,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
  author: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  languageRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  languageTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  languageText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 24,
    textAlign: 'center',
  },
});

export default CartItemComponent;

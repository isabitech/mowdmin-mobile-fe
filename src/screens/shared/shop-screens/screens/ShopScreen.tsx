import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext'; // Adjust path
import productsAPI, { Product } from '../../../../services/productsAPI'; // Adjust path

const PRIMARY = '#040725';
const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
}: {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}) => (
  <TouchableOpacity
    style={{
      width: CARD_WIDTH,
      backgroundColor: '#FFF',
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: CARD_GAP,
      ...Platform.select({
        ios: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10 },
        android: { elevation: 3 },
      }),
    }}
    onPress={onPress}
    activeOpacity={0.85}
  >
    {/* Image */}
    <View style={{ position: 'relative' }}>
      <Image
        source={{ uri: typeof product.image === 'string' ? product.image : '' }}
        style={{ width: '100%', height: CARD_WIDTH * 1.05, backgroundColor: '#F1F5F9' }}
        resizeMode="cover"
      />
      {/* Out of stock overlay */}
      {!product.inStock && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>OUT OF STOCK</Text>
        </View>
      )}
      {/* Category badge */}
      {product.category && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255,255,255,0.92)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: PRIMARY, fontSize: 10, fontWeight: '700' }}>{product.category}</Text>
        </View>
      )}
      {/* Low stock indicator */}
      {product.inStock && product.stock <= 5 && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#FEF2F2',
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: '#EF4444', fontSize: 9, fontWeight: '700' }}>Only {product.stock} left</Text>
        </View>
      )}
    </View>

    {/* Info */}
    <View style={{ padding: 12 }}>
      <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '700', lineHeight: 18 }} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 11, marginTop: 4, lineHeight: 16 }} numberOfLines={1}>
        {product.description}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '800' }}>
          ${(product.price || 0).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            backgroundColor: product.inStock ? PRIMARY : 'rgba(4,7,37,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={product.inStock ? onAddToCart : undefined}
          disabled={!product.inStock}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color={product.inStock ? '#FFF' : 'rgba(4,7,37,0.3)'} />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Shop Screen ──────────────────────────────────────────────────────────────

interface Props {
  showBanner?: boolean;
  navigation: any;
}

const ShopScreen: React.FC<Props> = ({ showBanner = true, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { totalItems, addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('[ShopScreen] fetchProducts error:', err);
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // Extract unique categories from real data
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !(product.name || '').toLowerCase().includes(q) &&
          !(product.description || '').toLowerCase().includes(q) &&
          !(product.category || '').toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
      return true;
    });
  }, [searchQuery, selectedCategory, products]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, ['EN']);
  };

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs' as never)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: 'rgba(4,7,37,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>Shop</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: 'rgba(4,7,37,0.5)', marginTop: 16, fontSize: 14 }}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs' as never)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: 'rgba(4,7,37,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '800', marginLeft: 14 }}>Shop</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: 'rgba(239,68,68,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="bag-handle-outline" size={30} color="#EF4444" />
          </View>
          <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
            Unable to Load Products
          </Text>
          <Text style={{ color: 'rgba(4,7,37,0.5)', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: PRIMARY,
              borderRadius: 14,
              paddingHorizontal: 24,
              paddingVertical: 13,
              marginTop: 20,
            }}
            onPress={() => {
              setLoading(true);
              fetchProducts();
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs' as never)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: 'rgba(4,7,37,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <View style={{ marginLeft: 14 }}>
            <Text style={{ color: PRIMARY, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 }}>Shop</Text>
            <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, marginTop: 2, fontWeight: '500' }}>
              {products.length} products available
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ position: 'relative', padding: 8 }}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: PRIMARY,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="bag-handle" size={20} color="#FFF" />
          </View>
          {totalItems > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: '#EF4444',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 5,
                borderWidth: 2,
                borderColor: '#F8F9FC',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
        }
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 12 : 4,
              flexDirection: 'row',
              alignItems: 'center',
              ...Platform.select({
                ios: {
                  shadowColor: PRIMARY,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            }}
          >
            <Ionicons name="search" size={18} color="rgba(4,7,37,0.35)" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products..."
              placeholderTextColor="rgba(4,7,37,0.35)"
              style={{
                flex: 1,
                marginLeft: 10,
                color: PRIMARY,
                fontSize: 14,
                fontWeight: '500',
                paddingVertical: Platform.OS === 'ios' ? 0 : 8,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="rgba(4,7,37,0.3)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 18 }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = cat === 'All' ? products.length : products.filter((p) => p.category === cat).length;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: isActive ? PRIMARY : '#FFF',
                  borderWidth: 1,
                  borderColor: isActive ? PRIMARY : 'rgba(4,7,37,0.08)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isActive ? '#FFF' : 'rgba(4,7,37,0.55)',
                  }}
                >
                  {cat}
                </Text>
                <View
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(4,7,37,0.06)',
                    borderRadius: 8,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(4,7,37,0.35)',
                    }}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results count */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: 'rgba(4,7,37,0.4)', fontSize: 12, fontWeight: '600' }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </Text>
        </View>

        {/* Products Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredProducts.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: CARD_GAP,
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 56 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 22,
                  backgroundColor: 'rgba(4,7,37,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="search-outline" size={28} color="rgba(4,7,37,0.25)" />
              </View>
              <Text style={{ color: PRIMARY, fontSize: 16, fontWeight: '700' }}>No Products Found</Text>
              <Text
                style={{
                  color: 'rgba(4,7,37,0.45)',
                  fontSize: 13,
                  marginTop: 6,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}
              >
                Try adjusting your filters or search query
              </Text>
              {(searchQuery || selectedCategory !== 'All') && (
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: 'rgba(4,7,37,0.06)',
                  }}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: '600' }}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShopScreen;
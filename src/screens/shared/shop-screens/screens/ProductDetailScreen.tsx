import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ShopStackParamList } from '../../../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import productsAPI, { Product } from '../../../../services/productsAPI';

type ProductDetailScreenRouteProp = RouteProp<ShopStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const PRIMARY = '#040725';

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setError(null);
        const data = await productsAPI.getProductById(productId);
        setProduct(data);
      } catch (err: any) {
        console.error('[ProductDetail] fetch error:', err.message);
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleOrderNow = async () => {
    if (!product?.stripeLink) {
      Alert.alert('Unavailable', 'No payment link available for this product.');
      return;
    }

    Toast.show({
      type: 'info',
      text1: 'Redirecting to Payment',
      text2: 'You can complete this order in your browser',
      position: 'top',
      visibilityTime: 3000,
    });

    setTimeout(async () => {
      try {
        const supported = await Linking.canOpenURL(product.stripeLink!);
        if (supported) {
          await Linking.openURL(product.stripeLink!);
          return;
        }

        Alert.alert('Error', 'Unable to open payment link.');
      } catch (linkError) {
        console.error('[ProductDetail] order redirect error:', linkError);
        Alert.alert('Error', 'Unable to open payment link.');
      }
    }, 1000);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text className="text-gray-500 mt-4">Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error / Not Found state
  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center px-10">
          <Ionicons name="bag-handle-outline" size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-slate-600 mt-4">
            {error || 'Product Not Found'}
          </Text>
          <TouchableOpacity
            className="mt-6 px-6 py-3 rounded-xl"
            style={{ backgroundColor: PRIMARY }}
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View
          className="bg-slate-100 relative"
          style={{ width: width, height: width * 0.8 }}
        >
          <Image
            source={{ uri: product.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="disk"
            transition={200}
          />
          {/* Category Badge */}
          {product.category && (
            <View
              className="absolute top-4 left-4 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: PRIMARY }}
            >
              <Text className="text-[11px] font-bold text-white uppercase tracking-wider">
                {product.category}
              </Text>
            </View>
          )}
          {/* Stock Badge */}
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
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                OUT OF STOCK
              </Text>
            </View>
          )}
          {product.inStock && product.stock <= 5 && (
            <View className="absolute top-4 right-4 bg-red-50 px-2.5 py-1 rounded-lg">
              <Text className="text-red-500 text-xs font-bold">
                Only {product.stock} left
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-5">
          <Text className="text-[22px] font-bold text-slate-800 leading-7">
            {product.name}
          </Text>

          <View className="flex-row items-center mt-3">
            <Text className="text-2xl font-bold text-red-600">
              ${product.price.toFixed(2)}
            </Text>
            {product.inStock && (
              <View className="ml-3 flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-emerald-600 text-xs font-semibold">
                  In Stock ({product.stock})
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product.description ? (
            <View className="mt-5 pt-5 border-t border-slate-100">
              <Text className="text-base font-semibold text-slate-800 mb-2">
                Description
              </Text>
              <Text className="text-sm text-slate-500 leading-[22px]">
                {product.description}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="p-4 pb-6 border-t border-slate-100">
        {/* Add-to-cart is intentionally hidden while product checkout happens in the browser. */}
        <TouchableOpacity
          className="items-center justify-center py-3.5 rounded-xl"
          style={{
            backgroundColor: product.inStock && product.stripeLink ? PRIMARY : '#CBD5E1',
          }}
          onPress={handleOrderNow}
          disabled={!product.inStock || !product.stripeLink}
        >
          <Text className="text-[15px] font-semibold text-white">
            {product.stripeLink ? 'Order Now' : 'Order Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

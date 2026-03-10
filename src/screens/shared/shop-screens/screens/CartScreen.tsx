import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeftIcon, EmptyCartIcon } from '../components/Icons';
import CartItemComponent from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ordersAPI } from '../../../../services/ordersAPI';

interface Props {
  navigation: any;
}

const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [ordering, setOrdering] = useState(false);

  const isEmpty = items.length === 0;

  const handleOrderNow = async () => {
    if (ordering || isEmpty) return;

    try {
      setOrdering(true);
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.title || item.product.name,
        price: item.product.price,
      }));

      const order = await ordersAPI.createOrder(orderItems, totalPrice);

      Alert.alert(
        'Order Placed',
        `Your order #${order._id.slice(-6).toUpperCase()} has been created successfully. Total: € ${totalPrice.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('ShopHome');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.message || 'Failed to place your order. Please try again.'
      );
    } finally {
      setOrdering(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-1 mr-2"
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftIcon size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-slate-800">
              Cart
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              Estimated{' '}
              <Text className={`font-semibold ${
                totalPrice > 0 ? 'text-red-600' : 'text-slate-400'
              }`}>
                € {totalPrice.toFixed(2)}
              </Text>
            </Text>
          </View>
        </View>

        <Text className="text-sm text-slate-500 font-medium">
          {totalItems} items
        </Text>
      </View>

      {isEmpty ? (
        /* Empty State */
        <View className="flex-1 justify-center items-center px-10">
          <EmptyCartIcon size={140} />
          <Text className="text-xl font-bold text-slate-600 mt-6">
            Your cart is empty
          </Text>
          <Text className="text-sm text-slate-400 text-center mt-2 leading-5">
            Browse our collection of inspirational books and worship albums
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#040725] px-8 py-3.5 rounded-xl"
            onPress={() => navigation.navigate('ShopHome')}
          >
            <Text className="text-[15px] font-semibold text-white">
              Browse Shop
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Cart Items */
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          >
            {items.map((item) => (
              <CartItemComponent
                key={item.product.id}
                item={item}
                onUpdateQuantity={(quantity) => updateQuantity(item.product.id, quantity)}
                onRemove={() => removeFromCart(item.product.id)}
              />
            ))}

            {/* Clear Cart Button */}
            <TouchableOpacity
              className="items-center py-3 mt-2"
              onPress={clearCart}
            >
              <Text className="text-sm text-red-600 font-medium">
                Clear Cart
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Order Button */}
          <View className="bg-white p-4 pb-6 border-t border-slate-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base text-slate-500">
                Total
              </Text>
              <Text className="text-[22px] font-bold text-slate-800">
                € {totalPrice.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-[#040725] py-4 rounded-xl items-center"
              onPress={handleOrderNow}
              disabled={ordering}
              style={{ opacity: ordering ? 0.7 : 1 }}
            >
              {ordering ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-base font-semibold text-white ml-2">
                    Placing Order...
                  </Text>
                </View>
              ) : (
                <Text className="text-base font-semibold text-white">
                  Order Now
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

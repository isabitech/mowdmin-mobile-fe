import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShopScreen from '../screens/shared/shop-screens/screens/ShopScreen';
import ProductDetailScreen from '../screens/shared/shop-screens/screens/ProductDetailScreen';
import CartScreen from '../screens/shared/shop-screens/screens/CartScreen';
import { CartProvider } from '../screens/shared/shop-screens/context/CartContext';
import { ShopStackParamList } from './types';

const ShopStack = createNativeStackNavigator<ShopStackParamList>();

export default function ShopNavigator() {
  return (
    <CartProvider>
      <ShopStack.Navigator screenOptions={{ headerShown: false }}>
        <ShopStack.Screen name="ShopHome" component={ShopScreen} />
        <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <ShopStack.Screen name="Cart" component={CartScreen} />
      </ShopStack.Navigator>
    </CartProvider>
  );
}

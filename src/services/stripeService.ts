import { Alert } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { donationsAPI } from './donationsApi';
import { ordersAPI } from './ordersAPI';

/**
 * Handle Stripe payment for a donation.
 * 1. Creates a PaymentIntent on the backend
 * 2. Presents the Stripe Payment Sheet
 * 3. Returns true if payment succeeded
 */
export const payForDonation = async (donationId: string): Promise<boolean> => {
  try {
    const { clientSecret } = await donationsAPI.payDonation(donationId);

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Mowdministries',
      style: 'automatic',
    });

    if (initError) {
      Alert.alert('Payment Error', initError.message);
      return false;
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code === 'Canceled') {
        // User dismissed the sheet — not an error
        return false;
      }
      Alert.alert('Payment Failed', presentError.message);
      return false;
    }

    return true;
  } catch (error: any) {
    Alert.alert('Payment Error', error.response?.data?.message || error.message || 'Something went wrong.');
    return false;
  }
};

/**
 * Handle Stripe payment for an order.
 * 1. Creates a PaymentIntent on the backend
 * 2. Presents the Stripe Payment Sheet
 * 3. Returns true if payment succeeded
 */
export const payForOrder = async (orderId: string): Promise<boolean> => {
  try {
    const { clientSecret } = await ordersAPI.payOrder(orderId);

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Mowdministries',
      style: 'automatic',
    });

    if (initError) {
      Alert.alert('Payment Error', initError.message);
      return false;
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code === 'Canceled') {
        return false;
      }
      Alert.alert('Payment Failed', presentError.message);
      return false;
    }

    return true;
  } catch (error: any) {
    Alert.alert('Payment Error', error.response?.data?.message || error.message || 'Something went wrong.');
    return false;
  }
};

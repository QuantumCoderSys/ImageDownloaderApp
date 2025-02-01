import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentScreen = () => {
  const [cardDetails, setCardDetails] = useState(null);
  const { confirmPayment } = useStripe();
  const buttonScale = new Animated.Value(1); // For button press animation

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details.');
      return;
    }

    try {
      // Replace with your backend endpoint to create a PaymentIntent
      const response = await fetch('https://your-backend.com/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 1000 }), // Amount in cents (e.g., $10.00)
      });
      const { clientSecret } = await response.json();

      // Confirm the payment with Stripe
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            email: 'user@example.com', // Replace with user's email
          },
        },
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        Alert.alert('Payment Successful', 'Your payment was successful!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An error occurred during payment.');
    }
  };

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={['#6A11CB', '#2575FC']}
          style={styles.gradientBackground}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Payment Details</Text>
            <Text style={styles.subtitle}>Enter your card information to complete the payment</Text>

            <CardField
              postalCodeEnabled={false}
              placeholder={{
                number: '4242 4242 4242 4242', // Test card number
              }}
              cardStyle={styles.card}
              style={styles.cardField}
              onCardChange={(details) => setCardDetails(details)}
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => {
                  animateButton();
                  handlePayment();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6A11CB',
  },
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: 30,
  },
  payButton: {
    backgroundColor: '#6A11CB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#6A11CB',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const PaymentPage = ({ amount, onPaymentSuccess, onPaymentFailure }) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Handle Create Order
  const createOrder = async () => {
    setLoading(true);
    console.log('Creating order...');

    try {
      const response = await axios.post('http://192.168.1.64:3001/create-order', { amount });

      console.log('Server response:', response);
      if (response.data && response.data.id) {
        setOrderData(response.data); // Set order data for the payment process
      } else {
        onPaymentFailure('No order ID returned');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      onPaymentFailure(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Payment Modal (WebView)
  const PaymentForm = () => {
    if (!orderData) return null;

    const { id, amount } = orderData;

    const options = {
      key: 'rzp_test_ZXboSxLw4dpEfH',  // Replace with your Razorpay key
      amount: amount * 100,  // Convert amount to paise
      currency: 'INR',
      order_id: id,
      handler: function (response) {
        console.log('Payment Success:', response);
        onPaymentSuccess(response);  // Handle successful payment
      },
      prefill: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#F37254'
      }
    };

    const razorpayScript = `
      var options = ${JSON.stringify(options)};
      var rzp1 = new Razorpay(options);
      rzp1.open();
    `;

    return (
      <WebView
        originWhitelist={['*']}
        javaScriptEnabled={true}
        injectedJavaScript={razorpayScript}
        onMessage={(event) => {
          const response = event.nativeEvent.data;
          if (response.status === 'success') {
            onPaymentSuccess(response);
          } else {
            onPaymentFailure('Payment failed');
          }
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {orderData ? (
        <PaymentForm />  // Display Razorpay modal once order is created
      ) : (
        <Button
          title={loading ? 'Creating Order...' : 'Create Order'}
          onPress={createOrder}
          disabled={loading}
        />
      )}

      <Text style={styles.status}>Order status: {loading ? 'Loading...' : 'Idle'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  status: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default PaymentPage;
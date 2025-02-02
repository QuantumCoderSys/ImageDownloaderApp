import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import PaymentPage from './PaymentPage';

const PaymentScreen = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePaymentSuccess = (data) => {
    setPaymentStatus('Payment Successful');
  };

  const handlePaymentFailure = (error) => {
    setPaymentStatus('Payment Failed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.paymentStatusText}>Payment Status:</Text>
        <Text style={styles.paymentStatus}>{paymentStatus}</Text>
      </View>

      <View style={styles.paymentContainer}>
        <PaymentPage
          amount={1000} // For example, 1000 INR
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  paymentStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatus: {
    fontSize: 20,
    color: '#4CAF50', // Green color for success
    marginTop: 5,
    fontWeight: '500',
  },
  paymentContainer: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default PaymentScreen;
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';  // Make sure this is correctly configured

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for existing user session on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate('MainScreen'); // Navigate directly to MainScreen if logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener when the component unmounts
  }, [navigation]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainScreen'); // Navigate to MainScreen on successful login
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : (
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Login
        </Button>
      )}
      <Button mode="text" onPress={() => navigation.navigate('SignupScreen')} style={styles.textButton}>
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "#EFEFD0",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#EFEFD0",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#201a23", // Set button color to #201a23
  },
  textButton: {
    marginTop: 10,
    borderColor: '#2374AB', // Set the border color when focused to #2374AB
  },
  inputFocused: {
    borderWidth: 2, // Add border width to make it noticeable
  },
});
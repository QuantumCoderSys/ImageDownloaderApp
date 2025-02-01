import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Button, View, TouchableOpacity, Text } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import MainScreen from './screens/MainScreen';
import PaymentScreen from './components/PaymentScreen';
import DownloadsScreen from './components/DownloadsScreen';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJp4jK1s-oRzONIQxP3X7L7f9SyA7HcVk",
  authDomain: "scrollerapp-73cbc.firebaseapp.com",
  projectId: "scrollerapp-73cbc",
  storageBucket: "scrollerapp-73cbc.appspot.com",
  appId: "1:255017727911:ios:af799ff04e80cc67f7a882",
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is logged in by checking the auth state
  useEffect(() => {
    const checkUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser)); // If user data is found, set the user
        }
      } catch (error) {
        console.error("Error checking saved user", error);
      } finally {
        setLoading(false); // Stop loading once user state is set
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    // Listen to auth state change (Firebase auth)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // User is logged in
        AsyncStorage.setItem('user', JSON.stringify(currentUser)); // Save user data
      } else {
        setUser(null); // User is logged out
        AsyncStorage.removeItem('user'); // Remove user data from AsyncStorage
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Logout function
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null); // Reset user state
        AsyncStorage.removeItem('user'); // Remove user data from AsyncStorage
      })
      .catch((error) => {
        console.error("Error logging out", error);
      });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            {/* Main Screen when the user is logged in */}
              <Stack.Screen
                name="MainScreen"
                component={(props) => <MainScreen {...props} handleLogout={handleLogout} />}
                options={{
                  headerShown: false,
                }}
              />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="DownloadsScreen" component={DownloadsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Platform, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store'; // Import Secure Store

const { width, height } = Dimensions.get('window');

// Google Drive API Key (replace with your own)
const API_KEY = 'AIzaSyA1ipJPw_gNzi-NSVpzLxkwHhenxjz2KeI';

// Google Drive Folder IDs (replace with your own)
const PROGRAM_IMAGES_FOLDER_ID = '1ebIq_AcbPzgvotBOSNm92sUTjqLSY7UG';
const ADVERTS_FOLDER_ID = '1pkdv_Ga_HuGpf3WMjOIsa7P5I9Z0cqzq';

const MainScreen = ({ handleLogout }) => {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [adInterval, setAdInterval] = useState(Math.floor(Math.random() * 3) + 1); // Random interval between 1 to 3
  const [showTopBar, setShowTopBar] = useState(false);
  
  // New state for checking user login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const imagesRef = useRef(images); // Ref to track the latest images state
  const topBarAnim = useRef(new Animated.Value(0)).current; // Animated value for the top bar

  // Fetch images from Google Drive folder
  const fetchImages = async (folderId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}`
      );
      const data = await response.json();
      const files = data.files.map((file) => `https://drive.google.com/uc?export=view&id=${file.id}`);
      return files;
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  };

  // Check if the user is logged in (using SecureStore)
  const checkLoginStatus = async () => {
    const userToken = await SecureStore.getItemAsync('userToken'); // Retrieve token
    if (userToken) {
      setIsLoggedIn(true);  // User is logged in
    }
  };

  // Load images and adverts on component mount
  useEffect(() => {
    checkLoginStatus(); // Check if user is logged in when the component mounts

    const loadData = async () => {
      const programImages = await fetchImages(PROGRAM_IMAGES_FOLDER_ID);
      const adverts = await fetchImages(ADVERTS_FOLDER_ID);

      // Randomize the order of images
      const shuffledImages = shuffleArray(programImages);
      setImages(shuffledImages);
      setAdverts(adverts);
      setLoading(false);

      // Start auto-refresh every 10 seconds
      const interval = setInterval(async () => {
        const newImages = await fetchImages(PROGRAM_IMAGES_FOLDER_ID);
        const newUniqueImages = newImages.filter((url) => !imagesRef.current.includes(url));
        if (newUniqueImages.length > 0) {
          setImages((prevImages) => [...prevImages, ...newUniqueImages]);
        }
      }, 10000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    };

    loadData();
  }, []);

  // Update the ref whenever images change
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Handle tap on the screen to show the top bar
  const handleTap = () => {
    setShowTopBar(true);
    
    // Easing in (showing)
    Animated.timing(topBarAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,  // Easing in (fast at first, then slow down)
      useNativeDriver: true,
    }).start();
  
    // Hide the top bar after 10 seconds with ease out
    setTimeout(() => {
      Animated.timing(topBarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,  // Easing out (start slow, then fast)
        useNativeDriver: true,
      }).start();
  
      setShowTopBar(false);
    }, 10000);
  };

  // Save image to Photos app
  const saveImageToPhotos = async (url) => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      alert('This feature is only available on mobile devices.');
      return;
    }

    // Check for permissions
    if (!permissionResponse || !permissionResponse.granted) {
      await requestPermission();
      if (!permissionResponse.granted) {
        alert('Permission to access media library is required to save images.');
        return;
      }
    }

    // Download the image
    const downloadDest = `${FileSystem.documentDirectory}${Date.now()}.jpg`;
    try {
      const { uri } = await FileSystem.downloadAsync(url, downloadDest);

      // Save to Photos app
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Downloaded Images', asset, false);
      alert('Image saved to Photos app!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    }
  };

  // Render advertisement or image
  const renderItem = ({ item, index }) => {
    if (index !== 0 && index % adInterval === 0 && adverts.length > 0) {
      const advertIndex = Math.floor(Math.random() * adverts.length);

      return (
        <View style={styles.adContainer}>
          <Image source={{ uri: adverts[advertIndex] }} style={styles.adImage} />
          <Text style={styles.adText}>Check out this amazing product!</Text>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => navigation.navigate('Payment')}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.downloadButton} onPress={() => saveImageToPhotos(item)}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading images...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onTouchStart={handleTap}>
      {/* Animated Top Bar */}
      {showTopBar && (
        <Animated.View
          style={[
            styles.topBar,
            {
              opacity: topBarAnim,
              transform: [
                {
                  translateY: topBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0], // Slide down the top bar with smooth transition
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.topBarContent}>
            <TouchableOpacity style={styles.leftButton} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rightButton} onPress={() => navigation.navigate('DownloadsScreen')}>
              <Text style={styles.buttonText}>Downloads</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,  // Increased height for better spacing
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensures it appears above other components
    elevation: 10, // For Android
    paddingTop: Platform.OS === 'ios' ? 40 : 0, // Adjust for notch on iOS, more padding for better fit
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  leftButton: {
    paddingVertical: 10,
    paddingLeft: 10,  // Ensure the left button is not too close to the edge
  },
  rightButton: {
    paddingVertical: 10,
    paddingRight: 10,  // Ensure the right button is not too close to the edge
  },
  buttonText: {
    color: '#201A23',
    fontWeight: "500",
    fontSize: 18,
  },
  imageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor:"#EFEFD0",
    padding: 10,
    borderRadius: 5,
  },
  adContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFD0',
  },
  adImage: {
    width: '100%',
    height: '30%',
  },
  adText: {
    margin: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#5FE78E',
    padding: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainScreen;
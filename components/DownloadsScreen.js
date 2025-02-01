import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DownloadScreen = () => {
  const [downloadedImages, setDownloadedImages] = useState([]);

  // Load saved images from AsyncStorage on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const savedImages = await AsyncStorage.getItem('downloadedImages');
        if (savedImages) {
          setDownloadedImages(JSON.parse(savedImages));
        }
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, []);

  const saveImageToPhotos = async (url) => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      Alert.alert('Error', 'This feature is only available on mobile devices.');
      return;
    }

    const permissionResponse = await MediaLibrary.requestPermissionsAsync();
    if (!permissionResponse.granted) {
      Alert.alert('Permission Denied', 'Permission to access media library is required.');
      return;
    }

    try {
      // Download image to a persistent location
      const filename = `${Date.now()}.jpg`;
      const downloadDest = FileSystem.documentDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(url, downloadDest);

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Downloaded Images', asset, false);

      // Save to AsyncStorage with a persistent URI
      const dateSaved = new Date().toLocaleDateString();
      const newImageData = { url: uri, dateSaved };

      const updatedImages = [...downloadedImages, newImageData];
      await AsyncStorage.setItem('downloadedImages', JSON.stringify(updatedImages));

      setDownloadedImages(updatedImages);

      Alert.alert('Success', 'Image saved!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.url }} style={styles.imagePreview} />
      <View style={styles.cardContent}>
        <Text style={styles.dateText}>{item.dateSaved}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={downloadedImages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  imagePreview: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  cardContent: {
    justifyContent: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DownloadScreen;
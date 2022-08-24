import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

let apiKey = 'AIzaSyCw0XA9ujDbO0RwJAIVC4pelY7edS9xltQ';

export default function App() {

  let cameraRef = useRef();
  const [CameraPermission, setCameraPermission] = useState();
  const [MediaLPermission, setMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setCameraPermission(cameraPermission.status === "granted");
      setMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (CameraPermission === undefined) {
    return <Text>Allow permission to gain access to the Camera.</Text>
  } else if (!CameraPermission) {
    return <Text>Ypu didn't allow permission to gain camera access. Please change this in settings.</Text>
  }

  let takePic = async () => {
    let options = {
      quality: 1, base64: true, exif: false
    };
    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);

    let { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
    }

    Location.setGoogleApiKey(apiKey);

    console.log(status);

    let { coords } = await Location.getCurrentPositionAsync();

    setLocation(coords);

    console.log(coords);

    if (coords) {
      let { longitude, latitude } = coords;

      let regionName = await Location.reverseGeocodeAsync({
        longitude,
        latitude,
      });
      setAddress(regionName[0]);
      console.log(regionName, 'nothing');
    }
  };


  if (photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Text style={styles.big}>
          {!location
            ? 'Waiting'
            : `${JSON.stringify(address?.['subregion'])}
            ${JSON.stringify(address?.['city'])}
             ${JSON.stringify(address?.['district'])}`
          }
        </Text>

        {MediaLPermission ?
          <TouchableOpacity title="Save" onPress={savePhoto} color='green'>
            <AntDesign name="save" size={35} color="black" />
          </TouchableOpacity>
          : undefined}

        <TouchableOpacity title="Share" onPress={sharePic} color='gray' >
          <Entypo name="share" size={35} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity title="Discard" onPress={() => setPhoto(undefined)} color='red'>
          <MaterialIcons name="cancel" size={35} color="black" />
        </TouchableOpacity>
      
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.container} ref={cameraRef}>
      <View style={styles.btncontainer}>
        <TouchableOpacity title="Take Pic" onPress={takePic} >
          <AntDesign name="camera" size={150} color="black" />
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  btncontainer: {
    alignSelf: 'center',
    alignItems: "center",
    padding: 10,
    top: 220,
  },
  preview: {
    flex: 1,
    alignSelf: 'stretch',
  }
});

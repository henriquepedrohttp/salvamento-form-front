import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location'; 

const API_URL = 'http://192.168.0.102:3000'; 

export default function MapScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar a localização para centralizar o mapa.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } catch (error) {
      console.log('Erro ao pegar localização atual:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/occurrences`);
      const data = await res.json();
      
      setOccurrences(data);

      const occurrencesWithCoords = data.filter(occ => occ.latitude && occ.longitude);

      if (occurrencesWithCoords.length > 0) {
        const avgLat = occurrencesWithCoords.reduce((sum, p) => sum + Number(p.latitude), 0) / occurrencesWithCoords.length;
        const avgLng = occurrencesWithCoords.reduce((sum, p) => sum + Number(p.longitude), 0) / occurrencesWithCoords.length;

        setRegion({
          latitude: avgLat,
          longitude: avgLng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      } else {
        
        const userRegion = await getUserLocation();
        
        if (userRegion) {
          setRegion(userRegion);
        }
      }
    } catch (error) {
      console.error('Erro mapa:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <MapView 
        style={styles.map} 
        region={region} 
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {occurrences
          .filter(occ => occ.latitude && occ.longitude)
          .map((occ, index) => (
            <Marker
              key={occ._id || index}
              coordinate={{
                latitude: Number(occ.latitude),
                longitude: Number(occ.longitude),
              }}
              title={`Ocorrência: ${occ.codigoOcorrencia || 'N/A'}`}
              description={`Tipo: ${occ.tipoSalvamento || occ.grupo}`}
              pinColor={occ.houveMergulho ? "blue" : "red"}
            />
          ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
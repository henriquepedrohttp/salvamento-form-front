import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const API_URL = 'http://192.168.0.102:3000';

export default function MapScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/occurrences`);
      const data = await res.json();
      setOccurrences(data);

      // Filtra ocorrências com coordenadas válidas
      const occurrencesWithCoords = data.filter(occ => 
        occ.latitude && occ.longitude
      );

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
        // Coordenadas de referência para Pernambuco
        setRegion({
          latitude: -8.0476,
          longitude: -34.8770,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      // Coordenadas padrão para Pernambuco em caso de erro
      setRegion({
        latitude: -8.0476,
        longitude: -34.8770,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
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
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={region}
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
              description={`Grupo: ${occ.grupo || 'N/A'} - Vítimas: ${occ.numeroVitimas || 0}`}
              pinColor="red"
            />
          ))}
      </MapView>
    </View>
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
import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { FAB, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';

const API_URL = 'http://192.168.0.102:3000';

export default function HomeScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/occurrences`);
      if (!res.ok) throw new Error('Erro na rede');
      const data = await res.json();
      setOccurrences(data);
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
      Alert.alert('Erro', 'Não foi possível carregar as ocorrências');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, []);

  const formatEventos = (eventos) => {
    return eventos && eventos.length > 0 ? eventos.join(', ') : 'Nenhum evento';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Ocorrência: {item.codigoOcorrencia || 'N/A'}</Title>
              <Paragraph>Grupo: {item.grupo || 'N/A'}</Paragraph>
              <Paragraph>Vítimas: {item.numeroVitimas || 0}</Paragraph>
              <Paragraph>Eventos: {formatEventos(item.eventos)}</Paragraph>
              {item.localMergulho && (
                <Paragraph>Local Mergulho: {item.localMergulho}</Paragraph>
              )}
              {item.latitude && item.longitude && (
                <Paragraph>
                  Localização: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Paragraph>
              )}
            </Card.Content>
            {item.photo && (
              <Card.Cover 
                source={{ uri: `${API_URL}/${item.photo}` }} 
                style={styles.image} 
              />
            )}
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Paragraph>Nenhuma ocorrência cadastrada</Paragraph>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('FormStep1')}
              style={{ marginTop: 20 }}
            >
              Cadastrar Primeira Ocorrência
            </Button>
          </View>
        }
      />
      <FAB 
        icon="plus" 
        style={styles.fab} 
        onPress={() => navigation.navigate('FormStep1')} 
      />
      <FAB 
        icon="map" 
        style={styles.mapButton} 
        onPress={() => navigation.navigate('Mapa')} 
      />
    </View>
  );
}
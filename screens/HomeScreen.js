import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, Button, Searchbar, IconButton } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/styles';

const API_URL = 'http://192.168.0.102:3000'; 

export default function HomeScreen() {
  const [occurrences, setOccurrences] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  
  const fetchData = async (query = '') => {
    try {
      const url = query 
        ? `${API_URL}/occurrences?search=${encodeURIComponent(query)}` 
        : `${API_URL}/occurrences`;
        
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro na rede');
      const data = await res.json();
      setOccurrences(data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(searchQuery);
    }, [searchQuery])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(searchQuery);
  };

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    fetchData(query);
  };

  // Lógica de Delete
  const handleDelete = (id) => {
    Alert.alert(
      "Excluir",
      "Tem certeza que deseja apagar esta ocorrência?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${API_URL}/occurrences/${id}`, { method: 'DELETE' });
              fetchData(searchQuery);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          }
        }
      ]
    );
  };

  //edit
  const handleEdit = (item) => {
    navigation.navigate('FormStep1', { occurrenceToEdit: item });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
      <View style={styles.container}>
        
        <Searchbar
          placeholder="Pesquisar por código..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={{ margin: 10, backgroundColor: 'white' }}
        />

        <FlatList
          data={occurrences}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Title>{item.codigoOcorrencia}</Title>
                    <View style={{flexDirection: 'row'}}>
                        <IconButton icon="pencil" size={20} onPress={() => handleEdit(item)} />
                        <IconButton icon="delete" iconColor="red" size={20} onPress={() => handleDelete(item._id)} />
                    </View>
                </View>
                <Paragraph>Grupo: {item.grupo}</Paragraph>
                <Paragraph>Tipo: {item.tipoSalvamento}</Paragraph>
              </Card.Content>
              {item.photo && (
                <Card.Cover source={{ uri: `${API_URL}/${item.photo.replace(/\\/g, '/')}` }} />
              )}
            </Card>
          )}
        />
        
        <FAB icon="plus" style={[styles.fab, { position: 'absolute', right: 20, bottom: 20 + insets.bottom }]} onPress={() => navigation.navigate('FormStep1')} />
        <FAB icon="map" small={false} style={[styles.mapButton, { position: 'absolute', right: 20, bottom: 100 + insets.bottom }]} onPress={() => navigation.navigate('Mapa')} />
      </View>
    </SafeAreaView>
  );
}
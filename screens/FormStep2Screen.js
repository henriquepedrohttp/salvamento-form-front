import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, Alert, Platform } from 'react-native';
import { TextInput, Button, RadioButton, Text, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/styles';

const API_URL = 'http://192.168.0.102:3000';

export default function FormStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { formStep1 } = route.params;

  const [formData, setFormData] = useState({
    localMergulho: '',
    visibilidadeAgua: '',
    ambiente: '',
    tipoFundo: '',
    correnteza: false,
    coordenadasLat: '',
    coordenadasLong: '',
    numeroMergulhadores: ''
  });

  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const locaisMergulho = [
    'Rio',
    'Lago',
    'Mar',
    'Piscina',
    'Represa',
    'Outro'
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        setFormData(prev => ({
          ...prev,
          coordenadasLat: loc.coords.latitude.toString(),
          coordenadasLong: loc.coords.longitude.toString()
        }));
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permissão para acessar a câmera é necessária!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.localMergulho) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de localidade.');
      return;
    }

    const occurrenceData = {
      ...formStep1,
      ...formData,
      numeroVitimas: formStep1.numeroVitimas ? parseInt(formStep1.numeroVitimas) : 0,
      numeroMergulhadores: formData.numeroMergulhadores ? parseInt(formData.numeroMergulhadores) : 0,
      coordenadasLat: formData.coordenadasLat ? parseFloat(formData.coordenadasLat) : null,
      coordenadasLong: formData.coordenadasLong ? parseFloat(formData.coordenadasLong) : null
    };

    const submitData = new FormData();
    submitData.append('data', JSON.stringify(occurrenceData));

    if (image) {
      const localUri = image.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      submitData.append('photo', {
        uri: localUri,
        name: filename,
        type
      });
    }

    if (location) {
      submitData.append('latitude', location.latitude.toString());
      submitData.append('longitude', location.longitude.toString());
    }

    try {
      const response = await fetch(`${API_URL}/occurrences`, {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Ocorrência cadastrada com sucesso!');
        navigation.navigate('Home');
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', 'Erro ao salvar ocorrência: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Operações de Mergulho</Text>

      <Text style={styles.label}>Local de mergulho *</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.input}
          >
            {formData.localMergulho || 'Selecione o local'}
          </Button>
        }
      >
        {locaisMergulho.map((local, index) => (
          <Menu.Item
            key={index}
            onPress={() => {
              setFormData({...formData, localMergulho: local});
              setMenuVisible(false);
            }}
            title={local}
          />
        ))}
      </Menu>

      <TextInput
        label="Coordenadas Latitude"
        value={formData.coordenadasLat}
        onChangeText={(text) => setFormData({...formData, coordenadasLat: text})}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />

      <TextInput
        label="Coordenadas Longitude"
        value={formData.coordenadasLong}
        onChangeText={(text) => setFormData({...formData, coordenadasLong: text})}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Correnteza?</Text>
      <RadioButton.Group
        onValueChange={(value) => setFormData({...formData, correnteza: value === 'true'})}
        value={formData.correnteza.toString()}
      >
        <View style={styles.radioContainer}>
          <RadioButton value="true" />
          <Text>Sim</Text>
          <RadioButton value="false" />
          <Text>Não</Text>
        </View>
      </RadioButton.Group>

      <TextInput
        label="Número de Mergulhadores"
        value={formData.numeroMergulhadores}
        onChangeText={(text) => setFormData({...formData, numeroMergulhadores: text})}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />

      <Button
        mode="outlined"
        onPress={pickImage}
        style={styles.input}
        icon="camera"
      >
        Tirar Foto da Ocorrência
      </Button>

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={styles.imagePreview}
        />
      )}

      <Button 
        mode="contained" 
        onPress={handleSubmit}
        style={[styles.button, { backgroundColor: '#e53935' }]}
        labelStyle={{ color: 'white' }}
      >
        Cadastrar Ocorrência
      </Button>

      <Button 
        mode="outlined" 
        onPress={() => navigation.goBack()}
        style={styles.button}
      >
        Voltar
      </Button>
    </ScrollView>
  );
}
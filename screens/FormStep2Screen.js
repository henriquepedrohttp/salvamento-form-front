import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, ScrollView, Image, Alert } from 'react-native';
import { TextInput, Button, Text, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/styles';

const API_URL = 'http://192.168.0.102:3000'; 

export default function FormStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params || {};
  const { formStep1, isEditing, originalPhoto } = params;
  
  const houveMergulho = params.houveMergulho || formStep1?.houveMergulho || false;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Ocorrência - Finalização' : 'Nova Ocorrência - Finalização',
    });
  }, [navigation, isEditing]);

  const [mergulhoData, setMergulhoData] = useState({
    localMergulho: formStep1?.localMergulho || '',
    profundidade: formStep1?.profundidade ? String(formStep1.profundidade) : '',
    visibilidadeAgua: formStep1?.visibilidadeAgua || '',
    ambiente: formStep1?.ambiente || '',
    tipoFundo: formStep1?.tipoFundo || '',
    correnteza: formStep1?.correnteza || false,
    numeroMergulhadores: formStep1?.numeroMergulhadores ? String(formStep1.numeroMergulhadores) : ''
  });

  const [visivelLocal, setVisivelLocal] = useState(false);
  const [visivelVisibilidade, setVisivelVisibilidade] = useState(false);
  const [visivelFundo, setVisivelFundo] = useState(false);
  const [visivelAmbiente, setVisivelAmbiente] = useState(false);

  const [image, setImage] = useState(null); 
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const locaisOptions = ['Rio', 'Lago', 'Mar', 'Piscina', 'Represa', 'Outro'];
  const visibilidadeOptions = ['Turva', 'Nenhuma', 'Parcial', 'Total'];
  const fundoOptions = ['Galhadas', 'Areia', 'Pedras', 'Outro'];
  const ambienteOptions = ['Normal', 'Poluído', 'Inóspito'];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });
            setLocation(loc.coords);
        } catch (error) {
            console.log("Erro GPS:", error);
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Erro', 'Precisa de permissão da câmera');
        return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets) setImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (houveMergulho && !mergulhoData.localMergulho) {
      Alert.alert('Erro', 'Selecione o local do mergulho');
      return;
    }

    if (!isEditing && !location) {
        Alert.alert(
            "Aguardando GPS", 
            "A localização ainda não foi obtida. Verifique se o GPS está ativo e aguarde a mensagem 'Localização Atualizada'."
        );
        return;
    }

    setLoading(true);

    const finalLat = location?.latitude ?? formStep1.latitude;
    const finalLng = location?.longitude ?? formStep1.longitude;

    const fullData = {
      ...formStep1,
      ...(houveMergulho ? mergulhoData : {}),
      houveMergulho,
      latitude: finalLat, 
      longitude: finalLng
    };

    const submitData = new FormData();
    submitData.append('data', JSON.stringify(fullData));

    if (image) {
      const filename = image.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      submitData.append('photo', { uri: image.uri, name: filename, type });
    }

    try {
      let url = `${API_URL}/occurrences`;
      let method = 'POST';

      if (isEditing && formStep1._id) {
        url = `${API_URL}/occurrences/${formStep1._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        body: submitData,
      });

      if (response.ok) {
        Alert.alert(
          'Sucesso', 
          isEditing ? 'Ocorrência atualizada com sucesso!' : 'Ocorrência cadastrada com sucesso!',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        const txt = await response.text();
        throw new Error(txt || 'Falha ao salvar');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {houveMergulho ? (
          <View>
            <Text style={styles.sectionTitle}>Detalhes do Mergulho</Text>
            
            <View style={styles.input}>
              <Menu
                visible={visivelLocal}
                onDismiss={() => setVisivelLocal(false)}
                contentStyle={{ backgroundColor: 'white' }}
                anchor={<Button mode="outlined" onPress={() => setVisivelLocal(true)} contentStyle={{justifyContent: 'flex-start'}}>{mergulhoData.localMergulho || 'Local do Mergulho'}</Button>}
              >
                {locaisOptions.map(o => <Menu.Item key={o} onPress={() => {setMergulhoData({...mergulhoData, localMergulho: o}); setVisivelLocal(false)}} title={o}/>)}
              </Menu>
            </View>

            <TextInput
              label="Profundidade (metros)"
              value={mergulhoData.profundidade}
              onChangeText={t => setMergulhoData({...mergulhoData, profundidade: t})}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.input}>
              <Menu
                visible={visivelVisibilidade}
                onDismiss={() => setVisivelVisibilidade(false)}
                anchor={<Button mode="outlined" onPress={() => setVisivelVisibilidade(true)} contentStyle={{justifyContent: 'flex-start'}}>{mergulhoData.visibilidadeAgua || 'Visibilidade da Água'}</Button>}
              >
                {visibilidadeOptions.map(o => <Menu.Item key={o} onPress={() => {setMergulhoData({...mergulhoData, visibilidadeAgua: o}); setVisivelVisibilidade(false)}} title={o}/>)}
              </Menu>
            </View>

            <View style={styles.input}>
              <Menu
                visible={visivelFundo}
                onDismiss={() => setVisivelFundo(false)}
                anchor={<Button mode="outlined" onPress={() => setVisivelFundo(true)} contentStyle={{justifyContent: 'flex-start'}}>{mergulhoData.tipoFundo || 'Tipo de Fundo'}</Button>}
              >
                {fundoOptions.map(o => <Menu.Item key={o} onPress={() => {setMergulhoData({...mergulhoData, tipoFundo: o}); setVisivelFundo(false)}} title={o}/>)}
              </Menu>
            </View>

            <View style={styles.input}>
              <Menu
                visible={visivelAmbiente}
                onDismiss={() => setVisivelAmbiente(false)}
                anchor={<Button mode="outlined" onPress={() => setVisivelAmbiente(true)} contentStyle={{justifyContent: 'flex-start'}}>{mergulhoData.ambiente || 'Ambiente'}</Button>}
              >
                {ambienteOptions.map(o => <Menu.Item key={o} onPress={() => {setMergulhoData({...mergulhoData, ambiente: o}); setVisivelAmbiente(false)}} title={o}/>)}
              </Menu>
            </View>

            <TextInput
                label="Nº Mergulhadores"
                value={mergulhoData.numeroMergulhadores}
                onChangeText={t => setMergulhoData({...mergulhoData, numeroMergulhadores: t})}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
            />

            <Divider style={{ marginVertical: 15 }} />
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Finalização da Ocorrência</Text>
            <Text style={{ fontSize: 16 }}>Nenhuma operação de mergulho reportada. Prossiga com a foto e localização.</Text>
          </View>
        )}

        <Button mode="contained" icon="camera" onPress={pickImage} style={[styles.input, {backgroundColor: '#ff5722'}]}>
          {image ? 'Trocar Foto Nova' : (originalPhoto && isEditing ? 'Alterar Foto Existente' : 'Tirar Foto da Ocorrência')}
        </Button>
        
    
        {image ? (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
            originalPhoto && isEditing && (
                <View style={{alignItems: 'center', marginBottom: 15}}>
                    <Text style={{marginBottom: 5, color: '#666'}}>Foto Atual Salva:</Text>
                    <Image source={{ uri: `${API_URL}/${originalPhoto.replace(/\\/g, '/')}` }} style={styles.imagePreview} />
                </View>
            )
        )}
        
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>GPS: </Text>
            {location ? (
                <Text style={{fontSize: 16, color: 'green'}}>Localização Atualizada ✅</Text>
            ) : (
                <Text style={{fontSize: 16, color: 'orange'}}>Buscando satélites...</Text>
            )}
        </View>

        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          loading={loading}
          disabled={loading}
          style={[styles.button, { backgroundColor: '#e53935', padding: 5, marginTop: 10 }]}
          labelStyle={{ fontSize: 16 }}
        >
          {isEditing ? "SALVAR ALTERAÇÕES" : "ENVIAR OCORRÊNCIA"}
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 10, marginBottom: 30 }}>
            Cancelar / Voltar
        </Button>

      </ScrollView>
    </SafeAreaView>
  );
}
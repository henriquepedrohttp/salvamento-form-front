import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Checkbox, Text, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/styles';

export default function FormStep1Screen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    grupo: '',
    codigoOcorrencia: '',
    associadoDesastre: false,
    codigoDesastre: '',
    eventos: [],
    outrosDesastres: '',
    numeroVitimas: ''
  });

  const eventosOptions = [
    { label: 'Evento com pessoas', value: 'Pessoas' },
    { label: 'Evento com animais', value: 'Animal' },
    { label: 'Cadáver', value: 'Cadáver' },
    { label: 'Evento com objetos', value: 'Objeto' },
    { label: 'Evento com meio de transportes', value: 'Meio de Transporte' },
    { label: 'Evento com árvores', value: 'Árvore' }
  ];

  const handleEventoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      eventos: prev.eventos.includes(value)
        ? prev.eventos.filter(item => item !== value)
        : [...prev.eventos, value]
    }));
  };

  const validateForm = () => {
    if (!formData.grupo.trim()) {
      Alert.alert('Erro', 'O campo Grupo é obrigatório!');
      return false;
    }
    if (!formData.codigoOcorrencia.trim()) {
      Alert.alert('Erro', 'O campo Código da Ocorrência é obrigatório!');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigation.navigate('FormStep2', { formStep1: formData });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Grupo *"
        value={formData.grupo}
        onChangeText={(text) => setFormData({...formData, grupo: text})}
        style={styles.input}
        mode="outlined"
        placeholder="Ex: Salvamento em Águas Abertas"
      />

      <TextInput
        label="Código da classificação da ocorrência *"
        value={formData.codigoOcorrencia}
        onChangeText={(text) => setFormData({...formData, codigoOcorrencia: text})}
        style={styles.input}
        mode="outlined"
        placeholder="Ex: OC001"
      />

      <Text style={styles.label}>Associado a desastre?</Text>
      <RadioButton.Group
        onValueChange={(value) => setFormData({...formData, associadoDesastre: value === 'true'})}
        value={formData.associadoDesastre.toString()}
      >
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Sim" value="true" />
          <RadioButton.Item label="Não" value="false" />
        </View>
      </RadioButton.Group>

      {formData.associadoDesastre && (
        <TextInput
          label="Código do desastre"
          value={formData.codigoDesastre}
          onChangeText={(text) => setFormData({...formData, codigoDesastre: text})}
          style={styles.input}
          mode="outlined"
          placeholder="Ex: DES001"
        />
      )}

      <Text style={styles.label}>Eventos:</Text>
      {eventosOptions.map((evento, index) => (
        <View key={index} style={styles.checkboxContainer}>
          <Checkbox
            status={formData.eventos.includes(evento.value) ? 'checked' : 'unchecked'}
            onPress={() => handleEventoChange(evento.value)}
          />
          <Text style={styles.checkboxLabel}>{evento.label}</Text>
        </View>
      ))}

      <TextInput
        label="Outros"
        value={formData.outrosDesastres}
        onChangeText={(text) => setFormData({...formData, outrosDesastres: text})}
        style={styles.input}
        mode="outlined"
        placeholder="Descreva outros eventos não listados"
      />

      <TextInput
        label="Número de vítimas"
        value={formData.numeroVitimas}
        onChangeText={(text) => setFormData({...formData, numeroVitimas: text})}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        placeholder="0"
      />

      <Button 
        mode="contained" 
        onPress={handleNext}
        style={[styles.button, { backgroundColor: '#1565c0' }]}
        labelStyle={{ color: 'white' }}
      >
        Próxima Etapa
      </Button>
    </ScrollView>
  );
}
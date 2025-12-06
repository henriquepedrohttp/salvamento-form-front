import React, { useState, useLayoutEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/styles';

export default function FormStep1Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  

  const { occurrenceToEdit } = route.params || {};


  const [visibleTipoSalvamento, setVisibleTipoSalvamento] = useState(false);
  const [visiblePosto, setVisiblePosto] = useState(false);
  const [visibleLocal, setVisibleLocal] = useState(false);


  const [formData, setFormData] = useState({
    _id: occurrenceToEdit?._id || null, 
    
    grupo: occurrenceToEdit?.grupo || '',
    codigoOcorrencia: occurrenceToEdit?.codigoOcorrencia || '',
    tipoSalvamento: occurrenceToEdit?.tipoSalvamento || '',
    localOcorrencia: occurrenceToEdit?.localOcorrencia || '',
    
    houveAfogamento: occurrenceToEdit?.houveAfogamento || !!occurrenceToEdit?.grauAfogamento || false,
    grauAfogamento: occurrenceToEdit?.grauAfogamento || '',
    
    cadaverLocalizado: occurrenceToEdit?.cadaverLocalizado || false,
    
    resgateAnimal: occurrenceToEdit?.resgateAnimal || false,
    tipoAnimal: occurrenceToEdit?.tipoAnimal || '',
    estadoAnimal: occurrenceToEdit?.estadoAnimal || '',
    
    postoComandante: occurrenceToEdit?.postoComandante || '',
    nomeGuerra: occurrenceToEdit?.nomeGuerra || '',

    associadoDesastre: occurrenceToEdit?.associadoDesastre || false,
    codigoDesastre: occurrenceToEdit?.codigoDesastre || '',
    eventos: occurrenceToEdit?.eventos || [],
    outrosDesastres: occurrenceToEdit?.outrosDesastres || '',

    numeroVitimas: occurrenceToEdit?.numeroVitimas ? String(occurrenceToEdit.numeroVitimas) : '',
    
    houveMergulho: occurrenceToEdit?.houveMergulho || false
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: occurrenceToEdit ? 'Editar Ocorrência - Etapa 1' : 'Nova Ocorrência - Etapa 1',
    });
  }, [navigation, occurrenceToEdit]);

  const tiposSalvamento = ['Busca Terrestre', 'Salvamento Aquático', 'Estruturas Colapsadas', 'Resgate Veicular', 'Outro'];
  const postos = ['Soldado', 'Cabo', 'Sargento', 'Subtenente', 'Tenente', 'Capitão', 'Major', 'Tenente-Coronel', 'Coronel'];
  const locaisOptions = ['Aquático', 'Terrestre', 'Em Altura'];

  const validateForm = () => {
    if (!formData.grupo.trim()) { Alert.alert('Erro', 'Preencha o Grupo'); return false; }
    if (!formData.tipoSalvamento) { Alert.alert('Erro', 'Selecione o Tipo de Salvamento'); return false; }
    if (!formData.codigoOcorrencia) { Alert.alert('Erro', 'Preencha o Código'); return false; }
    if (!formData.localOcorrencia) { Alert.alert('Erro', 'Selecione o Local da Ocorrência'); return false; }
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {

      const dataToPass = {
        ...(occurrenceToEdit || {}), 
        ...formData 
      };

      navigation.navigate('FormStep2', { 
        formStep1: dataToPass,
        houveMergulho: formData.houveMergulho,
        
        isEditing: !!occurrenceToEdit,
        originalPhoto: occurrenceToEdit?.photo
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        
        <Text style={styles.sectionTitle}>Dados da Operação</Text>

        <TextInput
          label="Grupo *"
          value={formData.grupo}
          onChangeText={(t) => setFormData({...formData, grupo: t})}
          style={styles.input}
          mode="outlined"
        />
        
        <TextInput
          label="Código da Ocorrência *"
          value={formData.codigoOcorrencia}
          onChangeText={(t) => setFormData({...formData, codigoOcorrencia: t})}
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.input}>
          <Menu
            visible={visibleTipoSalvamento}
            onDismiss={() => setVisibleTipoSalvamento(false)}
            anchor={
              <Button mode="outlined" onPress={() => setVisibleTipoSalvamento(true)} contentStyle={{justifyContent: 'flex-start'}}>
                {formData.tipoSalvamento || 'Tipo de Busca/Salvamento *'}
              </Button>
            }
          >
            {tiposSalvamento.map((item) => (
              <Menu.Item key={item} onPress={() => {
                setFormData({...formData, tipoSalvamento: item});
                setVisibleTipoSalvamento(false);
              }} title={item} />
            ))}
          </Menu>
        </View>

        <View style={styles.input}>
          <Menu
            visible={visibleLocal}
            onDismiss={() => setVisibleLocal(false)}
            anchor={
              <Button mode="outlined" onPress={() => setVisibleLocal(true)} contentStyle={{justifyContent: 'flex-start'}}>
                {formData.localOcorrencia || 'Local da Ocorrência *'}
              </Button>
            }
          >
            {locaisOptions.map((item) => (
              <Menu.Item key={item} onPress={() => {
                setFormData({...formData, localOcorrencia: item});
                setVisibleLocal(false);
              }} title={item} />
            ))}
          </Menu>
        </View>

        <Text style={styles.label}>Houve Afogamento?</Text>
        <RadioButton.Group 
          onValueChange={v => {
            const isAfogamento = v === 'true';
            setFormData({
                ...formData, 
                houveAfogamento: isAfogamento,
                grauAfogamento: isAfogamento ? formData.grauAfogamento : '' 
            });
          }} 
          value={formData.houveAfogamento.toString()}
        >
          <View style={styles.radioContainer}>
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </View>
        </RadioButton.Group>
 
        {formData.houveAfogamento && (
            <View style={{ backgroundColor: '#141618ff', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <Text style={[styles.label, { marginTop: 0, color: '#ffffffff'}]}>Selecione o Grau:</Text>
                <RadioButton.Group onValueChange={v => setFormData({...formData, grauAfogamento: v})} value={formData.grauAfogamento}>
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {['Grau 1', 'Grau 2', 'Grau 3', 'Grau 4', 'Grau 5', 'Grau 6'].map(g => (
                    <View key={g} style={{flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 5}}>
                        <RadioButton 
                            value={g} 
                            color="#e53935"    
                            uncheckedColor="#fffefeff" 
                        />
                        <Text style={{ color: '#ffffffff' }}>{g}</Text>
                    </View>
                    ))}
                </View>
                </RadioButton.Group>
            </View>
        )}

        <Text style={styles.label}>Cadáver Localizado?</Text>
        <RadioButton.Group onValueChange={v => setFormData({...formData, cadaverLocalizado: v === 'true'})} value={formData.cadaverLocalizado.toString()}>
          <View style={styles.radioContainer}>
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </View>
        </RadioButton.Group>

        <Text style={styles.label}>É resgate de animal?</Text>
        <RadioButton.Group onValueChange={v => setFormData({...formData, resgateAnimal: v === 'true'})} value={formData.resgateAnimal.toString()}>
           <View style={styles.radioContainer}>
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </View>
        </RadioButton.Group>

        {formData.resgateAnimal && (
          <View style={{ backgroundColor: '#eeeeee', padding: 10, borderRadius: 8, marginBottom: 10 }}>
            <TextInput
              label="Tipo do Animal"
              value={formData.tipoAnimal}
              onChangeText={t => setFormData({...formData, tipoAnimal: t})}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Cachorro"
            />
             <TextInput
              label="Estado Aparente"
              value={formData.estadoAnimal}
              onChangeText={t => setFormData({...formData, estadoAnimal: t})}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Ferido"
            />
          </View>
        )}

        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.label}>Dados do Comandante</Text>
        
        <View style={styles.input}>
          <Menu
            visible={visiblePosto}
            contentStyle={{ backgroundColor: 'white' }}
            onDismiss={() => setVisiblePosto(false)}
            anchor={
              <Button mode="outlined" onPress={() => setVisiblePosto(true)} contentStyle={{justifyContent: 'flex-start'}}>
                {formData.postoComandante || 'Posto/Graduação'}
              </Button>
            }
          >
            {postos.map((p) => (
              <Menu.Item key={p} onPress={() => {
                setFormData({...formData, postoComandante: p});
                setVisiblePosto(false);
              }} title={p} />
            ))}
          </Menu>
        </View>

        <TextInput
          label="Nome de Guerra"
          value={formData.nomeGuerra}
          onChangeText={t => setFormData({...formData, nomeGuerra: t})}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Número de Vítimas"
          value={formData.numeroVitimas}
          onChangeText={t => setFormData({...formData, numeroVitimas: t})}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />
        
        <Divider style={{ marginVertical: 20, height: 2 }} />
        <Text style={[styles.label, {fontSize: 18, color: '#e53935'}]}>Houve Operação de Mergulho?</Text>
        <RadioButton.Group 
          onValueChange={v => setFormData({...formData, houveMergulho: v === 'true'})} 
          value={formData.houveMergulho.toString()}
        >
          <View style={styles.radioContainer}>
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </View>
        </RadioButton.Group>

        <Button 
          mode="contained" 
          onPress={handleNext}
          style={[styles.button, { backgroundColor: '#1565c0', marginTop: 20, marginBottom: 30 }]}
          labelStyle={{ color: 'white' }}
        >
          {formData.houveMergulho ? 'Ir para Dados de Mergulho' : 'Prosseguir para Foto e GPS'}
        </Button>

      </ScrollView>
    </SafeAreaView>
  );
}
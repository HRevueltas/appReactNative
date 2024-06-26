import React, { useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Dialog from './Dialog';
import { saveLog } from '../helpers/logsService';
import { Ionicons } from '@expo/vector-icons';
const Scheduler = () => {
  const [section, setSection] = useState('todas');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const scheduleAction = (action) => {
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    console.log('Fecha formateada:', formattedDate);
    const url = `http://192.168.1.34/schedule?section=${section}&time=${formattedDate}&action=${action}`;


    axios.get(url)
      .then(response => {
        console.log('Respuesta exitosa:', response.data);
        setError(null);
        
        const formattedTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        console.log('formattedTime:', formattedTime);
        
        const info = { section, time: formattedTime, action };
        setDialogMessage(`Se programó ${info.action === 'encender' ? 'encendido' : 'apagado'} para:\nSección: ${info.section}\nHorario: ${info.time}`);
        setDialogVisible(true);

        // Guardar log
        saveLog(section, `Se programó ${action === 'encender' ? 'encendido' : 'apagado'} Horario: ${info.time}`);
      })
      .catch(error => {
        if (error.response && error.response.data) {
          // console.error( error.response.data);
          setError(error.response.data);
          setDialogMessage(`Error: ${error.response.data}`);
          setDialogVisible(true);
        } else {
          // console.error('Error general:', error.message);
          setError('Error desconocido');
          setDialogMessage(`Error de conexión, ${error.message}`);
          // setDialogMessage('Ocurrió un error desconocido.');
          setDialogVisible(true);
        }
      });
  };

  const cancelAllSchedules = () => {
    const url = 'http://192.168.1.34/cancel_all_temp_schedules';

    Alert.alert(
      'Confirmación',
      '¿Estás seguro que deseas cancelar todas las programaciones?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            axios.get(url)
              .then(response => {
                console.log('Cancelación exitosa:', response.data);
                setError(null);
                setDialogMessage('Todas las programaciones fueron canceladas.');
                setDialogVisible(true);

                // Guardar log
                saveLog('Todas las secciones', 'Cancelación de todas las programaciones');
              })
              .catch(error => {
                if (error.response && error.response.data) {
                  console.error( error.response.data);
                  setError(error.response.data);
                  setDialogMessage(`Error: ${error.response.data}`);
                  setDialogVisible(true);
                } else {
                  // console.error('Error', error.message);
                  // setError('Error desconocido');
                  setDialogMessage(`Error de conexión, ${error.message}`);
                  setDialogVisible(true);
                }
              });
          },
        },
      ]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setShowTimePicker(false);
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
    setShowTimePicker(false);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Programar Encendido/Apagado temporal </Text>
      <Text style={styles.label}>Selecciona una sección:</Text>
      <Picker
        selectedValue={section}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => setSection(itemValue)}>
        <Picker.Item label="Selecciona una sección" value="" />
        <Picker.Item label="Todas" value="todas" />
        <Picker.Item label="Salones Entrada" value="salones-entrada" />
        <Picker.Item label="Callejón" value="callejon" />
        <Picker.Item label="Rectoría e Informática" value="rectoria-infor" />
        <Picker.Item label="Preescolar" value="preescolar" />
        {/* <Picker.Item label="Bachillerato 1" value="bachillerato-1" /> */}
        {/* <Picker.Item label="Bachillerato 2" value="bachillerato-2" /> */}
        {/* <Picker.Item label="Restaurante" value="restaurante" /> */}
        {/* <Picker.Item label="Pantalla" value="pantalla" /> */}
      </Picker>

      <Text style={styles.label}>Selecciona la fecha y hora:</Text>
      <View style={styles.dateTimeContainer}>
        <Button title="Fecha" onPress={showDatepicker}  />
        <Button title="Hora" onPress={showTimepicker} />
      </View>
      <Text>
        Último horario seleccionado:
      </Text>
      <Text style={styles.dateTimeText} onPress={()=> setShowTimePicker(true)}>
        {`${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        
      </Text>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title="Programar Encendido" 
          onPress={() => scheduleAction('encender')} 
        />
        <Button 
          title="Programar Apagado" 
          onPress={() => scheduleAction('apagar')} 
        />
        <Button 
          color="red" 
          title="Cancelar Todas las Programaciones" 
          onPress={cancelAllSchedules} 
        />
      </View>

      {dialogVisible && (
        <Dialog message={dialogMessage} onClose={() => setDialogVisible(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  title: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateTimeText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: 150,
  },
});

export default Scheduler;

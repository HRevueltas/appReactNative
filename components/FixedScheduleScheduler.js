import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { saveLog } from '../helpers/logsService';

const FixedScheduleScheduler = () => {
  const [section, setSection] = useState('1');
  const [day, setDay] = useState('2'); // Valor inicial del día (2 = lunes)
  const [time, setTime] = useState(new Date()); // Hora de encendido
  const [command, setCommand] = useState('encender'); // Comando de acción
  const [schedule, setSchedule] = useState([]); // Almacena el horario programado
  const [showTimePicker, setShowTimePicker] = useState(false); // Estado para mostrar selector de hora

  // Cargar horarios programados al iniciar el componente 
  useEffect(() => {
    console.log('Cargando horarios programados...', schedule);
    loadScheduleFromStorage();
  }, []);

  // Guardar el horario programado en AsyncStorage
  const saveScheduleToStorage = async () => {
    try {
      const storedSchedule = await AsyncStorage.setItem('fixedSchedule', JSON.stringify(schedule));
      // mostrar horario programado en consola
      console.log('Horario programado guardado:', schedule);
    } catch (error) {
      console.error('Error saving schedule to AsyncStorage:', error);
    }
  };

  // Cargar horario programado desde AsyncStorage
  const loadScheduleFromStorage = async () => {
    try {
      const storedSchedule = await AsyncStorage.getItem('fixedSchedule');
      console.log('Horario programado almacenado:', storedSchedule);
      if (storedSchedule !== null) {
        const parsedSchedule = JSON.parse(storedSchedule);
        parsedSchedule.forEach(item => {
          item.time = new Date(item.time); // Convertir time de vuelta a objeto Date
        });

        console.log('Horario programado cargado:', parsedSchedule);
        setSchedule(parsedSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule from AsyncStorage:', error);
    }
  };

  // Añadir un elemento al horario programado
  const addScheduleItem = async (command) => {
    const newTime = new Date(time);

    let updatedSchedule;
    if (section === 'todas') {
      const allSections = ['1', '2', '3', '4'];
      updatedSchedule = schedule.filter(item => !(item.day === day && allSections.includes(item.section) && item.command === command));
      allSections.forEach(sectionId => {
        updatedSchedule.push({ section: sectionId, day, time: newTime, command });
      });
    } else {
      updatedSchedule = schedule.filter(item => !(item.section === section && item.day === day && item.command === command));
      updatedSchedule.push({ section, day, time: newTime, command });
    }

    try {
      // Guardar en AsyncStorage y mostrar alerta
      await AsyncStorage.setItem('fixedSchedule', JSON.stringify(updatedSchedule));
      console.log('Horario programado guardado:', updatedSchedule);

      // Actualizar el estado local con el nuevo horario
      setSchedule(updatedSchedule);

      // Actualizar logs
      if (section === 'todas') {
        const logMessage = `Programado horario ${command === 'encender' ? 'encendido' : 'apagado'} para todas las secciones el ${getDayName(day)} a las ${newTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}`;
        saveLog('todas', logMessage); // Llamar a saveLog con los parámetros adecuados
      } else {
        const sectionName = getSectionName(section);
        const logMessage = `Programado horario ${command === 'encender' ? 'encendido' : 'apagado'} para ${sectionName} el ${getDayName(day)} a las ${newTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}`;
        saveLog(sectionName, logMessage); // Llamar a saveLog con los parámetros adecuados
      }

      // Cargar desde AsyncStorage
      loadScheduleFromStorage();

      Alert.alert('Horario programado', `Se programó ${command === 'encender' ? 'encendido' : 'apagado'} para la sección ${getSectionName(section)} en ${getDayName(day)} a las ${newTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}`);
    } catch (error) {
      console.error('Error saving schedule to AsyncStorage:', error);
      Alert.alert('Error', 'Hubo un problema al guardar el horario.');
    }
  };

  // Renderizar los horarios programados para el día seleccionado
  const renderScheduledTimes = () => {
    const filteredSchedule = schedule.filter(item => item.day === day);
    const allSections = ['1', '2', '3', '4'];

    return (
      <View style={styles.scrollViewContainer}>
        {allSections.map(sectionId => {
          const sectionEncendidoSchedule = filteredSchedule.find(item => item.section === sectionId && item.command === 'encender');
          const sectionApagadoSchedule = filteredSchedule.find(item => item.section === sectionId && item.command === 'apagar');

          const encendidoText = sectionEncendidoSchedule ? sectionEncendidoSchedule.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sin horario';
          const apagadoText = sectionApagadoSchedule ? sectionApagadoSchedule.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sin horario';

          return (
            <View key={sectionId} style={styles.scheduleItem}>
              <Text style={[styles.scheduleText, styles.firstColumn]}>{getSectionName(sectionId)}</Text>
              <Text style={styles.scheduleText}>{encendidoText}</Text>
              <Text style={styles.scheduleText}>{apagadoText}</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => cancelSchedule(sectionId, day)}>
                <Ionicons name="trash-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  // Cancelar todos los horarios programados para el día y sección seleccionados
  const cancelSchedule = async (sectionId, day) => {
    const baseUrl = 'http://192.168.1.34'; // Reemplaza esto con la URL base del ESP32
    const url = `${baseUrl}/cancel_fixed_schedule?seccion=${sectionId}&dia=${day}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      if (response.ok) {
        // Actualizar el estado local eliminando el horario cancelado
        const updatedSchedule = schedule.filter(item => !(item.section === sectionId && item.day === day));
        setSchedule(updatedSchedule);

        // Guardar en AsyncStorage y mostrar alerta
        await AsyncStorage.setItem('fixedSchedule', JSON.stringify(updatedSchedule));

        // Actualizar logs
        const sectionName = getSectionName(section);
        const logMessage = `Cancelados los horarios para ${getSectionName(sectionId)} el ${getDayName(day)}`;
        saveLog(sectionName, logMessage); // Llamar a saveLog con los parámetros adecuados

        console.log('Horario cancelado:', updatedSchedule);
        Alert.alert('Horario cancelado', `Todos los horarios para la sección ${getSectionName(sectionId)} en ${getDayName(day)} han sido cancelados.`);
      } else {
        Alert.alert('Error', `Hubo un problema al cancelar el horario en el ESP32: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error cancelling schedule on ESP32:', error);
      Alert.alert('Error', `No se pudo cancelar el horario en el ESP32: ${error.message}`);
    }
  };

  // Cancelar todos los horarios programados
  const cancelAllSchedules = async () => {
    const baseUrl = 'http://192.168.1.34'; // Reemplaza esto con la URL base del ESP32
    const url = `${baseUrl}/cancel_all_fixed_schedules`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      if (response.ok) {
        setSchedule([]);
        AsyncStorage.removeItem('fixedSchedule');

        // Actualizar logs
        const logMessage = 'Cancelados todos los horarios programados';
        saveLog('todos', logMessage); // Llamar a saveLog con los parámetros adecuados


        Alert.alert('Todos los horarios cancelados', 'Todos los horarios programados han sido cancelados.');
      } else {
        Alert.alert('Error', `Hubo un problema al cancelar todos los horarios en el ESP32: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error cancelling all schedules on ESP32:', error);
      Alert.alert('Error', `No se pudo cancelar todos los horarios en el ESP32: ${error.message}`);
    }
  };

  // Obtener el nombre del día a partir de su número
  const getDayName = (day) => {
    switch (day) {
      case '1':
        return 'Domingo';
      case '2':
        return 'Lunes';
      case '3':
        return 'Martes';
      case '4':
        return 'Miércoles';
      case '5':
        return 'Jueves';
      case '6':
        return 'Viernes';
      case '7':
        return 'Sábado';
      default:
        return '';
    }
  };

  // Obtener el nombre de la sección a partir de su ID
  const getSectionName = (sectionId) => {
    switch (sectionId) {
      case '1':
        return 'Salones Entrada';
      case '2':
        return 'Callejón';
      case '3':
        return 'Rectoría e Informática';
      case '4':
        return 'Preescolar';
      default:
        return '';
    }
  };

  // Manejar el cambio de hora seleccionada en el DateTimePicker
  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  // Mostrar el DateTimePicker para seleccionar la hora
  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  // Programar una acción (encendido o apagado)
  const scheduleAction = (action) => {
    const horaFormateada = time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    console.log(`Horario programado para: ${getDayName(day)} a las: ${horaFormateada} con la acción: ${action} en la sección: ${getSectionName(section)}`);

    setCommand(action);
    sendScheduleToESP32(action);
  };

  // Enviar el horario programado al ESP32 usando fetch y método GET
  const sendScheduleToESP32 = async (action) => {
    const horaFormateada = time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    const baseUrl = 'http://192.168.1.34'; // Reemplaza esto con la URL base del ESP32
    const endpoint = section === 'todas' ? '/set_all_fixed_schedule' : '/set_fixed_schedule';
    const url = `${baseUrl}${endpoint}?seccion=${section}&dia=${day}&comando=${action}&hora=${horaFormateada}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      // console.log('ESP32 respuesta completa--------------:', response.ok );
      console.log('¿Respondió con exito?:', response.ok);
      console.log('Codigo de respuesta:', response.status);
      if (response.ok) {
        console.log('ESP32 mensaje respuesta ++++++++:', await response.text());
        addScheduleItem(action); // Agregar el ítem al horario programado
      } else {
        Alert.alert('Error', `Hubo un problema al enviar el horario al ESP32: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error sending schedule to ESP32:', error);
      Alert.alert('Error', `No se pudo enviar el horario al ESP32: ${error.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Horario Fijo de Encendido y Apagado</Text>

      <Text style={styles.label}>Selecciona la sección:</Text>
      <Picker selectedValue={section} onValueChange={(itemValue) => setSection(itemValue)} style={styles.picker}>
        <Picker.Item label="Todas" value="todas" />
        <Picker.Item label="Salones Entrada" value="1" />
        <Picker.Item label="Callejón" value="2" />
        <Picker.Item label="Rectoría e Informática" value="3" />
        <Picker.Item label="Preescolar" value="4" />
      </Picker>

      <Text style={styles.label}>Selecciona el día:</Text>
      <Picker selectedValue={day} onValueChange={(itemValue) => setDay(itemValue)} style={styles.picker}>
        <Picker.Item label="Lunes" value="2" />
        <Picker.Item label="Martes" value="3" />
        <Picker.Item label="Miércoles" value="4" />
        <Picker.Item label="Jueves" value="5" />
        <Picker.Item label="Viernes" value="6" />
        <Picker.Item label="Sábado" value="7" />
        <Picker.Item label="Domingo" value="1" />
      </Picker>

      <Text style={styles.label}>Selecciona la hora:</Text>
      <TouchableOpacity onPress={showTimepicker} style={styles.timePickerButton}>
        <Text style={styles.timePickerButtonText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={time} mode="time" display="default" onChange={handleTimeChange} />
      )}

      <Text style={styles.label}>Acción:</Text>
      <View style={styles.commandContainer}>
        <TouchableOpacity style={styles.commandButton} onPress={() => scheduleAction('encender')}>
          <Text style={styles.commandButtonText}>Encender</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commandButton} onPress={() => scheduleAction('apagar')}>
          <Text style={styles.commandButtonText}>Apagar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.scheduledTimesTitle}>Horarios programados para el día {getDayName(day)}:

      </Text>
      {renderScheduledTimes()}

      <TouchableOpacity style={styles.cancelAllButton} onPress={cancelAllSchedules}>
        <Text style={styles.cancelAllButtonText}>Cancelar horarios de todos los días </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    marginBottom: 20,
  },
  timePickerButton: {
    padding: 10,
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  timePickerButtonText: {
    fontSize: 16,
  },
  commandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  commandButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  commandButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduledTimesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleText: {
    flex: 1,
    fontSize: 16,
  },
  firstColumn: {
    flex: 1.5,
  },
  cancelButton: {
    marginLeft: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    padding: 5,
  },
  cancelAllButton: {
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollViewContainer: {
    maxHeight: 250,
  },
});

export default FixedScheduleScheduler;

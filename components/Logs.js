import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Filters from './Filters'; // Asegúrate de importar correctamente el componente Filters
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLogs } from '../helpers/logsService';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState(10);
  const [refreshing, setRefreshing] = useState(false); // Estado para controlar el refresco

  // console.log("fecha de inicio parseada:", startDate.toLocaleDateString(), startDate.toLocaleTimeString();
  // console.log("fecha final", endDate.toLocaleDateString(), endDate.toLocaleTimeString());
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const storedLogs = await getLogs();
        setLogs(storedLogs);
      } catch (error) {
        Alert.alert('Error', 'Hubo un error al cargar los logs.');
      }
    };

    loadLogs();
  }, []);

  // Inicialización de fechas por defecto: ayer y hoy
  useEffect(() => {
    const today = new Date();
    // const yesterday = new Date(today);
    // yesterday.setDate(today.getDate() - 1);
    setStartDate(today);
    setEndDate(today);
  }, []);

  const parseDate = (dateString) => {
    // Función de parseo de fecha, mantenida igual
    const [date, time, period] = dateString.split(' ');
    const [day, month, year] = date.split('/');
    const [hours, minutes] = time.split(':');
    const hoursIn24 = period === 'p.m.' ? parseInt(hours) + 12 : hours;
    return new Date(year, month - 1, day, hoursIn24, minutes);
  };

  const reloadLogs = async () => {
    setRefreshing(true); // Activa el refresco
    try {
      await loadLogs();
      Alert.alert('Éxito', 'Registros recargados correctamente.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al cargar los logs.');
    } finally {
      setRefreshing(false); // Desactiva el refresco
    }
  };

  const loadLogs = async () => {
    try {
      const storedLogs = await getLogs();
      setLogs(storedLogs);
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al cargar los logs.');
    }
  };

  const handleDeleteAllLogs = () => {
    Alert.alert(
      'Eliminar todos los registros',
      '¿Estás seguro que deseas eliminar todos los registros?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: deleteAllLogsConfirmed }
      ],
      { cancelable: true }
    );
  };

  const deleteAllLogsConfirmed = async () => {
    try {
      await AsyncStorage.removeItem('logs');
      setLogs([]);
      Alert.alert('Éxito', 'Todos los registros han sido eliminados.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al eliminar todos los registros.');
    }
  };

  const handleShowMore = () => {
    setVisibleLogs(prevVisibleLogs => prevVisibleLogs + 10);
  };

  const handleSectionFilterChange = (value) => {
    setSectionFilter(value);
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    if (endDate && currentDate > endDate) {
      Alert.alert('Error', 'La fecha de inicio no puede ser posterior a la fecha final.');
    } else {
      setStartDate(currentDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    if (startDate && currentDate < startDate) {
      Alert.alert('Error', 'La fecha final no puede ser anterior a la fecha de inicio.');
    } else {
      setEndDate(currentDate);
    }
  };

  // const filteredLogs = useMemo(() => {
  //   return logs.filter(log => {
  //     const matchesSearch = (
  //       log.section.toLowerCase().includes(search.toLowerCase()) ||
  //       log.state.toLowerCase().includes(search.toLowerCase())
  //     );

  //     const matchesSection = (
  //       sectionFilter.trim() === '' || log.section.toLowerCase() === sectionFilter.toLowerCase()
  //     );

  //     const logDate = parseDate(log.timestamp).getTime();

  //     const matchesStartDate = startDate ? logDate >= startDate.getTime() : true;
  //     const matchesEndDate = endDate ? logDate <= endDate.getTime() : true;

  //     const passesSectionFilter = sectionFilter.trim() === 'todo-registro' ? true : matchesSection;

  //     return matchesSearch && passesSectionFilter && matchesStartDate && matchesEndDate;
  //   });
  // }, [logs, search, sectionFilter, startDate, endDate]);

const filteredLogs = useMemo(() => {
  // Ajusta startDate para que sea el inicio del día
  const startDateWithTime = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0) : null;
  // Ajusta endDate para que sea el final del día
  const endDateWithTime = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59) : null;

  return logs.filter(log => {
    const matchesSearch = (
      log.section.toLowerCase().includes(search.toLowerCase()) ||
      log.state.toLowerCase().includes(search.toLowerCase())
    );

    const matchesSection = (
      sectionFilter.trim() === '' || log.section.toLowerCase() === sectionFilter.toLowerCase()
    );

    const logDate = parseDate(log.timestamp).getTime();

    const matchesStartDate = startDateWithTime ? logDate >= startDateWithTime.getTime() : true;
    const matchesEndDate = endDateWithTime ? logDate <= endDateWithTime.getTime() : true;

    const passesSectionFilter = sectionFilter.trim() === 'todo-registro' ? true : matchesSection;

    return matchesSearch && passesSectionFilter && matchesStartDate && matchesEndDate;
  });
}, [logs, search, sectionFilter, startDate, endDate]);
  console.log('registros cargados:', logs.length);
  console.log('registros filtrados:', filteredLogs.length);
  return (
    <View style={styles.container}>
      <Filters
        sectionFilter={sectionFilter || 'todo-registro'}
        onSectionFilterChange={handleSectionFilterChange}
      />

      <TextInput
        placeholder="Buscar registros por sección o estado"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <View style={styles.datePickersContainer}>
        <Text style={styles.title}>Filtrar por fecha</Text>
        <View style={styles.datePickerButtonsContainer}>
          <Pressable style={styles.datePickerButton} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>Seleccionar fecha de inicio</Text>
          </Pressable>
          <Pressable style={styles.datePickerButton} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>Seleccionar fecha final</Text>
          </Pressable>
        </View>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="spinner"
            onChange={handleEndDateChange}
          />
        )}

        <View style={styles.dateTextContainer}>
          <Text style={styles.dateText}>
            Fecha de inicio: {startDate ? startDate.toLocaleDateString() : 'No seleccionada'}
          </Text>
          <Text style={styles.dateText}>
            Fecha final: {endDate ? endDate.toLocaleDateString() : 'No seleccionada'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.tableContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reloadLogs}
          />
        }
      >
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>Sección</Text>
            <Text style={styles.tableHeader}>Estado</Text>
            <Text style={styles.tableHeader}>Fecha</Text>
          </View>
          {filteredLogs.slice(0, visibleLogs).map((log, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
              <Text style={styles.tableData}>{log.section}</Text>
              <Text style={styles.tableData}>{log.state}</Text>
              <Text style={styles.tableData}>{log.timestamp}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.fixedButtons}>
        {visibleLogs < filteredLogs.length && (
          <Pressable onPress={handleShowMore} style={styles.showMoreButton}>
            <Text style={styles.showMoreButtonText}>Mostrar más</Text>
          </Pressable>
        )}
        <Pressable onPress={handleDeleteAllLogs} style={styles.deleteAllButton}>
          <Text style={styles.deleteAllButtonText}>Eliminar todos los registros</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 10,
  },
  tableContainer: {
    flex: 1,
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  tableRowEven: {    backgroundColor: '#f8f8f8',
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableData: {
    flex: 1,
    padding: 1,
  },
  showMoreButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  showMoreButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  deleteAllButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteAllButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  fixedButtons: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'gray',
    flexDirection: 'column',
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  datePickersContainer: {
    marginBottom: 10,
  },
  datePickerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateTextContainer: {
    marginTop: 10,
    marginBottom: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  dateText: {
    textAlign: 'center',
  },
  datePickerButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    width: '48%', // Ajusta el ancho según tus necesidades
  },
  datePickerButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default Logs;


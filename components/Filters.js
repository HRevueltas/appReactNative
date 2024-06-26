import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Filters = ({ sectionFilter , onSectionFilterChange }) => {
  console.log('sectionFilter:', sectionFilter);
  return ( 
    <View style={styles.filters}>
      {/* Filtrar por Sección */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Filtrar por Sección: </Text>
        <Picker
          selectedValue={sectionFilter || 'todas'}
          style={styles.sectionFilter}
          onValueChange={onSectionFilterChange}
        >
          <Picker.Item label="Todos los registros" value="todo-registro" />
          <Picker.Item label="Todas" value="todas" />
          <Picker.Item label="Salones Entrada" value="salones-entrada" />
          <Picker.Item label="Callejón" value="callejon" />
          <Picker.Item label="Rectoría e Informática" value="rectoria-informatica" />
          <Picker.Item label="Preescolar" value="preescolar" />
          {/* <Picker.Item label="bachillerato-1" value="bachillerato-1" />
          <Picker.Item label="bachillerato-2" value="bachillerato-2" />
          <Picker.Item label="restaurante" value="restaurante" />
          <Picker.Item label="pantalla" value="pantalla" /> */}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    marginRight: 10,
  },
  sectionFilter: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    width: 200,
  },
});

export default Filters;

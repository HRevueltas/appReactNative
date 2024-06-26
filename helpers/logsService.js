import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para guardar un nuevo log
export const saveLog = async (section, state) => {
  try {
    const timestamp = Date.now(); // Guarda el timestamp como un número
    const formattedTimestamp = new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }); // Formatea el timestamp como una cadena de texto

    const newLog = { section, state, timestamp: formattedTimestamp };
    const existingLogs = JSON.parse(await AsyncStorage.getItem('logs')) || [];
    const updatedLogs = [newLog, ...existingLogs];
    await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error al guardar log en AsyncStorage:', error);
  }
};

// Función para recuperar los logs
export const getLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem('logs');
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error al recuperar los logs de AsyncStorage:', error);
    return [];
  }
};

// Función para eliminar un log
export const deleteLog = async (timestamp) => {
  try {
    const existingLogs = JSON.parse(await AsyncStorage.getItem('logs')) || [];
    const updatedLogs = existingLogs.filter(log => log.timestamp !== timestamp);
    await AsyncStorage.setItem('logs', JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error al eliminar log de AsyncStorage:', error);
  }
};
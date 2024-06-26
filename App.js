import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Ionicons}  from '@expo/vector-icons'; // Importar iconos de Ionicons de Expo
import ControlPanel from './components/ControlPanel';
import Logs from './components/Logs';
import Scheduler from './components/Scheduler';
import { View, StyleSheet } from 'react-native';
import FixedScheduleScheduler from './components/FixedScheduleScheduler';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'ControlPanel') {
          iconName = 'construct';
        } else if (route.name === 'Scheduler') {
          iconName = 'timer';
        } else if (route.name === 'Logs') {
          iconName = 'menu'; // Cambiado a ios-menu en lugar de ios-list
        }
        else if (route.name === 'fixedScheduler') {
          iconName = 'calendar';
        }
 
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0b4dd1',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="ControlPanel" 
      component={ControlPanel} 
      options={{ title: 'Control' }}
    />
    <Tab.Screen 
      name="Scheduler" 
      component={Scheduler}
      options={{ title: 'Horario temporal' }}
    />
    <Tab.Screen 
      name="fixedScheduler" 
      component={FixedScheduleScheduler}
      options={{ title: 'Horario fijo' }}
        
    />
    <Tab.Screen 
      name="Logs" 
      component={Logs} 
      options={{ title: 'Registros' }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.headerContainer}>
        {/* <Header /> */}
      </View>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={TabNavigator} />
      </Stack.Navigator> 
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#14274d',  // Background color matching the header
  },
});

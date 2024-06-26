import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Control de Luces</Text>
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.navigate('ControlPanel')} style={styles.navItem}>
          <Text style={styles.navLink}>Control</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Logs')} style={styles.navItem}>
          <Text style={styles.navLink}>Registros</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Scheduler')} style={styles.navItem}>
          <Text style={styles.navLink}>Programar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#14274d',
    padding: 20,
    color: 'white',
    textAlign: 'center',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  navItem: {
    marginHorizontal: 15,
  },
  navLink: {
    color: 'white',
    textDecorationLine: 'none',
    fontWeight: 'bold',
  },
});

export default Header;

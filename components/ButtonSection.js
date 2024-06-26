import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const ButtonSection = ({ section, isOn, onToggle, nombre }) => {
    return (
        <Pressable
            style={[styles.button, { backgroundColor: isOn ? 'red' : 'green' }]}
            onPress={() => onToggle(section, !isOn)}
        >
            <Text style={styles.buttonText}>
                {isOn ? `Apagar ${nombre} ` : `Encender ${nombre}`}


            </Text>
            <MaterialCommunityIcons name={isOn ? 'lightbulb-off' : 'lightbulb-on'} size={24} color="white" />

        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        margin: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%', // Ajuste para que los botones ocupen el 40% del ancho del contenedor
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ButtonSection;

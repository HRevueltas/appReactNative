import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import ButtonSection from './ButtonSection';
import { saveLog } from '../helpers/logsService';
import Dialog from './Dialog'; // Asegúrate de importar el componente Dialog

const ControlPanel = () => {
    const [allOn, setAllOn] = useState(false);
    const [sections, setSections] = useState({
        'salones-entrada': false,
        'callejon': false,
        'rectoria-e-informatica': false,
        'preescolar': false,
        // 'bachillerato-1': false,
        // 'bachillerato-2': false,
        // 'restaurante': false,
        // 'pantalla': false
    });

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    const checkAllOn = (sections) => {
        return Object.values(sections).every(isOn => isOn);
    };

    useEffect(() => {
        setAllOn(checkAllOn(sections));
    }, [sections]);

    const handleToggle = (section, isOn) => {
        const command = isOn ? 'encender' : 'apagar';
        fetch(`http://192.168.1.34/toggle?section=${section}&command=${command}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/plain'
            }
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                if (section === 'todas') {
                    setAllOn(isOn);
                    setSections({
                        'salones-entrada': isOn,
                        'callejon': isOn,
                        'rectoria-infor': isOn,
                        'preescolar': isOn,
                        // 'bachillerato-1': isOn,
                        // 'bachillerato-2': isOn,
                        // 'restaurante': isOn,
                        // 'pantalla': isOn
                    });
                } else {
                    setSections(prevSections => {
                        const newSections = {
                            ...prevSections,
                            [section]: isOn
                        };
                        setAllOn(checkAllOn(newSections));
                        return newSections;
                    });
                }

                saveLog(section, isOn ? 'encendida' : 'apagada');
            })
            .catch(error => {
                console.error('Error:', error);
                setDialogMessage(`Error: ${error.message}`);
                setDialogVisible(true);
            });
    };

    return (
        <ScrollView contentContainerStyle={styles.controlPanel}>
            <Text style={styles.title}>Control de luces manual</Text>
            <ButtonSection
                nombre={'Todas'}
                section="todas"
                isOn={allOn}
                onToggle={handleToggle}
            />
            <View style={styles.buttonGrid}>
                <ButtonSection
                    nombre={'Salones de Entrada'}
                    section="salones-entrada"
                    isOn={sections['salones-entrada']}
                    onToggle={handleToggle}
                />
                <ButtonSection
                    nombre={'Callejón'}
                    section="callejon"
                    isOn={sections['callejon']}
                    onToggle={handleToggle}
                />
                <ButtonSection
                    nombre={'Rectoria e Informatica'}
                    section="rectoria-infor"
                    isOn={sections['rectoria-infor']}
                    onToggle={handleToggle}
                />
                <ButtonSection
                    nombre={'Preescolar'}
                    section="preescolar"
                    isOn={sections['preescolar']}
                    onToggle={handleToggle}
                />
                {/* <ButtonSection
                    nombre={'Bachillerato 1'}
                    section="bachillerato-1"
                    isOn={sections['bachillerato-1']}
                    onToggle={handleToggle}
                />
                <ButtonSection
                    nombre={'Bachillerato 2'}
                    section="bachillerato-2"
                    isOn={sections['bachillerato-2']}
                    onToggle={handleToggle}
                />
                <ButtonSection
                    nombre={'Restaurante'}
                    section="restaurante"
                    isOn={sections['restaurante']}
                    onToggle={handleToggle}
                />
                <ButtonSection
                    nombre={'Pantalla'}
                    section="pantalla"
                    isOn={sections['pantalla']}
                    onToggle={handleToggle}
                /> */}
            </View>
            {dialogVisible && (
                <Dialog
                    message={dialogMessage}
                    onClose={() => setDialogVisible(false)}
                />
            )}
        </ScrollView>
    );
};

export default ControlPanel;

const styles = StyleSheet.create({
    controlPanel: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    buttonGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
});

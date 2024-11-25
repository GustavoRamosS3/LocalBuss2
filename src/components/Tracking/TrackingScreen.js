import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import styles from './TrackingScreenStyle.js';

const ROUTE_API_URL = 'https://parseapi.back4app.com/classes/Rota';
const APP_ID = 'arjJzEgN7cooqvlcKclRSbD99VdjMHmrQIptuBMa';
const REST_API_KEY = 'NrywrhYcOsflSr1qg1A7wHulxIS3a8ubUBCVLkil';

export default function TrackingScreen() {
  const [buttonActive, setButtonActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeId, setRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);

  // Função para buscar rotas do banco de dados
  const fetchRoutesFromDatabase = async () => {
    try {
      const response = await fetch(ROUTE_API_URL, {
        method: 'GET',
        headers: {
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-REST-API-Key': REST_API_KEY
        }
      });
      const data = await response.json();
      setRoutes(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
    }
  };

  // Lógica para rastrear a localização
  useEffect(() => {
    if (buttonActive) {
      const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada para acessar a localização.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
        sendLocationUpdate(location.coords);
      };

      getLocation();

      const intervalId = setInterval(getLocation, 3000);
      return () => clearInterval(intervalId);
    }
  }, [buttonActive]);

  const sendLocationUpdate = async (coords) => {
    if (!routeId) {
      console.log('Aguardando seleção de rota...');
      return;
    }

    try {
      const currentDate = new Date().toISOString();

      await fetch(`${ROUTE_API_URL}/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': APP_ID,
          'X-Parse-REST-API-Key': REST_API_KEY
        },
        body: JSON.stringify({
          localAtual: [{ latitude: coords.latitude, longitude: coords.longitude }],
          dateUpdate: { "__type": "Date", "iso": currentDate }
        })
      });

      console.log('Coordenada atualizada para a rota:', selectedRoute?.name);
    } catch (error) {
      console.error('Erro ao enviar atualização de localização:', error.message || error);
    }
  };

  const toggleTracking = () => {
    if (buttonActive) {
      setButtonActive(false);
      setSelectedRoute(null);
      setRouteId(null);
      console.log('Parando o envio de coordenadas.');
    } else {
      // Antes de mostrar o modal, buscar as rotas mais recentes
      fetchRoutesFromDatabase();
      setModalVisible(true);
    }
  };

  const startTracking = () => {
    if (selectedRoute) {
      setButtonActive(true);
      setModalVisible(false);
      setRouteId(selectedRoute.objectId);
      console.log(`Iniciando envio para a rota: ${selectedRoute.name}`);
    } else {
      console.log('Nenhuma rota selecionada.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.roundButton, { backgroundColor: buttonActive ? 'red' : '#2196F3' }]}
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>{buttonActive ? 'Desligar' : 'Ligar'}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Escolha a Rota para o Seu Trajeto</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRoute?.objectId}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  const selected = routes.find(route => route.objectId === itemValue);
                  setSelectedRoute(selected || null);
                }}
              >
                {!selectedRoute && (
                  <Picker.Item label="Clique aqui" value="" />
                )}
                {routes.map((route) => (
                  <Picker.Item
                    key={route.objectId}
                    label={route.name}
                    value={route.objectId}
                  />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={startTracking}
            >
              <Text style={styles.modalButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

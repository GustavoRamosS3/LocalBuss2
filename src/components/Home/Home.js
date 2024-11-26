import React, { useState, useEffect } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './HomeStyle.js';
import { ScrollView } from 'react-native';

const logo = require('../../../assets/L_Azul.png'); // Atualize o caminho conforme necessário

const routeColors = {
  'Cohab/Santa Maria': 'Blue',
  'São Pedro': 'Green',
  'Emilio Gardenal': 'Red',
  'Povo Feliz': 'Purple',
  'São Roque/Bonanza': 'orange',
};

const validColors = [
  'blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink', 'black', 'brown', 'gray', 'cyan', 'magenta',
  'indigo', 'violet', 'teal', 'lime', 'navy', 'maroon', 'beige', 'gold', 'silver', 'coral', 'lavender', 
  'crimson', 'turquoise', 'fuchsia', 'chartreuse', 'tomato', 
'aqua', 'periwinkle', 'plum', 'goldenrod'
];


export default function Home({ navigation, route, setUsuarioLogado, resetLoginState }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [date, setDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [selectedRouteName, setSelectedRouteName] = useState('');
  const [showNewRouteFormModal, setShowNewRouteFormModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteColor, setNewRouteColor] = useState('');
  
  // Adicionando o estado para controlar o modal de rotas predefinidas
  const [showRouteSelectionModal, setShowRouteSelectionModal] = useState(false);

  const nomeUsuario = route.params?.nomeUsuario || 'Usuário'; 

  // Função para sair e voltar para a tela de login
  const handleLogout = async () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleStart = () => {
    if (!hasStarted) {
      setShowRouteSelectionModal(true); // Abre o modal de seleção de rota predefinida
    } else {
      setIsRunning(true);
      startLocationUpdates();
    }
  };

  const startTimer = (name, color) => {
    setRouteName(name);
    const now = new Date();
    setDate(format(now, 'dd-MM-yyyy HH:mm:ss'));
    setIsRunning(true);
    setHasStarted(true);
    setShowRouteSelectionModal(false); // Fecha o modal de seleção
    startLocationUpdates(color);
  };

  const startLocationUpdates = async (color) => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        setLocation(newLocation);
        setRoutePath((prevPath) => [
          ...prevPath,
          {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            color: color,
          },
        ]);
      }
    );
    setLocationSubscription(subscription);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    clearInterval(intervalId);
    setIntervalId(null);
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    saveRoute();
    setTimer(0);
    setHasStarted(false);
  };

  const saveRoute = async () => {
    if (routePath.length === 0) {
      console.error('No coordinates recorded. Path is empty.');
      return;
    }

    const routeId = Math.floor(Math.random() * 1000); 
    const routeData = {
      routeId: routeId,
      name: routeName,
      color: routePath[0].color,
      date: date,
      path: routePath,
      time: formatTime(timer),
    };

    try {
      const response = await fetch('https://parseapi.back4app.com/classes/Rota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': 'arjJzEgN7cooqvlcKclRSbD99VdjMHmrQIptuBMa',
          'X-Parse-REST-API-Key': 'NrywrhYcOsflSr1qg1A7wHulxIS3a8ubUBCVLkil',
        },
        body: JSON.stringify(routeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${response.statusText}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Route saved successfully:', data);
      setRoutePath([]); 
    } catch (error) {
      console.error('Error saving route:', error.message || error);
    }
  };

  const formatTime = (time) => {
    const getSeconds = `${time % 60}`.padStart(2, '0');
    const getMinutes = `${Math.floor(time / 60) % 60}`.padStart(2, '0');
    const getHours = `${Math.floor(time / 3600)}`.padStart(2, '0');
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  // Função de criação de nova rota
  const handleCreateNewRoute = () => {
    if (!newRouteName || !newRouteColor) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const normalizedColor = newRouteColor.toLowerCase();
    const validColor = validColors.includes(normalizedColor) ? normalizedColor : 'black';

    setRouteName(newRouteName);
    setDate(format(new Date(), 'dd-MM-yyyy HH:mm:ss'));
    setIsRunning(true);
    setHasStarted(true);
    setShowRouteSelectionModal(false);
    startLocationUpdates(validColor);
    setShowNewRouteFormModal(false);

    setNewRouteName('');
    setNewRouteColor('');
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.timer}>{formatTime(timer)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePause}>
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setShowNewRouteFormModal(true)}>
        <Text style={styles.buttonText}>Gravar Nova Rota</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListarRotas')}>
        <Text style={styles.buttonText}>Listar Rotas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      {/* Modal de Seleção de Rotas Predefinidas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRouteSelectionModal}
        onRequestClose={() => setShowRouteSelectionModal(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Selecione uma Rota Predefinida</Text>
          {Object.keys(routeColors).map((route, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.button} 
              onPress={() => startTimer(route, routeColors[route])}
            >
              <Text style={styles.buttonText}>{route}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.buttonF} onPress={() => setShowRouteSelectionModal(false)}>
            <Text style={styles.buttonTextF}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal de Cadastro de Nova Rota */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNewRouteFormModal}
        onRequestClose={() => setShowNewRouteFormModal(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Cadastrar Nova Rota</Text>
          <TextInput
            placeholder="Nome da Rota"
            style={styles.input}
            value={newRouteName}
            onChangeText={setNewRouteName}
          />
          <ScrollView contentContainerStyle={styles.colorList} style={{ maxHeight: 250 }}>
            {validColors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setNewRouteColor(color)}
                style={[styles.colorOption, { backgroundColor: color === newRouteColor ? '#ddd' : 'transparent' }]}
              >
                <View style={[styles.colorCircle, { backgroundColor: color }]} />
                <Text style={styles.pickerText}>{color}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={handleCreateNewRoute}>
            <Text style={styles.buttonText}>Criar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

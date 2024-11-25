import React, { useState, useEffect } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './HomeStyle.js';

const logo = require('../../../assets/L_Azul.png'); // Atualize o caminho conforme necessário

const routeColors = {
  'Cohab/Santa Maria': 'Blue',
  'São Pedro': 'Green',
  'Emilio Gardenal': 'Red',
  'Povo Feliz': 'Purple',
  'São Roque/Bonanza': 'orange',
};

const validColors = [
  'blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink', 'black', 'white', 'brown', 'gray', 'cyan', 'magenta',
  'indigo', 'violet', 'teal', 'lime', 'navy', 'maroon', 'beige', 'gold', 'silver', 'peach', 'mint', 'coral', 'lavender'
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
  const [showNewRouteFormModal, setShowNewRouteFormModal] = useState(false); // Novo modal para cadastro de rota
  const [newRouteName, setNewRouteName] = useState(''); // Nome da nova rota
  const [newRouteColor, setNewRouteColor] = useState(''); // Cor da nova rota

  const nomeUsuario = route.params?.nomeUsuario || 'Usuário'; // Obtém o nome do usuário logado

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
      setModalVisible(true); // Abre as opções de rotas predefinidas
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
    setModalVisible(false);
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

    const routeId = Math.floor(Math.random() * 1000); // Gera um número aleatório
    const routeData = {
      routeId: routeId,
      name: routeName,
      color: routePath[0].color, // A primeira coordenada define a cor
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
      setRoutePath([]); // Limpa o caminho após salvar
    } catch (error) {
      console.error('Error saving route:', error.message || error);
    }
  };

  const formatTime = (time) => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = Math.floor(time / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);
    return `${getHours} : ${getMinutes} : ${getSeconds}`;
  };

  const handleCreateNewRoute = () => {
    if (!newRouteName || !newRouteColor) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Verifica se a cor digitada é válida
    const normalizedColor = newRouteColor.toLowerCase();
    const validColor = validColors.includes(normalizedColor) ? normalizedColor : 'black';

    setRouteName(newRouteName); // Atualiza o nome da rota
    setDate(format(new Date(), 'dd-MM-yyyy HH:mm:ss')); // Registra a data
    setIsRunning(true); // Inicia o cronômetro
    setHasStarted(true); // Marca como iniciado
    setModalVisible(false); // Fecha o modal de cadastro
    startLocationUpdates(validColor); // Passa a cor validada para iniciar a rastreabilidade
    setShowNewRouteFormModal(false); // Fecha o modal de cadastro após o cadastro

    // Limpa os campos do formulário
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

      {/* Modal para seleção de rotas predefinidas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Escolha uma rota</Text>
          {Object.keys(routeColors).map((route) => (
            <TouchableOpacity
              key={route}
              style={[styles.button, { backgroundColor: routeColors[route] }]}
              onPress={() => startTimer(route, routeColors[route])}
            >
              <Text style={styles.buttonText}>{route}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Modal para cadastro de novas rotas */}
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
          <TextInput
            placeholder="Cor da Rota (em inglês)"
            style={styles.input}
            value={newRouteColor}
            onChangeText={setNewRouteColor}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateNewRoute}
          >
            <Text style={styles.buttonText}>Criar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

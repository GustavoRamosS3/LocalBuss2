import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './ListarRotasStyle.js'
import { useFocusEffect } from '@react-navigation/native'; // Para atualizar ao focar na tela

// Função para obter a cor da rota
const getRouteColor = (routeName, color) => {
  const routeColors = {
    'Cohab/Santa Maria': '#0000FF', // Azul
    'São Pedro': '#00FF00',        // Verde
    'Emilio Gardenal': '#FF0000',   // Vermelho
    'Povo Feliz': '#800080',        // Roxo
    'São Roque/Bonanza': '#FFA500', // Laranja
  };
  // Se a cor não for uma das predefinidas, usamos a cor que foi retornada pela API ou o valor padrão
  return routeColors[routeName] || color || '#000000'; // Preto como cor padrão
};

export default function ListarRotas({ navigation }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Atualizar lista de rotas ao retornar para a tela
  useFocusEffect(
    React.useCallback(() => {
      fetchRoutes();
    }, [])
  );

  const fetchRoutes = async () => {
    setLoading(true); // Garantir que loading seja ativado novamente
    try {
      const response = await fetch('https://parseapi.back4app.com/classes/Rota', {
        method: 'GET',
        headers: {
          'X-Parse-Application-Id': 'arjJzEgN7cooqvlcKclRSbD99VdjMHmrQIptuBMa',
          'X-Parse-REST-API-Key': 'NrywrhYcOsflSr1qg1A7wHulxIS3a8ubUBCVLkil'
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setRoutes(data.results || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (id) => {
    try {
      const response = await fetch(`https://parseapi.back4app.com/classes/Rota/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Parse-Application-Id': 'arjJzEgN7cooqvlcKclRSbD99VdjMHmrQIptuBMa',
          'X-Parse-REST-API-Key': 'NrywrhYcOsflSr1qg1A7wHulxIS3a8ubUBCVLkil'
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Atualizar lista de rotas após deletar uma rota
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const renderItem = ({ item }) => {
    const routeColor = getRouteColor(item.name, item.color); // Obtendo a cor da rota

    return (
      <TouchableOpacity
        style={styles.routeItem}
        onPress={() => { /* Removido a navegação para 'ExibirCaminho' */ }}
      >
        <View style={[styles.point, { backgroundColor: routeColor }]} />
        <View style={styles.routeInfo}>
          {/* Exibindo as informações da rota */}
          <Text style={styles.routeText}>ID: {item.routeId}</Text>
          <Text style={styles.routeText}>Nome: {item.name}</Text>
          <Text style={styles.routeText}>Cor: {item.color}</Text>
          <Text style={styles.routeText}>Data: {item.date}</Text>
          <Text style={styles.routeText}>Tempo: {item.time}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteRoute(item.objectId)} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista de Rotas</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={routes}
          renderItem={renderItem}
          keyExtractor={(item) => item.objectId}
        />
      )}
      <Button
        title="Voltar para Home"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

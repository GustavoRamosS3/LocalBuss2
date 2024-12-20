import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4', // Fundo suave
  },
  logo: {
    width: 170,
    height: 170,
    marginTop: -90,
    marginBottom: 20,
  },
  date: {
    fontSize: 18,
    color: '#333', // Texto escuro
    top: -36,
  },
  timer: {
    fontSize: 48,
    marginBottom: 20,
    color: '#2e7fed', // Cor do timer
    marginTop: -40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue', // Cor de fundo do botão
    borderRadius: 30, // Bordas arredondadas
    paddingVertical: 15, // Espaçamento vertical
    paddingHorizontal: 25, // Espaçamento horizontal
    margin: 5, // Margem entre botões
    shadowColor: '#000', // Sombra
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Elevação para Android
  },
  buttonTextF: {
    color: 'white', // Cor do texto do botão
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'red',
    borderRadius: 30, // Bordas arredondadas
    paddingVertical: 15, // Espaçamento vertical
    paddingHorizontal: 25, // Espaçamento horizontal
  },
  buttonF: {
    borderRadius: 30, // Bordas arredondadas
    paddingVertical: 15, // Espaçamento vertical
    paddingHorizontal: 25, // Espaçamento horizontal
    margin: 5, // Margem entre botões
    shadowColor: 'red', // Sombra
  },
  logoutButton: {
    backgroundColor: '#e74c3c', // Cor do botão "Sair"
  },
  buttonText: {
    color: 'white', // Cor do texto do botão
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  picker: {
    height: 50,
    width: 150,
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
   
  colorList: {
    paddingVertical: 10,  // Adiciona algum padding para espaçamento entre itens
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5, // Arredondar bordas das opções
    borderWidth: 1,
    borderColor: '#ddd', // Cor de borda
    width: 200,
  },
  colorCircle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
  pickerText: {
    fontSize: 16,
    color: 'black',
  },


});
export default styles;

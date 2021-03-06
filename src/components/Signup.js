import _ from 'lodash';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import validator from 'validator';
import ImagePicker from 'react-native-image-picker';
import {
  Alert,
	StyleSheet,
	TouchableWithoutFeedback,
} from 'react-native';
import { signUp } from '../actions/AuthAction'
import {
    View,
    Button,
    Item,
    Label,
    Input,
    Container,
    Content,
    Form,
    Text,
    Grid,
    Col,
    Picker,
    Thumbnail,
    Spinner
} from 'native-base';
import Dimensions from '../utils/dimensions'
import HeaderView from './HeaderView';
import estados from '../utils/estados'
import applyMask, { brPhone, unMask } from '../utils/maks';
import {colors} from '../theme/global'
import { withNavigation } from 'react-navigation'
import * as firebase from 'firebase'
import uuid from 'uuid/v1'
import moment from 'moment'
import { RESTAURANT } from 'react-native-dotenv'

const options = {
  title: 'Selecione uma foto de perfil',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  holder: {
    padding: Dimensions.padding
  },
  logoTextHolder: {
    alignItems: 'center',
    padding: 20
  },
  logoText: {
    fontSize: 22,
    marginTop: 10
  },
  item: {
    margin: 10
  },
  itemTitle: {
    color: '#666666',
    paddingBottom: 10
  },
  itemContent: {
    paddingLeft: 6,
    paddingBottom: 10
  },
  itemUnderline: {
    flex: 1,
    height: 1,
    backgroundColor: '#cccccc'
  },
  itemRow: {
    flex: 1,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row'
  },
  termsText: {
    marginLeft: 20,
    fontSize: 14,
    color: '#888888'
  },
  signUpButton: {
    marginVertical: 20,
    backgroundColor: colors.button.primary
  },
  signUpButtonText: {
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 10
  },
  loginButtonText: {
    color: '#888888'
  },
  loginButtonTextBold: {
    color: '#888888',
    fontWeight: 'bold'
  },
  logoTextHolder: {
    alignItems: 'center',
    marginTop: 40
  },
  logoText: {
		fontWeight: 'bold',
		padding: 10
	},
	subLabel: {
		textAlign: 'center',
		fontSize: 14,
		color: '#ccc',
		padding: 8
  },
  cepButton: {
    backgroundColor: colors.standardButton
  }
});

class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {

			// user register variables
			location: {},
      profilePhoto: {},
      photo64: '',
      name: '',
      phone: '',
      email: '',
      password: '',
      passwordConf: '',
      enderecoCep: '',
      enderecoLogradouro: '',
      enderecoNumero: '',
      enderecoBairro: '',
      enderecoLocalidade: '',
			enderecoEstado: '',

			// flags
      terms: false,
      isLoading: false
    };
	}
	
	componentDidMount(){
		navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
					location: position,
          error: null,
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }
  
  componentWillMount(nextProps){
    const { currentUser } = this.props
    console.log('current user do will', currentUser)
    if(currentUser && Object.keys(currentUser).length > 0){
      this.setState({
        oldUser: true,
        name: currentUser.name,
        phone:  currentUser.phone,
        email: currentUser.email,
        enderecoNumero: currentUser.addressNumber,
				enderecoLogradouro: currentUser.address,
				enderecoLocalidade: currentUser.city,
        enderecoBairro: currentUser.neighborhood,
        profilePhoto: currentUser.photo64 && currentUser.photo64.length > 0 ? `data:image/png;base64,${currentUser.photo64}` : ''
      })
    }
  }

	getCurrentPosition = () => {
		navigator.geolocation.getCurrentPosition(
			position => {
				const location = JSON.stringify(position);
				console.log('Location', location)
				this.setState({ location });
			},
			error => Alert.alert('Atenção', 'Houve um erro inesperado. Estamos trabalhando para consertá-lo'),
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
		);
	}

  onClickBackButton = () => {
    const { currentUser } = this.props
    return this.props.navigation.navigate(currentUser && Object.keys(currentUser).length > 0 ? 'DashBoard' : 'CEP')
  };

  onClickTermsButton = () => {
    const { history } = this.props;
    history.push(Paths.terms);
  }

  getPhoneNumberWithCountryCode = phone => `+55${phone}`;

  showWarningAlert = (message) => {
    Alert.alert('Atenção', message);
  };

  toggleLoading = (loading) => {
    this.setState({ isLoading: loading });
  }

  validateEmail = email => validator.isEmail(email);

  validateFieldsAndRegister = () => {
    const {
			name,
			phone,
      email,
			password,
      passwordConf,
      enderecoLogradouro,
      enderecoNumero,
      enderecoBairro,
      enderecoLocalidade,
    } = this.state;

    if (name.length < 7) {
      this.showWarningAlert('Nome inválido');
      return;
    }

    let validPhone = false;
    if (phone.length >= 14) {
      validPhone = true;
		}
		
    let validEmail = false;
    if (validator.isEmail(email)) {
      validEmail = true;
    }

    if (!validEmail && !validPhone) {
      this.showWarningAlert('É obrigratório preencher ao menos o telefone ou o e-mail');
      return;
    }

    if (validEmail) {
      if (!validPhone && phone.length > 0) {
        this.showWarningAlert('Telefone inválido');
        return;
      }
    }

    if (validPhone) {
      if (!validEmail && email.length > 0) {
        this.showWarningAlert('E-mail inválido');
        return;
      }
    }

    if (password.length < 4) {
      this.showWarningAlert('Senha inválida');
      return;
		}
    
    //validate only if old user
    if(this.state.oldUser){
      if (enderecoBairro.length < 4) {
        this.showWarningAlert('Bairro inválido');
        return;
      }

      if (enderecoLocalidade.length < 3) {
        this.showWarningAlert('Cidade inválida');
        return;
      }

      if (enderecoLogradouro.length < 5) {
        this.showWarningAlert('Endereço inválido');
        return;
      }

      if (enderecoNumero.length < 1) {
        this.showWarningAlert('Número inválido');
        return;
      }
    }
	
		// TODO RECOVER PASSWORD - CHANGE PASSWORD
    if (password !== passwordConf) {
      this.showWarningAlert('As senhas devem ser iguais');
      return;
    }
		this.signup()
	};
	
	signup = async () => {
    const { 
       photo64,
       location,
       name,
       email,
       phone,
       password,
       } = this.state

		let currentUser = {
      ...this.props.address,
			photo64,
			location,
			name,
      email,
      phone,
      orders: '',
      voucher: ['foods'],
      createdAt: moment().format('DD/MM/YYYY HH:mm:ss'),
      updatedAt: moment().format('DD/MM/YYYY HH:mm:ss'),
    }
    this.setState({ isLoading: true })
    console.log('current user props', currentUser)
    if(this.props.currentUser && Object.keys(this.props.currentUser).length > 0){
      firebase.database().ref(`${RESTAURANT}/users/${this.props.currentUser.userId}`)
        .update({name, email, phone, photo64 })
        .then(() => {
          console.log('User info updated successfully')
          this.setState({ isLoading: false })
          Alert.alert('Atenção', 'Seus dados pessoais foram atualizados com sucesso')
          this.props.signUp(currentUser) // update redux curret user with new info
          this.props.navigation.navigate('DashBoard')
        })
        .catch(err => {
          console.log('Error uptading user info', err)
          this.setState({ isLoading: false })
          Alert.alert('Ops :(', 'Algo deu errado. Tenta novamente mais tarde.')
        })
    } else {
      try {
        await firebase.auth().createUserWithEmailAndPassword(email,password) //creating auth user on firebase auth
          .then(response => {
            console.log('response', response)
            if(response){
              try {
                firebase.database().ref(`${RESTAURANT}/users/${response.user.uid}`).set({
                  ...currentUser,
                  userId: response.user.uid
                }) //creating user on firebase database
                .then(() => {
                  console.log('response creating user database')
                  this.setState({ isLoading: false })
                    this.props.signUp({ ...currentUser,userId: response.user.uid})
                    this.props.navigation.navigate('DashBoard')
                })
                .catch(err => {
                  Alert.alert('Ops :(', 'Algo de errado aconteceu. Tente novamente')
                  this.setState({ isLoading: false })
                  console.log('Error during creation user database', err)
                })
              } catch (err) {
                console.log('Error before creating user firebase databse', err)
              }
            }
          })
          .catch(err => {
            console.log('error firebase auth', err)
            this.setState({ isLoading: false })
            Alert.alert('Ops :(', 'Parece que alguma coisa deu errado. Tente novamente em alguns instantes')
          })
      } catch(err){
        console.log('error before auth', err)
      }
    }
	}

  focusInput(inputField) {
    this[inputField]._root.focus();
  }

  handleSearchCepButtonClick = () => {
    this.setState({ isLoading: true });

    fetch(`https://viacep.com.br/ws/${unMask(this.state.enderecoCep)}/json/`)
      .then(response => response.json())
      .then((response) => {
        if (response.erro) {
          this.setState({
            isLoading: false,
            enderecoLogradouro: '',
            enderecoBairro: '',
            enderecoLocalidade: '',
            enderecoEstado: ''
          }, () => { this.validateCep(response); });
        } else {
          this.setState({
            isLoading: false,
            enderecoLogradouro: response.logradouro,
            enderecoBairro: response.bairro,
            enderecoLocalidade: response.localidade,
            enderecoEstado: response.uf
          });
        }
      })
      .catch((err) => {
        this.setState({
          isLoading: false
        });
      });
	}
	
	selectPhoto = async () => {
		/**
	 * The first arg is the options object for customization (it can also be null or omitted for default options),
	 * The second arg is the callback which sends object: response (more info in the API Reference)
	 */
		await ImagePicker.showImagePicker(options, (response) => {
      console.log('response da photo', response)
			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
        const source = { uri: response.uri };
        console.log('source da photo', source)
				this.setState({
          photo64: response.data,
          profilePhoto: source
				});
			}
    })
    // .then(result => {
    //   console.log('result da promisse', result)
    // })
    // .catch(err => {
    //   console.log('err da photo', err)
    // })
	}

	handleEstadoChange = (estado) => {
		this.setState({ enderecoEstado: estado })
  }
  
  validateCep(response) {
    if (this.state.enderecoCep) {
      if (!unMask(this.state.enderecoCep).match(/^[0-9]{8}$/) || response.erro) {
        Alert.alert('Atenção', 'CEP inválido');
      }
    }
  }

  render() {
    console.log('props', this.state)
    const { isLoading } = this.state;
    const { currentUser } = this.props
    return (
      <Container style={styles.container} pointerEvents={isLoading ? 'none' : 'auto'}>
        <HeaderView
          title={currentUser && Object.keys(currentUser).length > 0 ? 'Minha Conta' : 'Registrar-se'}
          onBack={this.onClickBackButton}
        />
        {isLoading ? (
          <Spinner />
        ) : (
          <Content style={styles.holder} keyboardShouldPersistTaps="handled">
					<View style={{ alignItems: 'center'}}> 
						<Label style={styles.logoText}>Perfil</Label>
						<TouchableWithoutFeedback onPress={this.selectPhoto}>
              <Thumbnail
                large
                source={this.state.profilePhoto && Object.keys(this.state.profilePhoto).length > 0 ? this.state.profilePhoto : require('../assets/img/avatar.png')} />
						</TouchableWithoutFeedback>
						<Text style={styles.subLabel}> Clique e selecione uma foto de perfil </Text>
					</View>
				  <View>
            <Form>
              <Item
                stackedLabel
              >
                <Label>Nome Completo</Label>
                <Input
                  autoCapitalize="words"
                  onChangeText={name => this.setState({ name })}
                  returnKeyType="next"
                  value={this.state.name}
                  onSubmitEditing={() => this.focusInput('phoneInput')}
                />
              </Item>
              <Item
                stackedLabel
              >
                <Label>Telefone</Label>
                <Input
                  ref={(c) => { this.phoneInput = c; }}
                  onSubmitEditing={() => this.focusInput('emailInput')}
                  returnKeyType="next"
                  onChangeText={applyMask(this, 'phone', brPhone)}
                  value={this.state.phone}
                  keyboardType="phone-pad"
                />
              </Item>
              <Item
                stackedLabel
              >
                <Label>E-mail</Label>
                <Input
                  ref={(c) => { this.emailInput = c; }}
                  onSubmitEditing={() => this.focusInput('passwordInput')}
                  returnKeyType="next"
                  autoCapitalize="none"
                  onChangeText={email => this.setState({ email })}
                  value={this.state.email}
                  keyboardType="email-address"
                />
              </Item>
              {/* <Item
                stackedLabel
              >
                <Label>CPF</Label>
                <Input
                  ref={(c) => { this.cpfInput = c; }}
                  onSubmitEditing={() => this.focusInput('passwordInput')}
                  returnKeyType="next"
                  onChangeText={applyMask(this, 'cpf', brCpf)}
                  value={this.state.cpf}
                  keyboardType="number-pad"
                />
              </Item> */}
              <Item
                stackedLabel
              >
                <Label>Senha</Label>
                <Input
                  ref={(c) => { this.passwordInput = c; }}
                  onSubmitEditing={() => this.focusInput('passwordConfirmInput')}
                  returnKeyType="next"
                  secureTextEntry
                  onChangeText={password => this.setState({ password })}
                  value={this.state.password}
                />
              </Item>
              <Item
                stackedLabel
              >
                <Label>Confirmar senha</Label>
                <Input
                  ref={(c) => { this.passwordConfirmInput = c; }}
                  returnKeyType="next"
                  secureTextEntry
                  onChangeText={passwordConf => this.setState({ passwordConf })}
                  value={this.state.passwordConf}
                />
              </Item>
              {/* <View
                style={styles.itemRow}
                onTouchStart={() => this.setState({ terms: !this.state.terms })}
              >
                <CheckBox color="#888888" checked={this.state.terms} />
                <Label style={styles.termsText}>
                  Aceito os termos e condições
                </Label>
              </View> */}
              {/* <View>
                <Button
                  transparent
                  block
                  style={styles.loginButton}
                  onPress={this.onClickTermsButton}
                >
                  <Text style={styles.loginButtonText}>Ver termos e condições</Text>
                </Button>
              </View> */}
            </Form>
            <Button
              block
              style={styles.signUpButton}
              onPress={this.validateFieldsAndRegister}
            >
              <Text style={styles.signUpButtonText}>Finalizar</Text>
            </Button>
          </View>
        </Content>
        )}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.authReducer.currentUser,
  address: state.authReducer.address
})

export default connect(mapStateToProps, { signUp })(withNavigation(RegisterScreen))
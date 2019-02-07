import React, { Component } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { View, Alert } from 'react-native'
import {
	 Content,
	 Form,
	 Item,
	 Input,
	 Label,
	 Button,
	 Text } from 'native-base'
import { withNavigation } from 'react-navigation'
import HeaderView from '../../components/HeaderView'
import VMasker from 'vanilla-masker'
import { MAPS_KEY } from 'react-native-dotenv'
import axios from 'axios';
import geolibe from 'geolib'

class CEPScreen extends Component {

	constructor(props){
		super(props)
		this.state = {
			borderBottomColor: '#fff', 
			cep: '',

			// flags
			fetch: false,
			loading: false,

			// Geolocations
			addressLatitude: '',
			addressLongitude: '',
			userLatitude: '',
			userLongitude: '',

			//address
			addressNumber: '',
			address: '',
			city: '',
			neighborhood: ''
		}
	}
	
	navigate = () => {
		this.props.navigation.navigate('CEP')
	}

	onBack = () => {
		this.props.navigation.goBack()
	}

	handleInput = (param) => {
		this.setState({
			cep: param,
			borderBottomColor: '#e60000'
		})
	}

	mask = (param) => {
		// let unMasked = VMasker(param).unMask()
		let masked = 	VMasker.toPattern(param, "99.999-999"); 
		this.setState({ cep: masked })
	}

	unMask = value => {
    const regex = /[^a-zA-Z0-9]/g;
    return (value || '')
      .toString()
      .replace(regex, '')
      .replace('R', '');
  };

	fetchCep = () => {
		let cep = this.unMask(this.state.cep)
		fetch(`http://viacep.com.br/ws/${cep}/json/`)
		.then(response => response.json())
		.then(response => {
			this.setState({
				address: response.logradouro,
				neighborhood: response.bairro,
				city: response.localidade,
				fetch: true
			})
		})
		axios.get(`http://www.mapquestapi.com/geocoding/v1/address?key=${MAPS_KEY}&location=3636+avenida francisco sa+fortaleza,60310001`)
		.then(response => {
			let userLatitude = response.data.results[0].locations[0].displayLatLng.lat
			let userLongitude = response.data.results[0].locations[0].displayLatLng.lng
			this.setState({ userLongitude, userLatitude })
		})
		.catch(err => {
			console.log(err)
		})
	}

	checkAddress = () => {
		const { addressNumber, city, address, userLatitude, userLongitude, cep } = this.state
		this.setState({ loading: true })
		axios.get(`http://www.mapquestapi.com/geocoding/v1/address?key=${MAPS_KEY}&location=${addressNumber}+${address}+${city},${this.unMask(cep)}`)
			.then(response => {
				let locationLength = response.data.results[0].locations.length
				let addressLatitude = response.data.results[0].locations[locationLength-1].latLng.lat
				let addressLongitude = response.data.results[0].locations[locationLength-1].latLng.lng
				let distance = geolib.getDistance(
					{latitude: userLatitude, longitude: userLongitude},
					{latitude: addressLatitude, longitude: addressLongitude}
			);
			if(distance > 10000){
				Alert.alert('Atenção', 'Infelizmente ainda não cobrimos o endereço informado :(')
			}
			})
			.catch(err => {
				console.log('error', err)
				Alert.alert('Atenção', 'Verifique o endereço informado')
			})
	}
	

	render(){
		return (
			<View style={styles.container}>
				<HeaderView title="Consulta CEP" onBack={this.onBack} />
				<View style={styles.subContainer}>
						{!this.state.fetch ? (
						<View>
								<Text style={styles.cep}> CEP </Text>
								<Item inlineLabel>
									<Input
										value={this.state.cep}
										style={[ styles.input, { borderBottomColor: this.state.borderBottomColor} ]}
										onChangeText={this.mask} />
								</Item>
								<Button block style={ styles.button } onPress={ this.fetchCep }>
									<Text> Consultar </Text>
								</Button>
						</View>
						) : (
							<View style={styles.confirmAddress}>
									<Text style={[styles.cep, { fontSize: 16 }]}> CONFIRME SEU ENDEREÇO </Text>
								<View style={ styles.addressContainer }>
									<View style={{ width: '75%'}}>
										<Item stackedLabel>
											<Label style={styles.label}>Endereço</Label>
											<Input
											 style={styles.inputText}
											 value={this.state.address}
											 onChangeText={(address) => false }
											/>
										</Item>
									</View>
									<View style={{ width: '20%'}}>
										<Item stackedLabel>
											<Label style={styles.label}>No.</Label>
											<Input
											 style={styles.inputText}
											 value={this.state.addressNumber}
											 onChangeText={(addressNumber) => this.setState({ addressNumber }) }
											/>
										</Item>
									</View>
								</View>
								<View style={ styles.addressContainer }>
									<View style={{ width: '60%'}}>
										<Item stackedLabel>
											<Label style={styles.label}>Bairro</Label>
											<Input
											 style={styles.inputText}
											 value={this.state.neighborhood}
											 onChangeText={(neighborhood) => false}
											/>
										</Item>
									</View>
									<View style={{ width: '35%'}}>
										<Item stackedLabel>
											<Label style={styles.label}>Cidade</Label>
											<Input
											 style={styles.inputText}
											 value={this.state.city}
											 onChangeText={(city) => false}
											/>
										</Item>
									</View>
								</View>
								<View style={{ width: '90%' }}>
									<Button block style={ [styles.button, { marginVertical: 10 }] } onPress={ this.checkAddress }>
										<Text> Confirmar </Text>
									</Button>
									<Button block style={ [styles.button, { backgroundColor: '#ffcc00', marginVertical: 10}] } onPress={ () => this.setState({ fetch: !this.state.fetch, cep: '' }) }>
										<Text> ENDEREÇO ERRADO? </Text>
									</Button>
								</View>
							</View>
						)}
						
				</View>
			</View>
		)
	}
}



const styles = { 
	loginScreen: {
		width: '100%',
		height: '100%',
	},
	container: {
		flex: 1,
	},
	subContainer: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 20
	},
	loginForm: {
		paddingVertical: 20
	},
	button: {
		marginVertical: 40,
		backgroundColor: '#e60000'
	},
	label: {
		color: '#fff',
		fontSize: 15,
		fontWeight: '700'
	},
	input: {
		color: '#000',
		fontSize: 21,
		fontWeight: '600',
		borderBottomWidth: 1,
		textAlign:'center'
	},
	footer: {
		color: '#e60000',
		fontSize: 13.5,
		fontWeight: '600',
		textAlign: 'center',
		padding: 10
	},
	cep: {
		color: '#e60000',
		fontSize: 20,
		fontWeight: '600',
		textAlign: 'center',
		padding: 10
	},
	addressContainer: {
		// flex: 0.5,
		// width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	confirmAddress: {
		flex: 1,
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	inputText: {
		fontSize: 14,
		color: '#000',
		textAlign: 'right',
		fontWeight: '400'
	},
	label: {
		fontSize: 16,
		color: '#e60000',
		fontWeight: '700'
	}
}

export default withNavigation(CEPScreen)
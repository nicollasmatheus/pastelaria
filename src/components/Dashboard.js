import React, { Component } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  AsyncStorage
} from "react-native";

import {
  Header,
  Body,
  Left,
  Right,
  Title,
  Icon,
  Drawer,
  Button,
  Container,
  Thumbnail
} from "native-base";

import SideBar from "./Sidebar";
import getSideBarItems from "./SidebarItems";
import {colors} from "../theme/global";
import FooterView from "./FooterView.js";
// import { onSignOut, isSignedIn } from "../services/auth.js";
import { connect } from "react-redux";
import { logOut } from "../actions/AuthAction.js";
import { withNavigation } from "react-navigation";
import HomeScreen from "../screens/HomeScreen";
import ChartScreen from "../screens/ChartScreen";
import OrderScreen from "../screens/OrderScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import PaymentScreen from "../screens/PaymentScreen";
import * as firebase from 'firebase'

class Dashboard extends Component {
  constructor(props){
    super(props)
    this.state = {
      loading: false,
    }
  }
  closeDrawer = () => {
    this.drawer._root.close();
  };

  openDrawer = () => {
    this.drawer._root.open();
  };

  handleSignOutButton = async () => {
    this.setState({ loading: true })
    try {
			await firebase.auth().signOut()
				.then(() => {
          this.setState({ loading: false })
          this.props.logOut() // reset currentUser
					this.props.navigation.navigate('Login')
				})
				.catch(err => {
					Alert.alert('Ops :(','Algo de errado aconteceu. Tente novamente em alguns instantes')
					console.log('Erro while logout firebase', err)
					this.setState({ loading: false })
				})
		}	catch (err) {	
			Alert.alert('Ops :(','Algo de errado aconteceu. Tente novamente em alguns instantes')
			console.log('Error before logout firebase', err)
		}
  };

  handleUserButton = () => {
    this.props.navigation.navigate('Signup')
  }

  handleAddressButton = () => {
    this.props.navigation.navigate('CEP')
  }

  renderScreen(){
		const { tab } = this.props
		switch(tab){
			case 'home':
				return <HomeScreen />
			case 'chart':
				return <ChartScreen />
			case 'order':
				return <OrderScreen />
      case 'orderDetail':
        return <OrderDetailScreen />
      case 'payment':
        return <PaymentScreen />
			default:
				return <HomeScreen />
		}
  }

  renderTabTitle = tab => {
    switch(tab){
			case 'home':
				return 'Cardápio'
			case 'chart':
				return 'Carrinho'
			case 'order':
				return 'Pedidos'
      case 'orderDetail':
        return 'Detalhes pedido'
      case 'payment':
        return 'Formas de pagamento'
			default:
				return 'Cardápio'
		}
  }

  render() {
    const { tab } = this.props
    console.log("props DA DASHBOARD", this.props);
    return (
      <Drawer
        panOpenMask={0.15}
        ref={ref => {
          this.drawer = ref;
        }}
        onClose={() => this.closeDrawer}
        content={<SideBar sideBarItems={getSideBarItems(this)} />}
      >
        <Container style={styles.container}>
          <Header style={styles.header}>
            <Left>
              <Button transparent onPress={this.openDrawer}>
                <Icon name="menu" />
              </Button>
            </Left>
            <Body>
              <Title style={styles.headerTitle}>{this.renderTabTitle(tab)}</Title>
            </Body>
            <Right />
          </Header>
          {this.renderScreen()}
          <FooterView />
        </Container>
      </Drawer>
    );
  }
}

const mapStateToProps = state => ({
  token: state.authReducer.loginToken,
  tab: state.navigation.tab,
  currentUser: state.authReducer.currentUser
});

export default connect(
  mapStateToProps,
  { logOut }
)(withNavigation(Dashboard));

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    backgroundColor: colors.header.primary
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeigth: '500',
    textAlign: 'center'
  }
};

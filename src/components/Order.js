import React, { Component } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  AsyncStorage,
  SectionList,
  View,
  TouchableWithoutFeedback
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
  Spinner,
  Content
} from "native-base";

import SideBar from "./Sidebar";
import getSideBarItems from "./SidebarItems";
import {colors} from "../theme/global";
import FooterView from "./FooterView.js";
// import { onSignOut, isSignedIn } from "../services/auth.js";
import { connect } from "react-redux";
import { logOut } from "../actions/AuthAction.js";
import { withNavigation } from "react-navigation";
import { tabNavigator } from "../actions/Navigation"

class Order extends Component {

  _renderOrderHeader = (param) => {
		return (
			<View style={styles.modalItemSize}>
				<Text style={styles.modalItemsOptions}>{param.title}</Text>
			</View>
		)
  }
  
  _renderOrderContent = (item) => {
		return (
			<TouchableWithoutFeedback onPress={() => this._orderDetail(item)}>
					<View style={[styles.item, { 	flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }]}>
						<View style={styles.dateContainer}>
							<Text style={styles.title}>{item.dateDay}</Text>
							<Text style={styles.title}>{item.dateMonth}</Text>
						</View>
            <View style={{ marginHorizontal: 5 }}>
              <Text style={styles.orderNumber}>Pedido #{item.title}</Text>
              <Text style={styles.itemText}>{item.chart[0].itemQuantity}x {item.chart[0].item}</Text>
            </View>
            <View style={{ marginHorizontal: 5 }}>
              <Text style={styles.orderDetails}>Detalhes</Text>
            </View>
					</View>
			</TouchableWithoutFeedback>
		)
  }

  // _itemTitle = (item) => {
  //   return item.map(item => {

  //   })
  // }
  
  _orderDetail = (item) => {
    return this.props.tabNavigator('orderDetail', item)
  }

  _renderOrder = () => {
		const { allOrders } = this.props
		if(allOrders && allOrders.length > 0){
			return (
				<SectionList
					sections={[
            {title: '', data: [
              {title: '5234', 
              dateDay: '06',
              dateMonth: 'Mar',
              chart: [{itemQuantity: 2, item: 'Pastelao Azul'}, {itemQuantity: 1, item: 'Pastelao Verde'}],
              // customer: { address: 'Rua Erico Mota', addressNumber: 489, addressNe}
            },
            ]},
            {title: '', data: [
              {title: '6503', 
              dateDay: '05',
              dateMonth: 'Mar',
              chart: [{itemQuantity: 2, item: 'Pastelao Azul'}, {itemQuantity: 1, item: 'Pastelao Verde'}]},
            ]},
				  ]}
				renderSectionHeader={ ({section}) =>  this._renderOrderHeader(section) }
				renderItem={ ({item, index}) => this._renderOrderContent(item, index, 'size') }
				keyExtractor={ (item, index) => index }
			/>
		 )
		} else {
			return <Text style={styles.emptyOrder}> Nenhum pedido :( </Text>
		}
	}


  render() {
    console.log("props do order", this.props);
    return (
     <Container>
         <Content>
             {/* {this._renderOrder()} */}
             <SectionList
					sections={[
					{title: '', data: [
						{title: '5235', 
						dateDay: '06',
						dateMonth: 'Mar',
						chart: [{itemQuantity: 2, item: 'Pastelao Azul'}, {itemQuantity: 1, item: 'Pastelao Verde'}]},
					]},
					{title: '', data: [
						{title: '6503', 
						dateDay: '05',
						dateMonth: 'Mar',
						chart: [{itemQuantity: 2, item: 'Pastelao Azul'}, {itemQuantity: 1, item: 'Pastelao Verde'}]},
					]},
				]}
				renderSectionHeader={ ({section}) =>  this._renderOrderHeader(section) }
				renderItem={ ({item, index}) => this._renderOrderContent(item, index, 'size') }
				keyExtractor={ (item, index) => index }
			/>
         </Content>
     </Container>
    );
  }
}

const mapStateToProps = state => ({
  allOrders: state.order.allOrders
});

export default connect(
  mapStateToProps,
  { tabNavigator }
)(withNavigation(Order));

const styles = {
  container: {
    flex: 1,
		backgroundColor: "#fff",
		justifyContent: "center",
  },
  header: {
    backgroundColor: colors.header.primary
	},
	sectionHeaderTitle:{
		fontSize : 15,
		color: '#000',
		fontWeight: '600',
		borderBottomColor: '#ccc',
		borderBottomWidth: 0.4,
		// marginVertical: 14,
		paddingVertical: 12.5,
		marginHorizontal: 10,
 	},
	SectionListItems:{
		fontSize : 16,
		padding: 6,
		color: '#000',
		backgroundColor : '#F5F5F5'
	},
	item: {
		padding: 10,
		marginHorizontal: 10,
		borderBottomColor: '#ccc',
		borderBottomWidth: 0.4
	},
	price: {
		marginVertical: 9.5
	},
	title: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
	},
	modal: {
		flex: 1,
		backgroundColor: '#fff'
	},
	icon: {
		alignSelf: 'flex-end',
		margin: 9
	},
	modalTitle: {
		fontSize: 15.6,
		fontWeight: '500',
		textAlign: 'center',
		paddingBottom: 10,
		color: '#000'
	},
	modalContainer: {
		flex: 0.1,
		marginLeft: 10
	},
	modalItemSize: {
	},
	modalItemsOptions: {
		fontSize: 13.5,
		fontWeight: '500',
		color: '#8c8c8c'
	},
	modalMandatory: {
		backgroundColor: '#404040',
		color: '#fff',
		fontSize: 10,
		textAlign: 'right',
		marginRight: 5,
		padding: 3,
		fontWeight: '500',
		borderRadius: 4.5
	},
	modalItemOptionsFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	modalItemOptionsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 20,
		flex: 1,
		// width: '100%',
	},
	includeContainer: {
		// width: '50%',
		padding: 5,
		paddingHorizontal: 5,
		flex: 0.7,
		borderRadius: 5,
		borderColor: '#d9d9d9',
		borderWidth: 1.2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	addOrderContainer: {
		backgroundColor: colors.primary,
		// width: '50%'
	},
	addOrderSubContainer: {
		padding: 10,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	add: {
		fontSize: 20,
		padding: 3,
		color: colors.primary
	},
	minus: {
		fontSize: 20,
		padding: 3,
		color: colors.primary
	},
	addText: {
		color: '#fff',
		fontSize: 13.5,
		marginHorizontal: 3.5,
		fontWeight: '500',
  },
  dateContainer: {
    width: '16%',
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '300',
    padding: 3
  },
  orderNumber: {
    color: '#000',
    fontSize: 15.5,
    fontWeight: '500',
    padding: 2,
  },
  orderDetails: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'right'
  },
  emptyOrder: {
    textAlign: 'center',
    fontSize: 14,
    color: '#808080',
    padding: 30
  },
};
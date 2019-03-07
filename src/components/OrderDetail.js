import React, { Component } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  AsyncStorage,
  View,
  Image
} from "react-native";

import {
  Spinner,
  Content,
  Input
} from "native-base";

import {colors} from "../theme/global";
import FooterView from "./FooterView.js";
// import { onSignOut, isSignedIn } from "../services/auth.js";
import { connect } from "react-redux";
import { logOut } from "../actions/AuthAction.js";
import { withNavigation } from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome5";
import _ from "lodash"
import { setChart } from "../actions/ChartAction.js";
import { tabNavigator } from "../actions/Navigation"
import { submitOrder, setOrder } from "../actions/OrderAction"
import uuid from 'uuid'

class Chart extends Component {

  constructor(props){
    super(props)
    this.state = {
      totalPrice: 0,
      totalPriceWithDelivery: 0,
      couponCode: '',
    }
  }

  componentWillReceiveProps(nextProps){
    let { chart } = nextProps
    let totalPriceArray = []
    let totalPrice = 0
    if(chart && chart.length > 0) {
      return chart.map(itemChart => totalPrice = totalPrice + parseFloat(itemChart.itemPrice))
        
        // this.setState({ totalPrice: parseFloat(this.state.totalPrice) + parseFloat(itemChart.itemPrice)},
          // () => this.setState({ totalPriceWithDelivery: parseFloat(this.state.totalPrice) + 0})
          //at this moment we should sum with Frete. Waiting for customer business estrategy for frete
      }
      console.log('total price', totalPrice)
      this.setState({totalPrice})
    }

  _renderChart = () => {
    let { chart } = this.props
    if(chart && chart.length > 0) {
      return chart.map(itemChart => {
        return (
          <View style={styles.orderContainer}>
            <View style={styles.orderSubContainer}>
              <View style={styles.leftOrder}>
                <Text style={styles.leftOrderText}>
                  {itemChart.itemQuantity}x {itemChart.item}
                </Text>
                {this._renderSubItems(itemChart)}
              </View>
              <View style={styles.rightOrder}>
                <Text style={styles.rightOrderText}>
                  R$ {itemChart.itemPrice}
                </Text>
              </View>
            </View>
          </View>
        )
      })
    }
  }

  _renderSubItems = (param) => {
    if(param.itemIngredientDescription && param.itemIngredientDescription.length > 0){
      return param.itemIngredientDescription.map(itemExtraDescription => {
        return (
          <Text style={styles.leftOrderTextSubItemDescription}>- {itemExtraDescription}</Text>
        )
      })
    }
  }

  _renderSubChart = (fullPrice) => {
    const { chart } = this.props
    if(chart && chart.length > 0){
      return (
        <View>
          <View style={styles.orderSubContainer}>
            <View style={styles.leftOrder}>
              <Text style={styles.leftOrderTextSubItemDescription}>Subtotal</Text>
              <Text style={styles.leftOrderTextSubItemDescription}>Taxa de Entrega</Text>
              <Text style={styles.leftOrderTotalText}>Total</Text>
            </View>
            <View style={styles.leftOrder}>
              <Text style={[styles.leftOrderTextSubItemDescription, { textAlign: 'right'}]}>R$ {fullPrice}</Text>
              <Text style={[styles.leftOrderTextSubItemDescription, { color: colors.text.free, textAlign:'right' }]}>Grátis</Text>
              <Text style={[styles.leftOrderTotalText, { textAlign: 'right' }]}>R$ {fullPrice}</Text>
            </View>
          </View>
          <View style={styles.couponContainer}>
            <View style={styles.couponCodeContainer}>
              <Text style={[styles.leftOrderTextSubItemDescription, { fontSize: 18, fontWeight: '400', marginTop: 10 }]}>
                Endereço de entrega
              </Text>
          </View>
        </View>
			</View>
      )
    }
  }

  submitOrder = () => {
    Alert.alert('Hmmmmm', 'Seu pedido foi realizado com sucesso! Acompanhe o status de seu pedido na aba Pedidos')
    const { chart, customer } = this.props
    const { totalPrice, totalPriceWithDelivery, couponCode } = this.state
    const orderNumber = Math.floor(Math.random() * 10001)
    const orderID = uuid()
    const order = {
      orderNumber,
      orderID,
      chart,
      totalPrice,
      totalPriceWithDelivery,
      couponCode,
      customer,
    }
    const orderForDetails = {
      title: orderNumber, data: [order]
    }
    console.log('order to send', order)
    this.props.submitOrder(order) // current order only
    this.props.setOrder([...this.props.allOrders, orderForDetails]) // set all orders for order view section list
    this.props.setChart({}) // make empty chart again
    this.props.tabNavigator('order') //navigate to orders
  }

  render() {
    console.log("props", this.props, this.state.totalPrice);
    const { chart } = this.props   
    let totalPrice = 0
    chart.map(itemChart => {
      totalPrice = parseFloat(totalPrice) + parseFloat(itemChart.itemPrice)
    })
    return (
      <View style={styles.container}>
        {/* <View style={styles.deliverContainer}>
          <Text style={styles.deliverText}>ENTREGAR EM: </Text>
          <Text style={styles.addressText}>{`${this.props.address.address}, ${this.props.address.addressNumber}`}</Text>
        </View> */}
         <Content>
           {this._renderChart()}
           {this._renderSubChart(totalPrice)}
         </Content>
     </View>
    );
  }
}
const mapStateToProps = state => ({
  chart: state.chart.chart,
  address: state.authReducer.currentUser,
  customer: state.authReducer.currentUser,
  allOrders: state.order.allOrders
});

export default connect(
  mapStateToProps,
  { logOut, setChart, submitOrder, tabNavigator }
)(withNavigation(Chart));

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    backgroundColor: colors.header.primary
  },
  deliverContainer: {
    flex: 0.1,
    backgroundColor: colors.primary,
    padding: 10
  },
  deliverText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff'
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffd11a'
  },
  orderContainer: {
    flex: 1,
    marginVertical: 15
  },
  orderSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  leftOrder: {
    width: '45%',
    padding: 10
  },
  rightOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '45%',
    padding: 10
  },
  emptyChart: {
    textAlign: 'center',
    fontSize: 14,
    color: '#808080',
    padding: 30
  },
  leftOrderText: {
    fontSize: 15, 
    color: '#000',
    fontWeight: '300'
  },
  rightOrderText: {
    fontSize: 15, 
    color: '#000',
    fontWeight: '300',
    textAlign: 'center'
  },
  leftOrderTextSubItemDescription: {
    fontSize: 13,
    color: '#808080'
  },
  addMore: {
    color: colors.primary,
    fontSize: 14.5,
    textAlign: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    fontWeight: '400'
  },
  addMoreContainer: {
    
  },
  leftOrderTotalText: {
    fontSize: 18,
    padding: 8,
    color: '#000',
    fontWeight: '600'
  },
  couponContainer: {
    flex: 1,
    borderBottomWidth: 10,
    borderBottomColor: '#f2f2f2',
    borderTopWidth: 10,
    borderTopColor: '#f2f2f2',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  couponCodeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  submitCoupon: {
    color: colors.primary,
    textAlign: 'center',
    padding: 5,
    fontSize: 14,
  },
  inputCoupon: {
    fontSize: 13,
    color: "#ccc"
  },
  finish: {
    marginVertical: 15,
    backgroundColor: colors.primary,
    marginHorizontal: 10,
    borderRadius: 2
  },
  finishText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: '500',
    padding: 10,
    textAlign: 'center'
  }
};
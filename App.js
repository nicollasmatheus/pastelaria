import React, {Component} from 'react';
import EntryPoint from './src/index'
import AppContainer from './src/routes/index'
import { Provider } from 'react-redux';
import { Store }  from './src/store';
import * as firebase from 'firebase'
import { firebaseConfig } from './src/service/firebase'

export default class App extends Component{

  componentWillMount(){
    // avoid multiples firebase call
   !firebase.apps.length ? firebase.initializeApp(firebaseConfig()) : firebase.app();
  }
  render() {
    return (
      <Provider store={Store}>
        <AppContainer />
      </Provider>
    )
  }
}

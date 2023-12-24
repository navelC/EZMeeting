import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Home, Register, SwitchRoom } from './Component';
import "./App.scss"
import 'bootstrap/dist/css/bootstrap.css'
import Header from './Layout/Header/Header';
import Layout from './Layout/Layout/Layout';

class App extends Component {	
	render() {
		const isRoom = window.location.href.includes("/room/")
		console.log(isRoom)
		const Comp = !isRoom?
		(
			<div className='wrap'>
				<div className='cntainer'>
					<Router>
						<Header />
						<Switch>
							<Route path="/" exact component={Home} />
							<Route path="/room/:url" exact component={SwitchRoom} />
							<Route path="/home/login" component={() => <Register isLogin/>} />
							<Route path="/home/register" component={Register} />
						</Switch>
					</Router>
				</div>
			</div>
		):
		(
			<Router>
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/room/:url" exact component={SwitchRoom} />
					<Route path="/home/login" component={() => <Register isLogin/>} />
					<Route path="/home/register" component={Register} />
				</Switch>
			</Router>
		)
		
		return <Layout>{Comp}</Layout>
	}
}

export default App;
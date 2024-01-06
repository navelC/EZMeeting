import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Home, Register, SwitchRoom } from './Component';
import "./App.scss"
import 'bootstrap/dist/css/bootstrap.css'
import Header from './Layout/Header/Header';
import Layout from './Layout/Layout/Layout';

class App extends Component {
	constructor(props){
		super(props)
		this.state = {
			user: JSON.parse(localStorage.getItem('user')),
		}
	
	}
	setUser = (user) => {
		this.setState({user})
	}

	render() {
		const isRoom = window.location.href.includes("/room/")
		const Comp = !isRoom?
		(
			<div className='wrap'>
				<div className='cntainer'>
					<Router>
						<Header user={this.state.user}/>
						<Switch>
							<Route path="/" exact component={(props) => <Home user={this.state.user} context={props}/>} />
							<Route path="/room/:url" exact component={(props) => <SwitchRoom user={this.state.user} context={props}/>} />
							<Route path="/login" component={(props) => <Register mode={1} setUser={this.setUser} context={props}/>} />
							<Route path="/register" component={(props) => <Register mode={2} setUser={this.setUser} context={props} />} />
							<Route path="/user" component={(props) => <Register mode={3} setUser={this.setUser} user={this.state.user} context={props} />} />
						</Switch>
					</Router>
				</div>
			</div>
		):
		(
			<Router>
				<Switch>
				<Route path="/" exact component={(props) => <Home user={this.state.user} context={props}/>} />
					<Route path="/room/:url" exact component={(props) => <SwitchRoom user={this.state.user} context={props}/>} />
					<Route path="/login" component={(props) => <Register mode={1} setUser={this.setUser} context={props}/>} />
					<Route path="/register" component={(props) => <Register mode={2} setUser={this.setUser} context={props} />} />
					<Route path="/user" component={(props) => <Register mode={3} setUser={this.setUser} context={props} />} />
				</Switch>
			</Router>
		)
		
		return <Layout>{Comp}</Layout>
	}
}

export default App;
import React, { Component } from 'react';
import { Input, Button } from '@material-ui/core';
import "./Home.scss"
import io from 'socket.io-client'
// import uniqid from 'uniqid';
import UserProfile from '../../storage'

class Home extends Component {
  	constructor (props) {
		super(props)
		this.state = {
			url: '',
			disabled: [true, !this.props.user],
			name: '',
			isLogin: !!this.props.user,
		}
	}

	handleChange = (e, type) => {
		let disabled = this.state.disabled
		if(e.target.value){
			disabled[type] = false
		}
		else disabled[type] = true
		switch(type){
			case 0:
				this.setState({ url: e.target.value, disabled })
				break
			case 1:
				this.setState({ name: e.target.value, disabled })
				break
			default:
				break
		}
		
	}

	join = () => {
		var url = this.state.url.split("/")
		window.location.href = `/room/${url[url.length-1]}`
	}

	create = () => {
		// var url = uniqid();
		UserProfile.setName(this.state.name)
		const server_url = "http://localhost:4001"
		// window.location.href = `/room/${url}`
		const socket = io.connect(server_url, { secure: true })
		socket.on('new-room', (path) => {
			window.location.href = path
		})
		socket.emit('new-room', this.props.user?.userID || -1)
	}

	render() {
		return (
			<div className="container2">	
				<div style={{ maxWidth: "60%", marginRight: 'auto', marginLeft: 'auto'}}>
					<p style={{ fontSize: "42px" }}>Video conference website that lets you stay in touch with all your friends.</p>
				</div>

				<div className='content'>
					<div className='box'>
						<Input placeholder="Enter a code" onChange={e => this.handleChange(e, 0)} />
						<Button disabled={this.state.disabled[0]} variant="contained" color="primary" onClick={this.join} >Join meeting</Button>
					</div>
					<div className='box'>
						{!this.state.isLogin && (<Input placeholder="Enter your name" onChange={e => this.handleChange(e, 1)} />)} 
						<Button disabled={this.state.disabled[1]}variant="contained" color="primary" onClick={this.create} >New Meeting</Button>
					</div>
				</div>
			</div>
		)
	}
}

export default Home;
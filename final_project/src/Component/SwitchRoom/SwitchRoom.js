import React, { Component } from 'react'
 
import WaitingRoom from '../WaitingRoom/WaitingRoom'
import LiveRoom from '../LiveRoom/LiveRoom'
import UserProfile from '../../storage';
import io from 'socket.io-client'
const server_url = "http://localhost:4001"

class SwitchRoom extends Component {
	socket;
	constructor(props) {
		super(props)
		this.requestJoin = this.requestJoin.bind(this);
		this.state = {
			isInWaitingRoom: true,
			name: UserProfile.getName(),
			isLoading: false,
			isDenied: false
		}
		this.checkRoom()
	}
	
	checkRoom = () => {
		this.socket = io.connect(server_url, { secure: true })
		const url = window.location.href
		this.socket.on('check-room', (existRoom, isAdmin) => {
			if(existRoom){
				if(isAdmin) this.setState({isInWaitingRoom: false})
			}
			else {
				alert('room does not exist')
				window.location.href = '/'
			}
		})
		this.socket.on('request-response', (isAllowed) => {
			if(isAllowed) this.setState({isInWaitingRoom: false})
			else this.setState({isDenied: true})
		})
		this.socket.emit('check-room',url, this.props.user?.userID || -1)
	}

    requestJoin = () => {
		console.log('request')
		this.setState({isLoading: true})
		this.socket.emit('request-join',window.location.href, this.props.user?.userID || -1, this.state.name || UserProfile.getName())
	}

	render() {
		console.log(UserProfile.getName())
		return (
			<div>
				{(this.state.isInWaitingRoom)?
					<WaitingRoom user={this.props.user} switch={this.requestJoin} isLoading={this.state.isLoading} isDenied={this.state.isDenied}/>
					:
					<LiveRoom user={this.props.user}/>
				}
			</div>
		)
	}
}

export default SwitchRoom
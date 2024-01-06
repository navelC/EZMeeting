import React, { Component } from 'react'
 
import WaitingRoom from '../WaitingRoom/WaitingRoom'
import LiveRoom from '../LiveRoom/LiveRoom'
import UserProfile from '../../storage';
import io from 'socket.io-client'
const server_url = "http://localhost:4001"

class SwitchRoom extends Component {
	constructor(props) {
		super(props)

		this.SwitchRoom = this.SwitchRoom.bind(this);
		this.state = {
			isInWaitingRoom: true,
			name: UserProfile.getName()
		}
		this.checkRoom()
	}
	
	checkRoom = () => {
		const socket = io.connect(server_url, { secure: true })
		const url = window.location.href
		socket.on('check-room', (existRoom, isAdmin) => {
			if(existRoom){
				if(isAdmin) this.SwitchRoom()
			}
			else {
				alert('room does not exist')
				window.location.href = '/'
			}
		})
		socket.emit('check-room',url, this.props.user?.userID || -1)
	}

    SwitchRoom = () => {this.setState({ isInWaitingRoom: false })}

	render() {
		console.log(UserProfile.getName())
		return (
			<div>
				{(UserProfile.getName() || !this.state.isInWaitingRoom)?
					<LiveRoom user={this.props.user}/>
					:
					<WaitingRoom user={this.props.user} switch={this.SwitchRoom} />
				}
			</div>
		)
	}
}

export default SwitchRoom
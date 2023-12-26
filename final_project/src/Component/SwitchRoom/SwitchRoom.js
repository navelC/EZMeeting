import React, { Component } from 'react'
 
import WaitingRoom from '../WaitingRoom/WaitingRoom'
import LiveRoom from '../LiveRoom/LiveRoom'
import UserProfile from '../../storage';

class SwitchRoom extends Component {
	constructor(props) {
		super(props)

		this.SwitchRoom = this.SwitchRoom.bind(this);
		this.state = {
			isInWaitingRoom: true,
		}
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
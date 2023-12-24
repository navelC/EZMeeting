import React, { Component } from 'react'
import io from 'socket.io-client'

import {IconButton, Badge, Input, Button} from '@material-ui/core'
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import CallEndIcon from '@material-ui/icons/CallEnd'
import ChatIcon from '@material-ui/icons/Chat'

import { message } from 'antd'
import 'antd/dist/antd.css'

import { Row } from 'reactstrap'
import Modal from 'react-bootstrap/Modal'

import "./LiveRoom.scss"
import UserProfile from '../../storage'
import { UserFrameHelper } from '../../Helper'
import { IconCustom } from './IconCustom'
import { PeopleAlt } from '@material-ui/icons'
import { RollCall } from './RollCall'

const server_url = "http://localhost:4001"

var connections = {}
const peerConnectionConfig = {
	'iceServers': [
		// { 'urls': 'stun:stun.services.mozilla.com' },
		{ 'urls': 'stun:stun.l.google.com:19302' },
	]
}
var socket = null
var socketId = null

class LiveRoom extends Component {
	constructor(props) {
		super(props)

		this.localVideoref = React.createRef()
		this.videoAvailable = false
		this.audioAvailable = false
		this.state = {
			video: false,
			audio: false,
			screen: false,
			showModal: false,
			screenAvailable: false,
			messages: [],
			message: "",
			newmessages: 0,
			username: UserProfile.getName(),
			showUserModal : false,
			listUser : [],
			isAdmin: false
		}
		connections = {}
		this.getPermissions()
	}
	componentDidMount(){
		this.getUserMedia()
		this.connectToSocketServer()
	}

	getPermissions = async () => {
		try{
			console.log('getperrmiss')
			await navigator.mediaDevices.getUserMedia({ video: true })
				.then(() => this.videoAvailable = true)
				.catch(() => this.videoAvailable = false)

			await navigator.mediaDevices.getUserMedia({ audio: true })
				.then(() => this.audioAvailable = true)
				.catch(() => this.audioAvailable = false)
			if (navigator.mediaDevices.getDisplayMedia) {
				this.setState({ screenAvailable: true })
			} else {
				this.setState({ screenAvailable: false })
			}
			this.setState({
				video: this.videoAvailable,
				audio: this.audioAvailable
			})
			if (this.videoAvailable || this.audioAvailable) {
				navigator.mediaDevices.getUserMedia({ video: this.videoAvailable, audio: this.audioAvailable })
					.then((stream) => {
						window.localStream = stream
						this.localVideoref.current.srcObject = stream
					})
					.then((stream) => {})
					.catch((e) => console.log(e))
			}
		} catch(e) { console.log(e) }
	}

	getUserMedia = () => {
		if ((this.state.video && this.videoAvailable) || (this.state.audio && this.audioAvailable)) {
			navigator.mediaDevices.getUserMedia({ video: this.state.video, audio: this.state.audio })
				.then(this.getUserMediaSuccess)
				.then((stream) => {})
				.catch((e) => console.log(e))
		} else {
			try {
				let tracks = this.localVideoref.current.srcObject.getTracks()
				tracks.forEach(track => track.stop())
			} catch (e) {}
		}
	}

	getUserMediaSuccess = (stream) => {
		try {
			window.localStream.getTracks().forEach(track => track.stop())
		} catch(e) { console.log(e) }

		window.localStream = stream
		this.localVideoref.current.srcObject = stream

		for (let id in connections) {
			if (id === socketId) continue

			connections[id].addStream(window.localStream)

			connections[id].createOffer().then((description) => {
				connections[id].setLocalDescription(description)
					.then(() => {
						socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
					})
					.catch(e => console.log(e))
			})
		}

		stream.getTracks().forEach(track => track.onended = () => {
			this.setState({
				video: false,
				audio: false,
			}, () => {
				try {
					let tracks = this.localVideoref.current.srcObject.getTracks()
					tracks.forEach(track => track.stop())
				} catch(e) { console.log(e) }

				let blackSilence = (...args) => new MediaStream([this.black(...args), this.silence()])
				window.localStream = blackSilence()
				this.localVideoref.current.srcObject = window.localStream

				for (let id in connections) {
					connections[id].addStream(window.localStream)

					connections[id].createOffer().then((description) => {
						connections[id].setLocalDescription(description)
							.then(() => {
								socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
							})
							.catch(e => console.log(e))
					})
				}
			})
		})
	}

	getDislayMedia = () => {
		if (this.state.screen) {
			if (navigator.mediaDevices.getDisplayMedia) {
				navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
					.then(this.getDislayMediaSuccess)
					.then((stream) => {})
					.catch((e) => {
						console.log(e)
						this.setState({screen: false})
					})
			}
		}
		else {
			const tracks = this.screenstream.gettracks();
			for( var i = 0 ; i < tracks.length ; i++ ) tracks[i].stop();
		}
	}

	getDislayMediaSuccess = (stream) => {
		try {
			window.localStream.getTracks().forEach(track => track.stop())
		} catch(e) { console.log(e) }

		window.localStream = stream
		this.localVideoref.current.srcObject = stream

		for (let id in connections) {
			if (id === socketId) continue

			connections[id].addStream(window.localStream)

			connections[id].createOffer().then((description) => {
				connections[id].setLocalDescription(description)
					.then(() => {
						socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
					})
					.catch(e => console.log(e))
			})

			socket.on('list-users', (data)=>{
				console.log(data);
			})
		}

		stream.getTracks().forEach(track => track.onended = () => {
			this.setState({
				screen: false,
			}, () => {
				try {
					let tracks = this.localVideoref.current.srcObject.getTracks()
					tracks.forEach(track => track.stop())
				} catch(e) { console.log(e) }

				let blackSilence = (...args) => new MediaStream([this.black(...args), this.silence()])
				window.localStream = blackSilence()
				this.localVideoref.current.srcObject = window.localStream

				this.getUserMedia()
			})
		})
	}

	gotMessageFromServer = (fromId, message) => {
		var signal = JSON.parse(message)

		if (fromId !== socketId) {
			if (signal.sdp) {
				connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
					if (signal.sdp.type === 'offer') {
						connections[fromId].createAnswer().then((description) => {
							connections[fromId].setLocalDescription(description).then(() => {
								socket.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
							}).catch(e => console.log(e))
						}).catch(e => console.log(e))
					}
				}).catch(e => console.log(e))
			}

			if (signal.ice) {
				connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
			}
		}
	}

	connectToSocketServer = () => {
		socket = io.connect(server_url, { secure: true })

		socket.on('signal', this.gotMessageFromServer)

		socket.on('connect', () => {
			socket.emit('join-call', window.location.href , this.state.username)
			socketId = socket.id

			socket.on('chat-message', this.addMessage)

			socket.on('user-left', (id) => {
				this.setState({listUser : this.state.listUser.filter(data => data.socketId !== socket.id)})
				UserFrameHelper.removeVideo(id)
			})

			socket.on('grant-role', () => {
				this.setState({isAdmin : true})
			})

			socket.on('user-joined', (id, clients, user) => {
				this.setState({listUser : user})
				clients.forEach((socketListId) => {
					connections[socketListId] = new RTCPeerConnection(peerConnectionConfig)
					// Wait for their ice candidate       
					connections[socketListId].onicecandidate = function (event) {
						if (event.candidate != null) {
							socket.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
						}
					}

					// Wait for their video stream
					connections[socketListId].onaddstream = (event) => {
						// TODO mute button, full screen button
						var searchVidep = document.querySelector(`[data-socket="${socketListId}"]`)
						if (searchVidep !== null) { // if i don't do this check it make an empyt square
							searchVidep.srcObject = event.stream
						} else {
							UserFrameHelper.createVideo(event.stream, socketListId, clients.length, user.filter(x => x.socketId === socketListId)[0].username)
						}
					}

					// Add the local video stream
					if (window.localStream !== undefined && window.localStream !== null) {
						connections[socketListId].addStream(window.localStream)
					} else {
						let blackSilence = (...args) => new MediaStream([this.black(...args), this.silence()])
						window.localStream = blackSilence()
						connections[socketListId].addStream(window.localStream)
					}
				})

				if (id === socketId) {
					for (let id2 in connections) {
						if (id2 === socketId) continue
						
							try {
								connections[id2].addStream(window.localStream)
						} catch(e) {}
			
						connections[id2].createOffer().then((description) => {
							console.log(description)
							connections[id2].setLocalDescription(description)
								.then(() => {
									socket.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
								})
								.catch(e => console.log(e))
						})
					}
				}
			})
		})
	}

	silence = () => {
		let ctx = new AudioContext()
		let oscillator = ctx.createOscillator()
		let dst = oscillator.connect(ctx.createMediaStreamDestination())
		oscillator.start()
		ctx.resume()
		return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
	}
	black = ({ width = 640, height = 480 } = {}) => {
		console.log('black')
		let canvas = Object.assign(document.createElement("canvas"), { width, height })
		canvas.getContext('2d').fillRect(0, 0, width, height)
		let stream = canvas.captureStream()
		return Object.assign(stream.getVideoTracks()[0], { enabled: false })
	}

	handleVideo = () => this.setState({ video: !this.state.video }, () => this.getUserMedia())
	handleAudio = () => this.setState({ audio: !this.state.audio }, () => this.getUserMedia())
	handleScreen = () => this.setState({ screen: !this.state.screen }, () => this.getDislayMedia())

	handleEndCall = () => {
		try {
			let tracks = this.localVideoref.current.srcObject.getTracks()
			tracks.forEach(track => track.stop())
		} catch (e) {}
		window.location.href = "/"
	}

	openChat = () => this.setState({ showModal: true, newmessages: 0 })
	closeChat = () => this.setState({ showModal: false })
	handleMessage = (e) => this.setState({ message: e.target.value })
	openUser = () => this.setState({showUserModal : true})
	closeUserModel = () => this.setState({showUserModal : false})

	addMessage = (data, sender, socketIdSender) => {
		this.setState(prevState => ({
			messages: [...prevState.messages, { "sender": sender, "data": data }],
		}))
		if (socketIdSender !== socketId) {
			this.setState({ newmessages: this.state.newmessages + 1 })
		}
	}

	sendMessage = () => {
		socket.emit('chat-message', this.state.message, this.state.username)
		this.setState({ message: "", sender: this.state.username })
	}

	copyUrl = () => {
		let text = window.location.href
		navigator.clipboard.writeText(text).then(function () {
			message.success("Link copied to clipboard!")
		}, () => {
			message.error("Failed to copy")
		})
	}	

	isLogin = () => {
		let text = window.location.href
		navigator.clipboard.writeText(text).then(function () {
			message.success("Link copied to clipboard!")
		}, () => {
			message.error("Failed to copy")
		})
	}

	handleMute = (element) =>{
		socket.emit('mute-audio', window.location.href , element.socketId)
	}
	
	render() {
		return (
			<div>
				<div>
					<div className="btn-down" style={{textAlign: "center" }}>
						<div className='link' onClick={this.copyUrl} title='copy link url'>
						</div>
						<div>
							<IconCustom tooltip='video' state={this.state.video} Icon={VideocamIcon} OffIcon={VideocamOffIcon} handleClick={this.handleVideo}/>
							<IconButton  className='off' style={{ color: "#f44336" }} onClick={this.handleEndCall}>
								<CallEndIcon />
							</IconButton>
							<IconCustom  tooltip='micro' state={this.state.audio} Icon={MicIcon} OffIcon={MicOffIcon} handleClick={this.handleAudio}/>

							{this.state.screenAvailable === true ?
								<IconButton onClick={this.handleScreen}>
									{this.state.screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon/>}
								</IconButton>
								: null}

							<Badge badgeContent={this.state.newmessages} max={999} color="secondary" onClick={this.openChat}>
								<IconButton className='roomButton'  onClick={this.openChat}>
									<ChatIcon />
								</IconButton>
							</Badge>
							<IconButton onClick={this.openUser}>
								<PeopleAlt/>
							</IconButton>
							{this.state.isAdmin && <RollCall videoRef={this.localVideoref} userList={this.state.listUser} userName={this.state.username}/>}
						</div>
						<div>
						</div>
						
					</div>

					<Modal show={this.state.showUserModal} onHide={this.closeUserModel} style={{ zIndex: "999999" }}>
						<Modal.Header closeButton>
							<Modal.Title>User list</Modal.Title>
						</Modal.Header>
						<Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
							{this.state.listUser.map(element => {
								return (
									<div style={{display : 'flex', justifyContent : 'space-between'}}>
										<p>{element.username + ((element.username === this.state.username)?' (you)':'')}</p>
										{this.state.isAdmin && (
											<IconButton className='roomButton'  onClick={()=> this.handleMute(element)}>
												{element.isOnMic ? <MicIcon/> : <MicOffIcon/>}
											</IconButton>
										)}
									</div>	
								)
							})}
						</Modal.Body>
					</Modal>

					<Modal show={this.state.showModal} onHide={this.closeChat} style={{ zIndex: "999999" }}>
						<Modal.Header closeButton>
							<Modal.Title>Chat Room</Modal.Title>
						</Modal.Header>
						<Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
							{this.state.messages.length > 0 ? this.state.messages.map((item, index) => (
								<div key={index} style={{textAlign: "left"}}>
									<p style={{ wordBreak: "break-all" }}><b>{item.sender}</b>: {item.data}</p>
								</div>
							)) : <p>No message yet</p>}
						</Modal.Body>
						<Modal.Footer className="div-send-msg">
							<Input placeholder="Message" value={this.state.message} onChange={e => this.handleMessage(e)} />
							<Button variant="contained" color="primary" onClick={this.sendMessage}>Send</Button>
						</Modal.Footer>
					</Modal>

					<div className="container">
						<Row id="main" className="flex-container" style={{ margin: 0, padding: 0 }}>
							<div autoPlay muted style={{
								position: 'relative',
								margin: "10px",
								width: "100%",height: "100%"}}>
								<div style={{
									bottom: "10px",
									left: "10px",position: "absolute"}}>
									{this.state.username + ' (you)'}
								</div>
								<video id="my-video" ref={this.localVideoref} autoPlay muted style={{
									objectFit: "fill",
									width: "100%",height: "100%"}}></video>
							</div>
						</Row>
					</div>
				</div>
			</div>
		)
	}
}

export default LiveRoom
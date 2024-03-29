import React, { Component } from 'react'
import io from 'socket.io-client'

import { IconButton, Badge, Input, Button, Avatar } from '@material-ui/core'
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
			user: this.props.user || { name: UserProfile.getName(), userID: -1 },
			showUserModal: false,
			listUser: [],
			listWaiting: [],
			isAdmin: false,
			canOpenMic: true,
			canOpenCam: true,
		}
		connections = {}
		this.getPermissions()
	}
	componentDidMount() {
		console.log('didmount', this.state)
		this.getUserMedia()
		this.connectToSocketServer()
	}

	getPermissions = async () => {
		try {
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
					.then(this.getUserMediaSuccess)
					.catch((e) => console.log(e))
			}
		} catch (e) { console.log(e) }
	}

	getUserMedia = () => {
		if ((this.state.video && this.videoAvailable) || (this.state.audio && this.audioAvailable)) {
			navigator.mediaDevices.getUserMedia({ video: this.state.video, audio: this.state.audio })
				.then(this.getUserMediaSuccess)
				.catch((e) => console.log(e))
		} else {
			try {
				let tracks = this.localVideoref.current.srcObject.getTracks()
				tracks.forEach(track => track.stop())
			} catch (e) { }
		}
	}

	getUserMediaSuccess = (stream) => {
		window.localStream = stream
		this.localVideoref.current.srcObject = stream

		for (let id in connections) {
			if (id === socketId) continue

			connections[id].addStream(window.localStream)

			connections[id].createOffer().then((description) => {
				connections[id].setLocalDescription(description)
					.then(() => {
						console.log(description, connections[id].localDescription)
						socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
					})
					.catch(e => console.log(e))
			})
		}

	}

	getDislayMedia = () => {
		if (this.state.screen) {
			if (navigator.mediaDevices.getDisplayMedia) {
				navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
					.then(this.getUserMediaSuccess)
					.catch((e) => {
						console.log(e)
						this.setState({ screen: false })
					})
			}
		}
		else {
			const tracks = this.screenstream.gettracks();
			for (var i = 0; i < tracks.length; i++) tracks[i].stop();
		}
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
			socket.emit('join-call', window.location.href, this.state.user.name, this.state.user.userID)
			socketId = socket.id

			socket.on('chat-message', this.addMessage)

			socket.on('user-left', (id) => {
				this.setState({ listUser: this.state.listUser.filter(data => data.socketId !== socket.id) })
				UserFrameHelper.removeVideo(id)
			})

			socket.on('update-waitingList', (listWaiting) => {
				this.setState({ listWaiting: listWaiting })
			})

			socket.on('grant-role', () => {
				this.setState({ isAdmin: true })
			})

			socket.on('mute-audio', (canOpenMic) => {
				if (!canOpenMic) this.setState({ audio: canOpenMic }, () => {
					const track = window.localStream.getAudioTracks()[0];
					if (track) track.enabled = false
				})
				this.setState({ canOpenMic })
			})

			socket.on('mute-video', (canOpenCam) => {
				if (!canOpenCam) this.setState({ video: canOpenCam }, () => {
					const track = window.localStream.getVideoTracks()[0];
					if (track) track.enabled = false
				})
				this.setState({ canOpenCam })
			})

			socket.on('request-join', (users) => {
				this.setState({ listWaiting: users })
			})

			socket.on('user-joined', (id, clients, user, waitingUsers) => {
				this.setState({ listUser: user })
				this.setState({ listWaiting: waitingUsers })
				clients.forEach((socketListId) => {
					connections[socketListId] = new RTCPeerConnection(peerConnectionConfig)
					// Wait for their ice candidate       
					connections[socketListId].onicecandidate = function (event) {
						console.log(event.candidate)
						if (event.candidate != null) {
							socket.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
						}
					}
					connections[socketListId].ontrack = (event) => {
						var searchVidep = document.querySelector(`[data-socket="${socketListId}"]`)
						if (searchVidep !== null) { // if i don't do this check it make an empyt square
							return;
						} else {
							searchVidep.srcObject = event.streams[0];
						}
					};
					// Wait for their video stream
					connections[socketListId].onaddstream = (event) => {
						// TODO mute button, full screen button
						var searchVidep = document.querySelector(`[data-socket="${socketListId}"]`)
						if (searchVidep !== null) { // if i don't do this check it make an empyt square
							searchVidep.srcObject = event.stream
						} else {
							UserFrameHelper.createVideo(event.stream, socketListId, clients.length, user.filter(x => x.socketId === socketListId)[0].name)
						}
					}
					// connections[socketListId].addStream(window.localStream||new MediaStream())
					// Add the local video stream
					if (window.localStream !== undefined && window.localStream !== null) {
						connections[socketListId].addStream(window.localStream)
					} else {
						let blackSilence = new MediaStream([this.black()])
						window.localStream = blackSilence
						connections[socketListId].addStream(window.localStream)
					}
				})

				if (id === socketId) {
					for (let id2 in connections) {
						if (id2 === socketId) continue

						try {
							connections[id2].addStream(window.localStream)
						} catch (e) { }

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

	black = ({ width = 640, height = 480 } = {}) => {
		let canvas = Object.assign(document.createElement("canvas"), { width, height })
		canvas.getContext('2d').fillRect(0, 0, width, height)
		let stream = canvas.captureStream()
		return Object.assign(stream.getVideoTracks()[0], { enabled: false })
	}

	handleVideo = () => {
		this.setState({ video: !this.state.video }, () => {
			const track = window.localStream.getVideoTracks()[0];
			track.enabled = this.state.video
		})
	}
	handleAudio = () => {
		this.setState({ audio: !this.state.audio }, () => {
			const track = window.localStream.getAudioTracks()[0];
			track.enabled = this.state.audio
		})
	}

	handleScreen = () => this.setState({ screen: !this.state.screen }, () => this.getDislayMedia())

	handleEndCall = () => {
		try {
			let tracks = this.localVideoref.current.srcObject.getTracks()
			tracks.forEach(track => track.stop())
		} catch (e) { }
		window.location.href = "/"
	}

	openChat = () => this.setState({ showModal: true, newmessages: 0 })
	closeChat = () => this.setState({ showModal: false })
	handleMessage = (e) => this.setState({ message: e.target.value })
	openUser = () => this.setState({ showUserModal: true })
	closeUserModel = () => this.setState({ showUserModal: false })

	addMessage = (data, sender, socketIdSender) => {
		this.setState(prevState => ({
			messages: [...prevState.messages, { "sender": sender, "data": data }],
		}))
		if (socketIdSender !== socketId) {
			this.setState({ newmessages: this.state.newmessages + 1 })
		}
	}

	sendMessage = () => {
		socket.emit('chat-message', this.state.message, this.state.user.name)
		this.setState({ message: "", sender: this.state.user.name })
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

	handleUserMic = (element) => {
		const listUser = this.state.listUser.map(x => {
			return (x.socketId === element.socketId) ? { ...x, canOpenMic: !x.canOpenMic } : x
		})
		this.setState({ listUser })
		socket.emit('mute-audio', window.location.href, element.socketId)
	}
	handleUserCam = (element) => {
		const listUser = this.state.listUser.map(x => {
			return (x.socketId === element.socketId) ? { ...x, canOpenCam: !x.canOpenCam } : x
		})
		this.setState({ listUser })
		socket.emit('mute-video', window.location.href, element.socketId)
	}
	allow = (element) => {
		this.setState({ listWaiting: [...this.state.listWaiting.filter(x => x.socketId !== element.socketId)] })
		socket.emit('request-response',window.location.href, element.socketId, true)
	}
	deny = (element) => {
		this.setState({ listWaiting: [...this.state.listWaiting.filter(x => x.socketId !== element.socketId)] })
		socket.emit('request-response',window.location.href, element.socketId, false)
	}

	render() {
		return (
			<div>
				<div>
					<div className="btn-down" style={{ textAlign: "center" }}>
						<div className='link' onClick={this.copyUrl} title='copy link url'>
						</div>
						<div>
							<IconCustom disabled={!this.state.canOpenCam} tooltip='video' state={this.state.video} Icon={VideocamIcon} OffIcon={VideocamOffIcon} handleClick={this.handleVideo} />
							<IconButton className='off' style={{ color: "#f44336" }} onClick={this.handleEndCall}>
								<CallEndIcon />
							</IconButton>
							<IconCustom disabled={!this.state.canOpenMic} tooltip='micro' state={this.state.audio} Icon={MicIcon} OffIcon={MicOffIcon} handleClick={this.handleAudio} />

							{this.state.screenAvailable === true ?
								<IconButton onClick={this.handleScreen}>
									{this.state.screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
								</IconButton>
								: null}

							<Badge badgeContent={this.state.newmessages} max={999} color="secondary" onClick={this.openChat}>
								<IconButton className='roomButton' onClick={this.openChat}>
									<ChatIcon />
								</IconButton>
							</Badge>
							<Badge badgeContent={this.state.listWaiting.length} max={999} color="secondary" onClick={this.openUser}>
								<IconButton>
									<PeopleAlt />
								</IconButton>
							</Badge>
							{this.state.isAdmin && <RollCall videoRef={this.localVideoref} userList={this.state.listUser} user={this.state.user} socket={socket} />}
						</div>
						<div>
						</div>

					</div>

					<Modal show={this.state.showUserModal} onHide={this.closeUserModel} style={{ zIndex: "999999" }}>
						<Modal.Header closeButton>
							<Modal.Title>User</Modal.Title>
						</Modal.Header>
						<Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
							{(this.state.listWaiting.length) ? (
								<div className='user-component'>
									<div className='title'>Waiting for join</div>
									{this.state.listWaiting.map(element => {
										return (
											<div className='user-card'>
												<div>
													<Avatar style={{ width: 32, height: 32, background: "rgb(93 64 55)" }}>{element.name.substring(0, 1)}</Avatar>
													<p>{element.name}</p>
												</div>
												{this.state.isAdmin && (<div className='action'>
													<div onClick={() => this.allow(element)}>Allow</div>
													<div onClick={() => this.deny(element)}>Deny</div>
												</div>)}
											</div>
										)
									})}
								</div>
							) : null}
							<div className='user-component'>
								<div className='title'> In Meeting</div>
								{this.state.listUser.map(element => {
									const isYou = (element.name === this.state.user.name)
									return (
										<div className='user-card'>
											<div>
												<Avatar style={{ width: 32, height: 32, background: "rgb(93 64 55)" }}>{element.name.substring(0, 1)}</Avatar>
												<p>{element.name + (isYou ? ' (you)' : '') + (element.isAdmin ? '(Meeting host)' : '')}</p>
											</div>
											{this.state.isAdmin && !isYou && (<div>
												<IconButton className='roomButton' onClick={() => this.handleUserMic(element)}>
													{element.canOpenMic ? <MicIcon /> : <MicOffIcon />}
												</IconButton>
												<IconButton className='roomButton' onClick={() => this.handleUserCam(element)}>
													{element.canOpenCam ? <VideocamIcon /> : <VideocamOffIcon />}
												</IconButton>
											</div>
											)}
										</div>
									)
								})}
							</div>

						</Modal.Body>
					</Modal>

					<Modal show={this.state.showModal} onHide={this.closeChat} style={{ zIndex: "999999" }}>
						<Modal.Header closeButton>
							<Modal.Title>Chat Room</Modal.Title>
						</Modal.Header>
						<Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
							{this.state.messages.length > 0 ? this.state.messages.map((item, index) => (
								<div key={index} style={{ textAlign: "left" }}>
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
								width: "100%", height: "100%"
							}}>
								<div style={{
									bottom: "10px",
									left: "10px", position: "absolute"
								}}>
									{this.state.user.name + ' (you)'}
								</div>
								<video id="my-video" ref={this.localVideoref} autoPlay muted style={{
									objectFit: "fill",
									width: "100%", height: "100%"
								}}></video>
							</div>
						</Row>
					</div>
					{/* <div className='waiting-component'>
						<div><Avatar style={{width: 24, height: 24}} >H</Avatar></div>
						<div>anyone wants to join</div>
						<div className='action'>
							<div>allow</div>
							<div>deny</div>
						</div>
					</div> */}
				</div>
			</div>
		)
	}
}

export default LiveRoom
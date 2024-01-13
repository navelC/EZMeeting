const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
var xss = require("xss")
const uniqid = require('uniqid');
var server = http.createServer(app)
var io = require('socket.io')(server)

app.use(cors())
app.use(bodyParser.json())

app.set('port',  4001)

sanitizeString = (str) => {
	return xss(str)
}

connections = {}
messages = {}
timeOnline = {}
listUser = {}

const axios = require('axios');

const baseUrl = 'http://localhost:9090';
const instance = axios.create({
    baseURL: baseUrl,
    method: 'get',
});
function createUserAttendance(data) {
  return instance.post(`/rollcall`, data);;
}
function createRoom(data) {
  return instance.post(`/rooms`, data);
}

io.on('connection', (socket) => {
	var roomPath = null
	socket.on('new-room', (userID) => {
		var url = 'http://localhost:3000/room/'+uniqid();
		connections[url] = {
			admin: userID,
			users: [],
			waitingUsers: [],
			roomID: -1,
			savedUser: []
		}
		if(userID !== -1){
			createRoom({id: url}).then(() => {
				connections[url].roomID = id
			}).catch(err => {
				console.log(err)
			})
		}
		io.to(socket.id).emit("new-room", url)
	})
	socket.on('request-join', (path, userID, name) => {
		console.log('request')
		if(connections[path] === undefined){
			console.log('room not found')
			return 
		}
		connections[path].waitingUsers.push({socketId : socket.id ,name})
		const adminSocket = listUser[path].filter(x => x.userID === connections[path].admin)[0]?.socketId
		io.to(adminSocket).emit('request-join', connections[path].waitingUsers)
		
	})
	socket.on("request-response" , (path, socketID, isAllowed)=>{
		connections[path].waitingUsers = connections[path].waitingUsers.filter(x => x.socketId !== socketID)
		for(let a = 0; a < connections[path].users.length; ++a){
			io.to(connections[path].users[a]).emit("update-waitingList",  connections[path].waitingUsers)
		}
		io.to(socketID).emit('request-response', isAllowed)
	})
	socket.on('check-room', (path, userID) => {
		if(connections[path] === undefined){
			io.to(socket.id).emit('check-room', false)
		}
		else {
			if((userID !== -1 && userID === connections[path].admin) || connections[path].users.length === 0) io.to(socket.id).emit('check-room', true, true)
			io.to(socket.id).emit('check-room', true)
		}
	})
	socket.on('join-call', (path , name, userID) => {
		// if(connections[path] === undefined){
		// 	connections[path] = {
		// 		admin: userID,
		// 		users: []
		// 	}
		// 	io.to(socket.id).emit("grant-role")
		// }
		if(connections[path] === undefined) {
			console.log('room not found')
			return
		}
		// if(connections[path].savedUser.some(x => {
		// 	return x === userID
		// })){

		// }
		if((userID !== -1 && userID === connections[path].admin)) io.to(socket.id).emit("grant-role")
		if(listUser[path] === undefined){
			listUser[path] = []
		}

		connections[path].users.push(socket.id)
		
		listUser[path].push({socketId : socket.id ,name ,userID, canOpenMic : true, canOpenCam: true})

		timeOnline[socket.id] = new Date()


		for(let a = 0; a < connections[path].users.length; ++a){
			io.to(connections[path].users[a]).emit("user-joined", socket.id, connections[path].users ,listUser[path],  connections[path].waitingUsers)
		}

		if(messages[path] !== undefined){
			for(let a = 0; a < messages[path].length; ++a){
				io.to(socket.id).emit("chat-message", messages[path][a]['data'], 
					messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
			}
		}

		console.log(path, connections[path])
	})

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message)
	})

	socket.on("mute-audio" , (path ,socketId)=>{
		listUser[path]?.map(item =>{
			if (item.socketId == socketId) {
				item.canOpenMic = !item.canOpenMic
				io.to(socketId).emit("mute-audio", item.canOpenMic)
			}
		})
	})

	socket.on("mute-video" , (path ,socketId)=>{
		listUser[path]?.map(item =>{
			if (item.socketId == socketId) {
				item.canOpenCam = !item.canOpenCam
				io.to(socketId).emit("mute-video", item.canOpenCam)
			}
		})
	})


	socket.on("roll-call" , ()=>{
		console.log(listUser[roomPath])
		io.to(socket.id).emit('roll-call', listUser[roomPath])
	})

	socket.on('chat-message', (data, sender) => {
		data = sanitizeString(data)
		sender = sanitizeString(sender)

		var key
		var ok = false
		for (const [k, v] of Object.entries(connections)) {
			for(let a = 0; a < v.users.length; ++a){
				if(v.users[a] === socket.id){
					key = k
					ok = true
				}
			}
		}

		if(ok === true){
			if(messages[key] === undefined){
				messages[key] = []
			}
			messages[key].push({"sender": sender, "data": data, "socket-id-sender": socket.id})
			console.log("message", key, ":", sender, data)

			for(let a = 0; a < connections[key].users.length; ++a){
				io.to(connections[key].users[a]).emit("chat-message", data, sender, socket.id)
			}
		}
	})

	socket.on('disconnect', () => {
		var diffTime = Math.abs(timeOnline[socket.id] - new Date())
		for (const [key, v] of Object.entries(connections)) {
			for(let a = 0; a < v.users.length; ++a){
				if(v.users[a] === socket.id){
					listUser[key] = listUser[key].filter(data => data.socketId !== socket.id)

					for(let a = 0; a < connections[key].users.length; ++a){
						io.to(connections[key].users[a]).emit("user-left", socket.id)
					}
			
					var index = connections[key].users.indexOf(socket.id)
					connections[key].users.splice(index, 1)

					console.log(key, socket.id, Math.ceil(diffTime / 1000))

					if(connections[key].users.length === 0){
						delete connections[key]
					}
				}
			}
		}
	})
})

server.listen(app.get('port'), () => {
	console.log("listening on", app.get('port'))
})
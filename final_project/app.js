const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
var xss = require("xss")

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

io.on('connection', (socket) => {
	var roomPath = null
	socket.on('join-call', (path , name, userID) => {
		roomPath = path
		if(connections[path] === undefined){
			connections[path] = []
			io.to(socket.id).emit("grant-role")
		}
		
		if(listUser[path] === undefined){
			listUser[path] = []
		}

		connections[path].push(socket.id)
		
		listUser[path].push({socketId : socket.id ,name ,userID, canOpenMic : true, canOpenCam: true})

		timeOnline[socket.id] = new Date()


		for(let a = 0; a < connections[path].length; ++a){
			io.to(connections[path][a]).emit("user-joined", socket.id, connections[path] ,listUser[path])
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
			for(let a = 0; a < v.length; ++a){
				if(v[a] === socket.id){
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

			for(let a = 0; a < connections[key].length; ++a){
				io.to(connections[key][a]).emit("chat-message", data, sender, socket.id)
			}
		}
	})

	socket.on('disconnect', () => {
		var diffTime = Math.abs(timeOnline[socket.id] - new Date())
		var key
		for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
			for(let a = 0; a < v.length; ++a){
				if(v[a] === socket.id){
					key = k
					listUser[key] = listUser[key].filter(data => data.socketId !== socket.id)

					for(let a = 0; a < connections[key].length; ++a){
						io.to(connections[key][a]).emit("user-left", socket.id)
					}
			
					var index = connections[key].indexOf(socket.id)
					connections[key].splice(index, 1)

					console.log(key, socket.id, Math.ceil(diffTime / 1000))

					if(connections[key].length === 0){
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
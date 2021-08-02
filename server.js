
const express = require("express")
const path = require("path")
const app = express()
const PORT = process.env.PORT||3000
const server = require("http").createServer(app)
var io = require('socket.io')(server)
var getId = 0
var r1 = ''
var r2 = ''

app.get('/', (req,res)=>{
	res.sendFile(path.join(__dirname,'public','index.html'));
});
app.get('/app.js', (req,res)=>{
	res.sendFile(path.join(__dirname,'public','app.js'));
})
app.get('/style.css', (req,res)=>{
	res.sendFile(path.join(__dirname,'public','style.css'));
})

var connections = [null, null]
var room = 1
var ball_pos = [150,150]
var ball_vel = [-5,5]
var ballMove = 0
var gamestart = 0

io.on('connection', socket=>{
	let playerIndex = -1
	for(const i in connections){
		if(connections[i] == null){
			playerIndex = i
			connections[i] = socket
			break;
		}
	}
	r1 = 'Room'+room
	socket.join(r1)
	socket.emit('player-index',[playerIndex,r1])
	console.log('Player'+playerIndex+' has connected ');
	if(playerIndex == 1){
		connections = [null,null]
		console.log("Full room")
		io.in(r1).emit('game-start', true)
		room += 1
	}
	socket.on('request_ball', data => {
		if(data){
				ballMove = setInterval(function(){
				ball_pos[0] += ball_vel[0]
				ball_pos[1] += ball_vel[1]
				socket.emit('ballPos',[ball_pos,ball_vel])
			},200)
		
	}
		
	})
	socket.on('paddle-move', data => {
		r2 = data[2]
		socket.to(r2).emit('opponent-move', data)
	})
	socket.on('check-collision', data => {
		ball_vel[0] = data[0]
		ball_vel[1] = data[1]
		console.log(data[4],data[2],data[3])
		socket.to(data[4]).emit('changeScore',[data[2],data[3]]);

	})
	socket.on('gameOver', data => {
		if(data){
			console.log('restart')
			ball_pos = [150,150]
			ball_vel = [-5,5]
			console.log(data)
			clearInterval(ballMove)
			socket.emit('game-start', true)
		}
	})
	
})


server.listen(PORT, ()=>{
	console.log('Server lisening on '+PORT)
})



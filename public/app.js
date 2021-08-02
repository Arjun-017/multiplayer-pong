
const socket = io()


const container = document.getElementById("game-container")
var score1_container = document.getElementById("score1")
var score2_container = document.getElementById("score2")

let paddley1 = 300
let paddley2 = 100
let ball_pos = [150,150]
let ball_vel = [-5,5]
var gameOver = false
var paddle_vel = 10
var paddle1 = document.createElement("div")
var paddle2 = document.createElement("div")
var ball = document.createElement("div")
paddle1.classList.add('paddle')
paddle2.classList.add('paddle')
paddle2.style.right = '2px'
ball.classList.add('ball')
container.appendChild(paddle1)
container.appendChild(paddle2)
container.appendChild(ball)
var id = 0
var room = ''
var ballMove = 0
var score1 = 0
var score2 = 0

socket.on("player-index", data =>{
	id = parseInt(data[0])
	id = id+1
	console.log("Player"+id)
	room = data[1]
	console.log(room)	
})
function init(){
	paddley1 = 300
	paddley2 = 100
	ball_pos = [150,150]
	ball_vel = [-5,5]
	gameOver = false
	paddle1.style.top = paddley1+"px"
	paddle2.style.top = paddley2+"px"
	ball.style.top = ball_pos[1]+"px"
	ball.style.left = ball_pos[0]+"px"
	socket.emit('request_ball',true)

}

socket.on('game-start', data => {
	if(data){
		console.log('game started')
		init()
	}
	
})
socket.on('ballPos', data => {
	ball_pos[0] =  data[0][0]
	ball_pos[1] = data[0][1]
	ball_vel[0] = data[1][0]
	ball_vel[1] = data[1][1]
	ball.style.left = ball_pos[0] + "px"
	ball.style.top = ball_pos[1] + "px"
	checkCollision()

})
	document.addEventListener('keydown', (e) => {
		if(id == 1){
		if((paddley1<=0)||(paddley1 >= 500)){
			move = false
		}
		if((paddley1>=0)||(paddley1 <= 500)){
			move = true
		}
		if(move){
			if(e.keyCode == 38){
				paddley1 = paddley1 - paddle_vel
				paddle1.style.top = paddley1+"px"
			}
			if(e.keyCode == 40){
				paddley1 = paddley1 + paddle_vel
				paddle1.style.top = paddley1+"px"			
			}	
		}
		socket.emit("paddle-move", [paddley1, id, room])
		}
		if(id == 2){
		if((paddley2<=0)||(paddley2 >= 500)){
			move = false
		}
		if((paddley2>=0)||(paddley2 <= 500)){
			move = true
		}
		if(move){
			if(e.keyCode == 38){
				paddley2 = paddley2 - paddle_vel
				paddle2.style.top = paddley2+"px"
			}
			if(e.keyCode == 40){
				paddley2 = paddley2 + paddle_vel
				paddle2.style.top = paddley2+"px"			
			}	
		}
		socket.emit("paddle-move", [paddley2, id, room])
    	}
	})
socket.on('opponent-move', data => {
	if(data[1] == '1'){
		paddle1.style.top = data[0]+"px"
	}
	if(data[1] == '2'){
		paddle2.style.top = data[0]+"px"
	}
})


function getPaddle1Pos(){
	return parseInt(window.getComputedStyle(paddle1).getPropertyValue("top"))
}

function getPaddle2Pos(){
	return parseInt(window.getComputedStyle(paddle2).getPropertyValue("top"))
}



function checkCollision(){
	
	paddle1pos = getPaddle1Pos()
	paddle2pos = getPaddle2Pos()

	if((ball_pos[0]<=0)||(ball_pos[0]>=780)){
		paddle1.style.top = '300px'
		paddle2.style.top = '300px'
		socket.emit('gameOver',true)
	}

	if(ball_pos[0]<=10){
		if((ball_pos[1]>=(paddle1pos-20))&&(ball_pos[1]<=(paddle1pos+120))){
			console.log(paddle1pos, paddle2pos)
			score1 = score1 + 1	
			score1_container.innerHTML = score1
			socket.emit('check-collision',[-ball_vel[0],ball_vel[1],score1,score2,room])
		}
	}
	if(ball_pos[0]>=770){
		if((ball_pos[1]>=(paddle2pos-20))&&(ball_pos[1]<=(paddle2pos+120))){
			console.log(paddle1pos, paddle2pos)
			score2 = score2 + 1	
			score2_container.innerHTML = score2
			socket.emit('check-collision',[-ball_vel[0],ball_vel[1],score1,score2,room])
	}
}
	if((ball_pos[1]<=0)||(ball_pos[1]>=580)){
		socket.emit('check-collision',[ball_vel[0],-ball_vel[1],score1,score2,room])
	}
	
}
socket.on('changeScore',data => {
	console.log(data)
	score1_container.innerHTML = data[0]
	score2_container.innerHTML	= data[1]
})
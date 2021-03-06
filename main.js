//Canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext('2d');
let x = canvas.width / 2;
let y = canvas.height - 30;

//Game Data
let score = 0;
let lives = 3;
let level = 1;
let newScore = 0;
let levelMultiplier = .5; //multiplier by which we change ball's speed based on levels completed


//Ball
const ballRadius = 10;
let dx = 2;
let dy = -2;

//Paddle
const paddleHeight = 10;
const paddleWidth = 75;
const paddleSide = paddleWidth * .33;
let paddleX = (canvas.width - paddleWidth) / 2;

//Brick
const brickRowCount = 5;
const brickColumnCount = 3;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const bricks = initBricks();
let bricksLeft = (brickRowCount * brickColumnCount);

//Movement
let rightPressed = false;
let leftPressed = false;

//Touch Movement
let isTouch = false;
let paddleTouchMoveToPos = 0;

//Color
const randomColorArray = ["red", "blue", "green", "orange", "purple", "yellow", "cyan", "peachpuff"];
let randomColor = randomColorArray[0];
let newRandomColorArray = randomColorArray[0];

function initBricks(){
    let newBricks = [];
    for(let c = 0; c < brickColumnCount; c++){
        newBricks[c] = [];
        for (let r = 0; r < brickRowCount; r++){
            newBricks[c][r] = {x:0, y:0, status:1, scoreValue:3};
        }
    }
    return newBricks;
}

// localStorage.removeItem('Score');
// localStorage.removeItem('Level');

if(localStorage.getItem('Score') == null || localStorage.getItem('Level') == null)
{
    console.log('no local score');
    localStorage.setItem('Score', score);
    localStorage.setItem('Level', level);
}
else {
    loadGame();
}

function loadGame()
{
    console.log('LOCAL STORAGE');
    let prevScore = localStorage.getItem('Score');
    let prevLevel = localStorage.getItem('Level');
    console.log(prevScore);
    document.getElementById("prevScore").innerHTML = prevScore.toString();
    document.getElementById("prevLevel").innerHTML = prevLevel.toString();
}

function saveGame()
{
    localStorage.setItem('Score', score);
    localStorage.setItem('Level', level);
}

//used to generate new list of random colors for each individual row
function createNewColorArray()
{
    newRandomColorArray = [colorChange(), colorChange(), colorChange()];
}

createNewColorArray();

function drawBricks(){

    for(let c = 0; c < brickColumnCount; c++){
        for (let r = 0; r < brickRowCount; r++){
            if (bricks[c][r].status == 1){
                const brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                const br = bricks[c][r];
                switch(c) {
                    case 0:
                        br.scoreValue = 3;
                        ctx.fillStyle = newRandomColorArray[0];
                        ctx.fill();
                        ctx.closePath();
                      break;
                    case 1:
                        br.scoreValue = 2;
                        ctx.fillStyle = newRandomColorArray[1];
                        ctx.fill();
                        ctx.closePath();
                      break;
                    case 2:
                        br.scoreValue = 1;
                        ctx.fillStyle = newRandomColorArray[2];
                        ctx.fill();
                        ctx.closePath();
                        break;
                }
            }
        }
    }
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = randomColor;
    ctx.fill();
    ctx.closePath();
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = randomColor;
    ctx.fill();
    ctx.closePath();
}

function drawScore(){
    ctx.font = '16px Arial';
    ctx.fillStyle = randomColor;
    ctx.fillText(`Score: ${score + newScore}`, 8, 20);
}

function drawLives(){
    ctx.font = '16px Arial';
    ctx.fillStyle = randomColor;
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function drawLevel(){
    ctx.font = '16px Arial';
    ctx.fillStyle = randomColor;
    ctx.fillText(`Level: ${level}`, canvas.width - 200, 20);
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isTouch)
        handleTouchMovement();
    drawBall();
    drawPaddle();
    collisionDetection();
    drawBricks();
    drawScore();
    drawLives();
    drawLevel();

    //Handling Left/Right walls
    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius){
        dx = -dx;
    }

    //Handling Top/Bottom walls
    if (y + dy < ballRadius){
        dy = -dy;
    }
    else if (y + dy > canvas.height - ballRadius){
        //Paddle Left
        if (x > paddleX && x < paddleX + paddleSide) {
            dx = Math.abs(dx) * -1;
            dy = -dy;
        }
        //Paddle Right
        else if (x > paddleX + (paddleWidth - paddleSide) && x < paddleX + paddleWidth){
            dx = Math.abs(dx);
            dy = -dy;
        }
        //Paddle Middle
        else if (x < paddleX + (paddleWidth - paddleSide) && x > paddleX + paddleSide){
            dy = -dy;
        }
        else{
            lives--;
            if(!lives){
                alert("Game Over!" + "\nScore: " + score + "\nLevel: " + level);
                saveGame();
                document.location.reload();
            } 
            else{
                x = canvas.width/2;
                y = canvas.height-30;
                setBallSpeed();
                paddleX = (canvas.width - paddleWidth)/2;
            }
        }
    }

    if (rightPressed){
        paddleX += 7;
        if (paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    }
    else if (leftPressed){
        paddleX -= 7;
        if (paddleX < 0){
            paddleX = 0;
        }
    }

    x += dx;
    y += dy;

    console.log(dy, dx);

    requestAnimationFrame(draw);
}

function setBallSpeed(){
    dx = (2 + (level * levelMultiplier));
    dy = (-2 - (level * levelMultiplier));
}

function collisionDetection(){
    for(let c = 0; c < brickColumnCount; c++){
        for(let r = 0; r < brickRowCount; r++){
            const b = bricks[c][r];
            if (b.status == 1){
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight){
                    dy = -dy;
                    colorChange();
                    b.status = 0;
                    score += b.scoreValue;
                    bricksLeft--;
                    if (bricksLeft === 0){

                        alert("NEXT LEVEL");

                        bricksLeft = (brickRowCount * brickColumnCount);

                        for(let c = 0; c < brickColumnCount; c++){  //counts back through bricks and resets their status
                            for(let r = 0; r < brickRowCount; r++){
                                const e = bricks[c][r];
                                e.status = 1;
                            }
                        }
                        x = canvas.width/2;
                        y = canvas.height-30;
                        paddleX = (canvas.width - paddleWidth)/2;
                        level++;
                        createNewColorArray();
                        setBallSpeed();
                    }
                }
            }
        }
    }
}

function colorChange(){
    return randomColor = randomColorArray[getRandomInt(randomColorArray.length)];
}

function getRandomInt(max){
    return Math.floor(Math.random() * Math.floor(max));
}

//Input Handlers
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
//Mobile Handlers
document.addEventListener("touchstart", touchStartHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);
document.addEventListener("touchend", touchEndHandler, false);

function keyDownHandler(e){
    if(e.key == "ArrowRight" || e.key == "Right"){
        rightPressed = true;
    }
    else if (e.key == "ArrowLeft" || e.key == "Left"){
        leftPressed = true;
    }
}

function keyUpHandler(e){
    if(e.key == "ArrowRight" || e.key == "Right"){
        rightPressed = false;
    }
    else if (e.key == "ArrowLeft" || e.key == "Left"){
        leftPressed = false;
    }
}

function mouseMoveHandler(e){
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width){
        paddleX = relativeX - paddleWidth /2;
    }
    if (paddleX < 0){
        paddleX = 0;
    }
    if (paddleX + paddleWidth > canvas.width){
        paddleX = canvas.width - paddleWidth;
    }
}

function touchStartHandler(e){
    //Set this touch position to compare for move
    const relativeX = e.touches[0].clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width){
        paddleTouchMoveToPos = relativeX - paddleWidth /2;
    }
    isTouch = true;
}

function touchMoveHandler(e){
    //Update the paddle position to move towards
    const relativeX = e.touches[0].clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width){
        paddleTouchMoveToPos = relativeX - paddleWidth /2;
    }
}

function touchEndHandler(e){
    e.preventDefault();
    //Stop moving
    rightPressed = false;
    leftPressed = false;
    isTouch = false;
}

function handleTouchMovement(){
    if (isInRange(paddleTouchMoveToPos)){
        leftPressed = false;
        rightPressed = false;
        paddleX = paddleTouchMoveToPos;
    }
    if (paddleTouchMoveToPos <= paddleX + 10 || paddleTouchMoveToPos <= paddleX - 10){
        leftPressed = true;
        rightPressed = false;
    }
    else if (paddleTouchMoveToPos >= paddleX - 10 || paddleTouchMoveToPos >= paddleX + 10){
        leftPressed = false;
        rightPressed = true;
    }
}

function isInRange(value){
    if (value <= paddleX + 10 && value >= paddleX - 10)
        return true;
    else
        return false;
}

draw();
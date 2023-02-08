//CODE WRITTEN BY DAVID | FIVERR FREELANCER
//THE CODE IS BEING RUN ON MY WEBSITE: david-gs.com

//PLEASE READ THE README!!!!!

//3js imports
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
//Importing the GLTF loader
import {GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
//First person controls import [On the create scene functions]
import {FirstPersonControls} from 'https://cdn.skypack.dev/pin/three@v0.136.0-4Px7Kx1INqCFBN0tXUQc/mode=imports/unoptimized/examples/jsm/controls/FirstPersonControls.js';



//Arrays to store the variables of the puck, table, blue and red paddles, player models and the connected player models
let puck = [];                           
let table = [];
let paddle_blue = [];
let paddle_red = [];
let player_models = [];
let conn_player_models = [];

let player = false;         //If the user is playing (on the table)
let moving = false;         //If the user is moving (he is not a player and is moving around)

let load_perc = 0;          //Total loaded percentage
let padr_perc = 0;          //Red paddle loaded percentage
let padb_perc = 0;          //Blue paddle loaded percentage
let puck_perc = 0;          //Puck loaded percentage
let room_perc = 0;          //Room loaded percentage -> WITHOUT PADDLES AND PUCK
let fin_loading = false;    //Finished loading



//The helper urls (See view):
const spec_url = "http://127.0.0.1:5500/index.html";            //spectator url
const play_url = "http://127.0.0.1:5500/index.html?p=y";        //player 1 url
const play_url2 = "http://127.0.0.1:5500/index.html?p=y1";      //player 2 url
const swr_window = "http://127.0.0.1:5500/index.html?swr=y";    //something went wrong url
const wr_link = "http://127.0.0.1:5500/waiting_room.html";       //waiting room link url (when there are already 10 players)
const win_url = "http://127.0.0.1:5500/index.html?w=y";
const lose_url = "http://127.0.0.1:5500/index.html?w=f";
const dis_url = "http://127.0.0.1:5500/index.html?w=d";



//Checking the array:
let player_id;                              //The player's id (Specific view ID)
let players_array_indep = [];               //The array of the players that are playing on the table -> Get updated every time a player joins
let conn_players_array_indep = [];          //The array of all of the connected players -> Get updated every time a player joins

let player_pos = [8,2,0];                   //The starting player position (Spawn pos)



//Croquet constant variables:
const Q = Croquet.Constants;

Q.FRAME = 0.1;                                           //Frames Per Second (In this case, 1000 / 60) -> 60fps
Q.FPS = 60;                                              //To then to be corrected by lerping (smoothen)
Q.START_COUNTDOWN = 6;        
Q.START_COUNTDOWN_PROPER = Q.START_COUNTDOWN * 1000;    //Put into seconds (Neater for user and syncing with the UI) 
Q.CENTER_SPHERE_RADIUS = 1.5;
Q.COMBINED_RADIUS = 0.15;                               //The radius of the puck and paddle combined
Q.PLAYERS = 10;                                          //The total number of players allowed
Q.DISTANCE_TO_TABLE_FOR_RED = 1.2;                 //The distance between the player to the table to be redirected to the player url. (More on view)



//The confetti settings
//Using a github project for the confetti
var confettiSettings = { target: 'confeti-overlay', size: 3.5, clock: 50};
var confetti = new ConfettiGenerator(confettiSettings);



//HELPER FUNCTIONS:
function distanceVector(v1, v2) {

    //Calculating individual coord distance
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );    //Returning the distance between two vectors (positions)
    //REMEMBER: For less important use applications, use subraction, because this function is not efficient because of the square roots. More on line 701.
}

function turn_positive(num) {
    return Math.abs(num);                               //Turns any number positive (used for calculations)
}

function turn_negative(num) {
    return (Math.abs(num)) * -1;                        //Turns any number negative
}

//Playing music function
function playMusic(piece, vol) {

    let audio = new Audio();    //Creating an audio element

    //Checking to see what piece we want to play
    if(piece == 1) {

        audio.src = './assets/audio/confetti.mp3';  //Setting the source

    } else if(piece == 2) {

        audio.src = './assets/audio/goal.mp3';

    } else if(piece == 3) {

        audio.src = './assets/audio/side.mp3';

    } else if(piece == 4) {

        audio.src = './assets/audio/setdown.mp3';

    }

    audio.volume = vol / 2; //For ease of usability

    audio.play();   //Playing the audio
}

function join_game_blue() {
    if(players_array_indep[0] == null) {
        window.location = play_url;
    }
}
function join_game_red() {
    if(players_array_indep[1] == null) {
        window.location = play_url2;
    }
}

document.getElementById('jb').addEventListener('click', join_game_blue);
document.getElementById('jr').addEventListener('click', join_game_red);


//JS for the animations (Hiding and showing objects):

document.getElementById('match-info').style.display = 'none';   //Hiding the match ended box at first

//Hiding all of the messages initially
document.getElementById('player-won').style.display = 'none';
document.getElementById('player-lost').style.display = 'none';
document.getElementById('player-disconnected').style.display = 'none';

//Function to load the welcome message
function loadEndedMessage(display) {

    //Loading the message function

    if(display == 1) {
        //Loading the player won message

        document.getElementById('player-won').style.display = 'block';      //Showing the player won text

        //Adding the animation
        document.getElementById('match-info').style.display = 'block';
        document.getElementById('match-info').classList.add('match-ended-message-load');
    }

    if(display == 2) {

        document.getElementById('player-lost').style.display = 'block';     //Showing the player lost text

        //Adding the animation
        document.getElementById('match-info').style.display = 'block';
        document.getElementById('match-info').classList.add('match-ended-message-load');
    }

    if(display == 3) {

        document.getElementById('player-disconnected').style.display = 'block';     //Showing the player disconnected text

        //Adding the animation
        document.getElementById('match-info').style.display = 'block';
        document.getElementById('match-info').classList.add('match-ended-message-load');
    }

}

document.getElementById("message").style.display = "none";      //Hiding the message element at the beggining (will be shown when the window is loaded)

//Closing the initial transition
function closeTransition() {

    setTimeout(function () {    //Waiting for the transition to complete

        document.getElementById("game-logo").classList.add("close");    //Closing the game logo

        setTimeout(function () {    //Waiting for the logo to close

            document.getElementById("loader-wrapper").style.display = "none";   //Hiding the loader element
            loadScoreboard();                                                  //Loading the scoreboard

            if(window.location.href == win_url) {

                //The player has won the previous game

                console.log('You Won!');    //Debugging

                loadEndedMessage(1);

                playMusic(1);   //Playing the confetti sound effect
            
                document.body.addEventListener('click', function() {

                    //Closing the message on a click
                    
                    document.getElementById('match-info').classList.remove('match-ended-message-load'); //Removing the load animation
                    document.getElementById('match-info').classList.add('match-ended-message-close');   //Adding the close animation

                    confetti.clear();   //Hiding the confetti
            
                })
                
            } else if(window.location.href == lose_url) {

                //The player lost the previous game

                console.log('You Lost!');   //Debugging
            
                loadEndedMessage(2);    //Loading the lost message
            
                document.body.addEventListener('click', function() {

                    //Closing the message
                    
                    document.getElementById('match-info').classList.remove('match-ended-message-load'); //Same thing
                    document.getElementById('match-info').classList.add('match-ended-message-close');
            
                })
            
            } else if(window.location.href == dis_url) {

                console.log('The other player disconected!');   //Debugging
            
                loadEndedMessage(3);    //Loading the disconected message
            
                document.body.addEventListener('click', function() {
                    
                    //Closing the message on click

                    document.getElementById('match-info').classList.remove('match-ended-message-load'); //Same thing
                    document.getElementById('match-info').classList.add('match-ended-message-close');
            
                })
            
            }
            

            if(!player) {
                //If the client is not a player

                loadMessage();  //Loading the message box (welcome)

            } else {
                //The client is a player

                document.getElementById('player-tooltip').classList.add('player-load-tooltip'); //Loading the game tooltip
            }

        }, 800);    //Gets executed when the paddle animation is over .8s

    }, 2000);       //Gets executed after2 seconds (leeway time)

}   

function loadMessage() {
    document.getElementById("message").style.display = "block";                 //Adding a class to the message and making it visible (creates animation)
    document.getElementById("message").classList.add("load-message");           //Adding the animation
}

function loadPercentage() {
    load_perc = (puck_perc / 4) + (room_perc / 4) + (padb_perc / 4) + (padr_perc / 4);              //Calculating the percentage of the scene that has been loaded
    console.log("Total percentage loaded: " + load_perc + "%");                                     

    document.getElementById("loaded-percentage").innerHTML = Math.floor(load_perc) + "%";           //Changing the content of the percentage bar

    if(load_perc >= 100) {
        closeTransition();          //If the loaded percentage is 100, we can close the transition by calling the function ubove

    }
}

function closeWelcomeMessage() {

    document.getElementById("message").classList.add("close-message");      //The close message animation
    document.getElementById("black-overlay").style.display = "none";

    setTimeout(function () {
        document.getElementById("message").style.display = "none";  //Hiding the message once it finishes (+ efficient through js)
        fin_loading = true;     //The player is not 100% in the game
    }, 350);    //When the close message animation is over, this gets executed

}
document.getElementById("accept-message-button").addEventListener("click", closeWelcomeMessage);    //Adding the event listner to the button

function closeAllScoreboard() {
    //This function closes all of the scoreboard elements
    document.getElementById("current-score").style.display = "none";        
    document.getElementById("scoreboard-player-missing").style.display = "none";
    document.getElementById("no-game").style.display = "none";

}

//Loading the 'current score' scoreboard
function scoreboardActiveGame() {
    closeAllScoreboard();
    document.getElementById("current-score").style.display = "block";
}

//Loading the 'red player missing' scoreboard
function scoreboardPlayerMissing() {
    closeAllScoreboard();
    document.getElementById("scoreboard-player-missing").style.display = "block";
}

//Loading the 'no game' scoreboard
function scoreboardNoGame() {
    closeAllScoreboard();
    document.getElementById("no-game").style.display = "block";
}

function loadScoreboard() {
    //The scoreboard loding animation
    document.getElementById("scoreboard").classList.add("load-scoradboard");
}

//The function to change the scoreboard (gets called in the view)
function setPoints(player, points) {

    //We get the player (red or blue) and the points we need to set
    if(player == 'b') {
        //Setting the points to the scoreboard
        document.getElementById("blue-points").innerHTML = points;
    } else if(player == 'r') {
        document.getElementById("red-points").innerHTML = points;
    }
}

//If the user is close
function wantToPlay() {
    //Change later:
    console.log("Player wants to play, redirecting if possible. This is the players array that are currently playing" + players_array_indep);
    if(players_array_indep[0] == null) {
        window.location.href = play_url;    //Redirecting to the player 1 url if there are no players playing
    } else if(players_array_indep[1] == null) {
        window.location.href = play_url2;   //Redirecting to the player 2 url if there is only one player (blue player)
    } else {
        //Error message -> A game is already being played

    }
}

//The Croquet Model
class MyModel extends Croquet.Model {
  
    init(options) {
        //Basic initialisation
        super.init(options);
        this.paddle_blue_target_pos = [0, 1.35, 0];//blue paddle starting position
        this.paddle_red_target_pos = [0, 1.35, 0];  //red paddle starting position

        //Matchmaking
        this.players = 0;           //Number of players at the table (Max 2)
        this.players_array = [];    //Storing the view ids of the players

        this.points_blue = 0;       //The blue points
        this.points_red = 0;        //The red points

        this.started = false;       //If the game has started

        //Puck
        this.puck_position_x = 0;   //The starting puck position
        this.puck_position_z = 0.5; //The starting z puck position

        this.puck_speed_x = 0;  //The puck x speed
        this.puck_speed_z = 0;  //The puck z speed

        this.decel_force_x = 0; //The force applied on the x decel axis
        this.decel_force_z = 0; //The force applied on the z decel axis

        //Blue paddle
        this.paddle_blue_pos_full_x = 0;    //The paddle blue position
        this.paddle_blue_pos_full_z = 0;

        this.paddle_blue_pos_full_x_old = 0;    //The old paddle blue position (speed calculations)
        this.paddle_blue_pos_full_z_old = 0;

        this.paddle_blue_speed_x = 0;       //The speed of the blue paddle
        this.paddle_blue_speed_z = 0;

        //Red paddle
        this.paddle_red_pos_full_x = 0; //Same thing here
        this.paddle_red_pos_full_z = 0;

        this.paddle_red_pos_full_x_old = 0;
        this.paddle_red_pos_full_z_old = 0;

        this.paddle_red_speed_x = 0;
        this.paddle_red_speed_z = 0;

        //Loading and moving the player models:
        this.connected_players = [];        //All of the players in the server
        this.connected_players_pos = [];    //Their positions

        this.last_pos_update = 0;   //The last update (to keep stable fps)

        this.updatePosStep();       //Stepping the calculations

        this.subscribe(this.id, 'player-moved', this.playerMoved);  //Player moved subscibe (more on the view)

        this.outside_bounds = [8,8,8];  //Bounds outside the room (disapear objs)

        //Subscribes:
        this.subscribe(this.id, 'paddle-blue-moved', this.TargetBlueDragged);   //Blue paddle moved
        this.subscribe(this.id, 'paddle-red-moved', this.TargetRedDragged);     //Red paddle moved

        //CHANGING NUM OF PARTICIPANTS:
        this.subscribe(this.sessionId, "view-join", this.viewJoin);     //Somebody joined
        this.subscribe(this.sessionId, "view-exit", this.viewExit);     //Somebody left
        this.subscribe(this.id, 'player-playing', this.playerPlaying);  //Somebody wants to play

        this.step_calculate();
        this.step();

    }

    //When a player has moved
    playerMoved(array) {

        //Saving the positions before publishing

        //Creating a new formated array
        this.player_pos_array = [array[0], array[1], array[2], array[3]];
        //Getting the pos in the conn player array
        this.connected_players_pos[array[4]] = this.player_pos_array;

        if(this.last_pos_update > 5) {

            //If the last pos update is more than 5 seconds ago (Mantaining stable fps)
            this.last_pos_update = 0;   //Resetting
            this.publish(this.id, 'pos-player-changed', this.connected_players_pos);    //Publishing at stable fps
        }
    }

    //A simple function to test future features
    Log(data) {
        console.log('The feature is working. Data: ' + data);
    }

    //A player wants to play
    playerPlaying(format) {

        this.viewId = format[0];
        this.pos_want = format[1];
        
        //Checking if the blue spot is empty
        if(this.players_array[0] == null && this.pos_want == 0) {    //Some bug may occur here, come back to fix

            this.players_array[0] = this.viewId; //Adding the view
            this.started = true;

        } else if(this.players_array[1] == null && this.pos_want == 1) {

            //If not, the game starts
            this.players_array[1] = this.viewId;
            this.started = true;

        }

        this.publish(this.id, 'client-joined', this.players_array); //Publishing the event to the view
    }

    //A player joined
    viewJoin(viewId) {

        this.players++; //Changing the number of connected players

        if(this.players > Q.PLAYERS) {

            //Kicking if the max number of players is exeeded

            console.log('Players:' + this.players);
            
            this.future(2500).viewKickPublish(viewId);   //Leeway for the time to connect to the server and get the response 

        } else {

            this.clear_index = this.connected_players.length; //REMEMBER: this adds one, so we dont need to add one again to get the next index because index starts at 0, length starts at 1.

            this.starting_pos_array = [8,0,0];                //LATER TRY: [8,0,viewID/2] - to place in different locations, not all on the same spawn spot
            this.connected_players[this.clear_index] = viewId;  //Adding to the conn players array
            this.connected_players_pos[this.clear_index] = this.starting_pos_array; //Setting its position

            console.log('Players:' + this.players); //Debuggings
        }

    }

    viewKickPublish(viewId) {
        //Kicking if too many players (Solves bug)
        this.publish(this.id, 'too-many-players', viewId);
    }
    
    //A player left
    viewExit(viewId) {

        this.players--; //Lowering the number of players

        this.connected_index = this.connected_players.indexOf(viewId);  //Getting the index of the player (clearing the array)

        this.connected_players.splice(this.connected_index, 1);     //Getting the player out of the array
        this.connected_players_pos.splice(this.connected_index, 1); //Getting the player pos out of the array

        console.log('Players:' + this.players); //Debugging

        this.index = this.players_array.indexOf(viewId);        //Getting the index
        this.players_array[this.index] = null;                  //Putting him out of the players array

        this.publish(this.id, 'client-left', this.players_array);   //Publishing the client left to the view

    }
  
    TargetBlueDragged(pos) {
        //The blue paddle is moved

        this.paddle_blue_pos_full_x = pos[0];   //Setting the x pos
        this.paddle_blue_pos_full_z = (pos[1] * -1) + 1.65; //Fixing small bug by formatting

        this.publish(this.id, 'paddle-blue-change-pos', pos);   //Publishing the change

    }

    TargetRedDragged(pos) {
        //The red paddle is moved

        this.paddle_red_pos_full_x = pos[0];
        this.paddle_red_pos_full_z = (pos[1]) - 2;  //Formatting the z pos

        this.publish(this.id, 'paddle-red-change-pos', pos);    //Publishing the change

    }

    step() {

            this.movePuck();    //Moving the puck function

            this.future(Q.FRAME * 600).step();  //Calling the function once for every 600 calculations (easier for performance)

    }

    movePuck() {
        //The puck position has moved (Fixed rate)

        this.puck_position_x += (this.puck_speed_x) / 2;    //Setting the puck x pos
        this.puck_position_z += (this.puck_speed_z) / 2;    //Setting the puck z pos

        this.publish(this.id, 'puck-pos-changed', [this.puck_position_x, this.puck_position_z]);    //Creating and publishing the position array

    }

    /*The moving of the puck and the calculations of the position of the puck are handled at different indervals: 
        this is so that we can get the most accurate result from the function run on the servers, and then get a good 60fps when publishing the events.
    */

    step_calculate() {
        //Calculations are managed separatley (+ precition)

        this.calculate();   //Calculate function
        this.future(Q.FRAME).step_calculate();  //Calling it every so frames

    }

    calculate() {
        //Calculate function (run only on server)

        //BLUE PADDLE:
        this.paddle_blue_speed_x = (this.paddle_blue_pos_full_x - this.paddle_blue_pos_full_x_old); //Calculating the blue paddle speed on the x axis
        this.paddle_blue_speed_z = (this.paddle_blue_pos_full_z - this.paddle_blue_pos_full_z_old); //Calculating the blue paddle speed on the z axis

        this.paddle_blue_pos_full_x_old = this.paddle_blue_pos_full_x; //Setting the blue paddle old position (speed calc)
        this.paddle_blue_pos_full_z_old = this.paddle_blue_pos_full_z;

        this.dis_z = (this.paddle_blue_pos_full_z - 0.05) - this.puck_position_z;   //Formatting the z distance

        //Not currently used but is usefull
        this.dis_x = (this.paddle_blue_pos_full_x - this.puck_position_x);          //Formatting the x distance

        //Calculating distance using the function declared at top
        this.dis = distanceVector((new THREE.Vector3(this.paddle_blue_pos_full_x, 0, this.paddle_blue_pos_full_z)), (new THREE.Vector3(this.puck_position_x, 0, this.puck_position_z)));

        //If the distance is less than our accepted hit distance
        if(this.dis < Q.COMBINED_RADIUS) {

            //There is a hit

            //If the paddle blue speed is greater than the puck speed, then we have to accelerate the puck.
            //This gives better control for the player
            if(Math.abs(this.paddle_blue_speed_x) >= Math.abs(this.puck_speed_x)) {

                //The x speed
                this.puck_speed_x = this.paddle_blue_speed_x * 3;   //So that we dont experience any wierd collisions (*3)

            }
            if(Math.abs(this.paddle_blue_speed_z) > Math.abs(this.puck_speed_z)) {

                //The z speed
                this.puck_speed_z = this.paddle_blue_speed_z * 3;   //So that we dont experience any wierd collisions (*3)

            }

            //If the paddle is in front of the puck
            //We dont need to turn the x speed, as it is calculated in the ubove if statement (better control)
            if(this.dis_z < 0) {

                this.puck_speed_z = turn_positive(this.puck_speed_z);   //Changing it to positive in stead of multiplying by -1 is better

            } else {
                //Same on z speed

                this.puck_speed_z = turn_negative(this.puck_speed_z);

            }
        }

        //PADDLE RED:

        //Same as the blue paddle calculations, with a small tweak in the math to make it better
        this.paddle_red_speed_x = (this.paddle_red_pos_full_x - this.paddle_red_pos_full_x_old);
        this.paddle_red_speed_z = (this.paddle_red_pos_full_z - this.paddle_red_pos_full_z_old);

        this.paddle_red_pos_full_x_old = this.paddle_red_pos_full_x;
        this.paddle_red_pos_full_z_old = this.paddle_red_pos_full_z;

        this.dis_z2 = (this.paddle_red_pos_full_z - this.puck_position_z);
        this.dis_x2 = (this.paddle_red_pos_full_x - this.puck_position_x);

        this.dis2 = distanceVector((new THREE.Vector3(this.paddle_red_pos_full_x, 0, this.paddle_red_pos_full_z)), (new THREE.Vector3(this.puck_position_x, 0, this.puck_position_z)));

        if(this.dis2 < Q.COMBINED_RADIUS) {

            //2ND TRY:
            if(Math.abs(this.paddle_red_speed_x) >= Math.abs(this.puck_speed_x)) {
                this.puck_speed_x = this.paddle_red_speed_x * 3;
            }
            if(Math.abs(this.paddle_red_speed_z) > Math.abs(this.puck_speed_z)) {
                if(this.dis_z2 > -0.02) {
                    this.puck_speed_z = turn_positive(this.paddle_red_speed_z * -3);
                } else {
                    this.puck_speed_z = turn_negative(this.paddle_red_speed_z * -3);
                }
            }

            if(this.dis_z2 > -0.02) {
                this.puck_speed_z = turn_negative(this.puck_speed_z);
            } else {
                this.puck_speed_z = turn_positive(this.puck_speed_z);
            }
        }

        //MOVING PUCK:

        //Hit on wall:
        if((this.puck_position_x + (this.puck_speed_x / 1000)) > 0.47) {
            //The puck has hit a wall

            //We can do this to stop calling the same function hundreds of times
            if(this.puck_speed_x > 0) {
                //Playing sound
                this.puckHitWall();
            }

            //Changing the x speed
            this.puck_speed_x = turn_negative(this.puck_speed_x);

        } else if((this.puck_position_x + (this.puck_speed_x / 1000)) < -0.47) {
            //The puck has hit a wall

            //Same thing here:

            if(this.puck_speed_x < 0) {
                this.puckHitWall();
            }

            //Changing the x speed
            this.puck_speed_x = turn_positive(this.puck_speed_x);

        }

        //The z-axis walls
        if((this.puck_position_z + (this.puck_speed_z / 1000)) > 1) {
            //If the wall is hit

            if((this.puck_position_x + (this.puck_speed_x / 1000)) < 0.15 && (this.puck_position_x + (this.puck_speed_x / 1000)) > -0.15 ){
                //If the puck has entered the goal
                
                //Scoring a goal
                this.resetPuck(1);  //Giving the paddle to the blue
                this.points_red ++; //Adding a point

                console.log("RED SCORED! points red: " + this.points_red);  //Debugging

                this.scored();  //Running this function (miscellaneous)

            } else {
                //If not, the puck has hit the wall

                //Same thing as the x axis
                if(this.puck_speed_z > 0) {
                    this.puckHitWall();
                }

                //Setting the z speed
                this.puck_speed_z = turn_negative(this.puck_speed_z);
                
            }

        } else if((this.puck_position_z + (this.puck_speed_z / 1000)) < -1.3) {
            //If the wall is hit

            if((this.puck_position_x + (this.puck_speed_x / 1000)) < 0.15 && (this.puck_position_x + (this.puck_speed_x / 1000)) > -0.15 ){
                //The puck has entered the goal

                //Same thing as the red points
                this.resetPuck(-1);

                this.points_blue ++;    //Giving blue a point

                console.log("BLUE SCORED! points blue: " + this.points_blue);   //Debugging

                this.scored();

            } else {
                //If not, the paddle has hit the wall

                //Same thing as red
                if(this.puck_speed_z < 0) {
                    this.puckHitWall();
                }

                this.puck_speed_z = turn_positive(this.puck_speed_z);

            }
        }

        //Decelerating: current graph -> y = x^2
        this.decel_force_x = (this.puck_speed_x * this.puck_speed_x) / 2500;    //Calculating the xforce to be applied on the puck to decelerate it
        this.decel_force_z = (this.puck_speed_z * this.puck_speed_z) / 2500;    //Calculating the zforce to be applied on the puck to decelerate it

        //If the puck is moving
        if(this.puck_speed_x < 0) {
            //If it is moving backwards x

            this.puck_speed_x += this.decel_force_x;    //Adding force to get to 0 (acccelerating)

        } else {
            //If it is moving forwards x

            this.puck_speed_x -= this.decel_force_x;    //Subtracting force to get to 0 (slowing down)

        }

        //The same thing on the z axis
        if(this.puck_speed_z < 0) {

            this.puck_speed_z += this.decel_force_z;

        } else {

            this.puck_speed_z -= this.decel_force_z;

        }

        //End of calculations

    }

    puckHitWall() {

        //Called when the puck hits the wall
        this.publish(this.id, 'hit-wall-sound', this.points_blue) 

    }

    scored() {
        //A point is scored

        this.points_array = [this.points_blue, this.points_red];    //Formatting a new array

        this.publish(this.id, "points-changed", this.points_array); //Publishing a change in points

        //3 points need to be scored

        if(this.points_array[0] >= 3) {
            //3 points are scored

            this.won(); //Ending the match

        } else if(this.points_array[1] >= 3) {
            //3 points are scored

            this.won(); //Ending the match

        }
    }

    resetPuck(puck_z) {
        //Reseting the puck position

        if(puck_z == 2) {
            //A random position (start of game)

            this.chosen = Math.random();    //Getting a random number
            if(this.chosen > 0.5) {
                //1/2 probability
                
                this.puck_position_z = 0.5; //Blue side

            } else {
                //1/2 probability

                this.puck_position_z = -0.5; //Red side

            }
            
        } else {

            this.puck_position_x = 0;           //Resetting the position
            this.puck_position_z = 0.5 * puck_z;    //Puck z is 1 or -1 (depending on the side)

            this.puck_speed_x = 0;  //resetting the puck speed
            this.puck_speed_z = 0;  //resetting the puck speed

        }

    }

    won() {
        //A player has won


    }

    updatePosStep() {

        this.last_pos_update += 1;  //For the frame calculation

        //Removes bug like this
        this.future(5).updatePosStep(); //Once every 5 * 5 =  25 (every 1/4 miliseconds)

    }
}

MyModel.register("MyModel");    //Registering teh model

//Setting up the 3js scene
function setUpScene() {

    //Simple functions for visuals (more at the top)

    if(window.location.href == win_url) {

        confetti.render();  //Rendering the confetti if the player has won

    }

    if(player) {

        //If the client is a player, we hide the overlay and show the player tooltip

        document.getElementById("black-overlay").style.display = "none";
        document.getElementById("player-tooltip").style.display = "block";

    } else {

        //If the client is a spectator, we hide the player tooltip
        document.getElementById("player-tooltip").style.display = "none";

    }

    //Boilerplate 3js
    const scene = new THREE.Scene();    //Creating the scene

    const light = new THREE.AmbientLight(0xffffff, .65);    //Ambience light to make the scene look nice
    light.position.set(0,5,0);  //Light is set to the top (shine down)
    scene.add(light);   //Adding the light to the scene

    //The second light to create some shadows
    const light2 = new THREE.DirectionalLight(0xffffff, .5); //Less intensity
    light2.position.set(0,2,-2.5);  //To cast shadows (look nice)
    scene.add(light2);

    scene.background = new THREE.Color(0x87ceeb);   //Adding a bg color when the scene is loading

    console.log('Players at time of loading: ' + players_array_indep);  //Logging the players at the time of loading

    //Rendering onto the canvas (defined in html)
    const threeCanvas = document.getElementById("three");   //Getting the canvas
    
    //Renderer boiler plate
    const renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas,
        antialias: true,
        viewsmoothingEnabled: true
    });

    renderer.setClearColor(0xaa4444);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio );
    renderer.gammaOutput = true;        //Could be removed in the future (lost browser support)
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);

    //Checking if the client is a player or is a spectator (defined in view)
    if(player) {
        //Here the player is currently playing (on the table)
        document.getElementById('buttons').style.display = 'none';

        //Camera has to be defined here to edit fov, position and rotation
        const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.rotation.x = -0.46;

        camera.fov = 28;
        
        //On window resize function for the player (has to be defined twice, one if the client is a player and if the client is a spectator) Because of local vrb.
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);   //The event listner
        onWindowResize();

        //Checking if the player is player 1 (blue) or player 2 (red)
        if(player && window.location.href == play_url) {
            //Setting the position for the blue player
            camera.position.set(0,2,2.5);
        } else if(player && window.location.href == play_url2){
            //Setting the position for the red player
            camera.position.set(0,2,-2.5);
            camera.rotation.z = 3.139;      //Rotating it accordingly
            camera.rotation.x = -2.7;
        }

        console.log('Clients id: ' + player_id);

        //Getting the drag position
        const raycaster = new THREE.Raycaster();
        let dragObject = null;
        const dragOffset = new THREE.Vector3();
        const dragPlane = new THREE.Plane();
        const mouse = new THREE.Vector2();

        function setMouse(event) {
            //Formatting the mouse x and mouse y coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 3 + 1;
        }

        function onPointerMove(event) {

            //Lerping the position depending on if the player is blue or red (To create the drag effect)
            if(window.location.href == play_url) {
                //Negative (*-1) if the player is blue (player 1)

                camera.position.lerp(new THREE.Vector3(((0 - ((event.clientX / window.innerWidth) * 2 - 1)) * -1) / 30, 2, camera.position.z), 0.05);
            
            } else if(window.location.href == play_url2) {
                //Positive if the player is blue (player 1)

                camera.position.lerp(new THREE.Vector3(((0 - ((event.clientX / window.innerWidth) * 2 - 1))) / 30, 2, camera.position.z), 0.05);
            
            }

            event.preventDefault(); //Preventing false movements (default mouse position)

            dragObject = scene.getObjectByName("target");       //Named in view
            //Dragging the object using a similar system to this (from Croquet exaples): https://croquet.io/docs/croquet/tutorial-1_5_3d_animation.html
            dragOffset.subVectors(dragObject.position, scene.getObjectByName("target").position);
            dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), scene.getObjectByName("target").position);
            
            setMouse(event);    //Getting the coordinates of teh muse position
            raycaster.setFromCamera(mouse, camera);
            const dragPoint = raycaster.ray.intersectPlane(dragPlane, new THREE.Vector3());
            dragObject.q_onDrag(new THREE.Vector3().addVectors(dragPoint, dragOffset));
            //This is then interpreted by the view
        }
        threeCanvas.addEventListener('pointermove', onPointerMove); //Adding the event listener

        function sceneRender() {renderer.render(scene, camera);}    //A simple render function
        return {scene, sceneRender};                                //Returning the values we want to get in the view

    } else {
        //Here the player is currently spectating

        //Defining the camera and placing it at the door with a wider FOV.
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

        camera.position.z = 0;
        camera.position.x = 2;
        camera.position.y = 1.5;

        camera.rotation.x = -1.525;   //Rotating it to face the table
        camera.rotation.y = 1.2; //Rotating it to face the table
        camera.rotation.z = 1.535; //Rotating it to face the table

        //Testing audio
        const listner = new THREE.AudioListener();
        camera.add(listner);
        
        const sound = new THREE.PositionalAudio(listner);
        const audioLoader = new THREE.AudioLoader();
        
        audioLoader.load('./assets/audio/backround.mp3', (buffer)=> {
            sound.setBuffer(buffer);
            sound.setVolume(3);
            sound.play();
            sound.setLoop(true);
        })

        //The window resize function has to be called again because of naming conventions
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);   //Adding the event listner
        onWindowResize();

        //Adding the 3js First Person Controls (These do not require an import)

        //The scene render function here is a little longer (acts as an animate function for the camera controlers)
        function sceneRender() {

            //Getting the x and z distance from the player to the table (using vector math here is not efficient because of square roots)           
            let distance_from_table_x = turn_positive(0 - camera.position.x);   //The distances must be positive to comate (using function at the beggining)
            let distance_from_table_z = turn_positive(0 - camera.position.z);   //The distances must be positive to comate (using function at the beggining)

            //If the player is close to the table, we run the function at the top of the page to redirect him to the player url.
            if(distance_from_table_x + distance_from_table_z < Q.DISTANCE_TO_TABLE_FOR_RED) {   //Using a croquet constant here
                wantToPlay();
            }

            camera.position.y = 2.25;   //The camera y position changes because of the 3js camera controls

            player_pos = [camera.position.x, camera.position.y, camera.position.z, camera.rotation.y];     //For the 'Metaverse simulation' we save the player's position in a vrb.

            requestAnimationFrame(sceneRender); //We animate this function
            renderer.render(scene, camera);     //Rendering the scene, similar to the prefious function

        };
        sceneRender();  //Calling the function the first time
        return {scene, sceneRender, camera};    //Returning the variables we want to get in the view
    
    }

}

//The croquet View declaration
class MyView extends Croquet.View {

    constructor(model) {

        super(model);
        this.sceneModel = model;    //Storing the model as a vrb.

        //Getting variables from the model and storing them in global variables for ease of access.
        player_id = this.viewId;                                    //Getting the view id (to locate the player)
        players_array_indep = model.players_array;                  //Getting the array of the players currently playing
        conn_players_array_indep = model.connected_players;         //Getting the array of the players currently connected

        //Setting the scoreboard (calling functions defined at the top)
        if(players_array_indep.length >= 2) {
            //If there are 2 players playing there is an active game (loading livescore)
            scoreboardActiveGame();
        } else if(players_array_indep.length == 1) {
            //If there is only one player we inform the client that the red player has not connected yet
            scoreboardPlayerMissing();
        } else {
            //If there is no active game we inform the client through the livescore.
            scoreboardNoGame();
        }

        //Checking if the user is a player (if not a spectator) 
        if(window.location.href == play_url || window.location.href == play_url2) {
            //The player has a player url.
            if(players_array_indep[0] != null && players_array_indep[1] != null) {
                //If the spot is occupied (forced entry), the player is kicked
                window.location.href = spec_url;
            } else {
                //If not, the player is legitimate.
                if(players_array_indep[0] != null && window.location.href == play_url) {
                    //If the blue player spot has been taken before he has loaded in (More porbably an attempt at forced entry)
                    window.location.href = play_url2;                                       //Redirecting if place is occupied (player has tried to force entry)
                
                } else if(players_array_indep[1] != null && window.location.href == play_url2) {
                
                    window.location.href = spec_url;      //Cycle

                } else {
                    
                    //If not, he is a legitimate player
                    player = true;
                    this.want_play = -1;

                    if(window.location.href == play_url) {
                        this.want_play = 0;
                    } else {
                        this.want_play = 1;
                    }

                    this.data_format = [this.viewId, this.want_play]

                    this.publish(model.id, 'player-playing', this.data_format);  //A new player has joined. (Publishing the event)
                }
            }
        }

        //Saving the scene in 2 variables
        const sceneSpec = setUpScene(); //Rendering the scene
        this.scene = sceneSpec.scene;   //Saving the scene in a variable

        //If the player is a player, we get the sceneRender function returned from the scene (used later)
        if(player) {
            this.sceneRender = sceneSpec.sceneRender;   //Saving the vrb.
        }

        /*
            Instead of direcly moving the paddle, the player moves a 'target' to better calculate the position and enable better dragging.
            The position is then copied over to the paddle. The target also exists for all players, because it is just more efficient than
            lerping the entire object directly.
        */
       //Decalaring the blue target
        this.blue_target = new THREE.Mesh(
            new THREE.CircleGeometry( 0.01, 1 ),
            new THREE.MeshStandardMaterial({color: 'white', opacity: 0.1}),);   //Making the target almost invisible
        
            //Check later, causes bug:
            this.blue_target.position.fromArray(model.paddle_blue_target_pos);  //Getting the position from the model (so that we can spawn the paddles in the correct position)
            this.scene.add(this.blue_target);
            this.blue_target.rotation.x = -1.58;    //Rotating the target to make it horizontal
            //Managing the drag event (mouse move, we dont look for a click)
            this.blue_target.q_draggable = true;    //The target is movable once it is loaded (can be moved by player)
            this.blue_target.q_onDrag = posVector => this.posPadBlue(posVector.toArray());  //Calling a move function
        
        
        this.subscribe(model.id, 'paddle-blue-change-pos', this.moveTargetBlue);

        this.blue_target.position.y = 1.05; //Putting it on the table

        //Declaring the red target:
        this.red_target = new THREE.Mesh(
            new THREE.CircleGeometry( 0.01, 1 ),
            new THREE.MeshStandardMaterial({color:'white', opacity: 0.1}),);    //We set this target to be almost transparent (debugging process)
        
            this.red_target.position.fromArray(model.paddle_red_target_pos);    //Getting the target position from the model
            this.scene.add(this.red_target);
            this.red_target.rotation.x = -1.58;     //Putting it flat on the table
            // set Croquet app-specific properties for handling events
            this.red_target.q_draggable = true;
            this.red_target.q_onDrag = posVector => this.posPadRed(posVector.toArray());    //Same thing here, we call a function if the user has moved their mouse

        this.subscribe(model.id, 'paddle-red-change-pos', this.moveTargetRed);

        this.red_target.position.y = 1.05;  //Putting it on the table

        /*
            If the user is a player and he is the blue player, we set the blue target to be his target (what he moves).
            We do this by changing the name and then looking for the element with the 'target' name.
            REMEMBER: if the user is not a player (not at the table playing), we don't set a target.
        */
        if(player && window.location.href == play_url) {
            //Player blue:
            this.blue_target.name = 'target';
        } else if(player && window.location.href == play_url2) {
            //Player red:
            this.red_target.name = 'target';
        }

        //Loading objects

        /*
            We use a simple GLTF loader to load the .glb models. We then get the root and save it into an array which we declared at the top of the page.
            We can then access their root and modify their position and rotation values (if the object is moving)
            To calculate the loaded percentage, we user an "xhr" function to get the individual load percentage. Every time the object loads a little 
            bit, we call a function at the top of the page to calculate the percentage loaded and put it into the loading bar.
        */

        //LOADING THE ASSETS

        const loader = new GLTFLoader(); //Loader
        
        //Puck
        loader.load('./assets/objects/puck.glb', function(glb){

            const root_puck = glb.scene;
            puck.push(root_puck);   //Appending the root of the model to the puck array
            puck[0].position.z = 0.5;   //Setting the position (later changed in the model when 2 player connected)
            sceneSpec.scene.add(root_puck);

        }, function (xhr) {

            puck_perc = xhr.loaded / xhr.total * 100;   //Calculating the percentage that has been loaded (in percent)
            console.log("Puck percentage loaded: " + puck_perc);    //Logging for debugging

            loadPercentage();   //Calling the function at the top of the page

        });

        //Table:
        loader.load('./assets/objects/table.glb', function(glb){

            const root_puck = glb.scene;
            table.push(root_puck);  //Appending to the table array (declared at the top)
            sceneSpec.scene.add(root_puck);

        }, function (xhr) {

            room_perc = xhr.loaded / xhr.total * 100;   //Same thing here
            console.log("Room percentage loaded: " + room_perc);

            loadPercentage();

        });

        //Blue paddle
        loader.load('./assets/objects/paddle_blue.glb', function(glb){

            const root_puck = glb.scene;
            paddle_blue.push(root_puck);    //Appending to the paddle blue array
            paddle_blue[0].position.z = 0.5; //Setting the position close to the player (not in the center)
            sceneSpec.scene.add(root_puck);

        }, function (xhr) {

            padr_perc = xhr.loaded / xhr.total * 100;   //Same thing here
            console.log("Red paddle percentage loaded: " + padr_perc);

            loadPercentage();

        });

        //Red paddle
        loader.load('./assets/objects/paddle_red.glb', function(glb){

            const root_puck = glb.scene;
            paddle_red.push(root_puck);     //Same thing here
            paddle_red[0].position.z = -0.5;    //Setting the position close to the player (not in the center)
            sceneSpec.scene.add(root_puck);

        }, function (xhr) {

            padb_perc = xhr.loaded / xhr.total * 100;   //The same percentage calculation arithmetic
            console.log("Blue paddle percentage loaded: " + padb_perc);

            loadPercentage();

        });

        //If the user is not a player, we can load the objects of the players that are currently playing
        if(!player) {
            //The user is not a player (spectator)

            //Loading the obj of the blue player
            loader.load('./assets/objects/player_blue.glb', function(glb){
                const root_puck = glb.scene;
                player_models.push(root_puck);

                //Here we have to check to see if we have to show the object
                if(players_array_indep[0] != null) {
                    //The blue player is connected

                    player_models[0].position.x = 0;       //REMEMBER: In the obj of the player model, the natural position of the player is (0,0,0), because the player is moved towards the bottom
                
                } else {
                    //There are no players connected

                    //We move the blue player model out to the side, because it is move efficient than making it invisible but gives the same effect
                    player_models[0].position.x = 8;    //an x of 8 exeeds bounds

                }

                sceneSpec.scene.add(root_puck); //Adding it to the scene

            });

            //Loading the obj of the red player
            loader.load('./assets/objects/player_red.glb', function(glb){
                const root_puck = glb.scene;
                player_models.push(root_puck);

                //Same thing here

                if(players_array_indep[1] != null) {

                    player_models[1].position.x = 0;

                } else {

                    player_models[1].position.x = 8;
                }

                sceneSpec.scene.add(root_puck);
                
            });
        }
        
        //Subscribes
        this.subscribe(model.id, 'puck-pos-changed', this.movePuck);    //Puck moved
        this.subscribe(model.id, 'points-changed', this.updatePoints);  //Points changed
        
        this.subscribe(model.id, 'ended', this.ended);                  //Game ended
        this.subscribe(model.id, 'client-joined', this.updatePlayers);  //Somebody Joined
        this.subscribe(model.id, 'client-left', this.updatePlayers);    //Somebody Left

        //TESTING VIEW PLAYER MODELS
        this.subscribe(model.id, 'too-many-players', this.toWaitingRoom);//Kick to waiting room

        this.subscribe(model.id, 'hit-wall-sound', this.hitWallSound);  //The puck hit a wall
    
        //Changing the player status buttons on load
        if(players_array_indep[0] != null && players_array_indep[1] != null) {

            document.getElementById('blue_player_status').innerHTML = 'Occupied';
            document.getElementById('red_player_status').innerHTML = 'Occupied';

        } else if(players_array_indep[0] != null) {

            document.getElementById('blue_player_status').innerHTML = 'Occupied';
            document.getElementById('red_player_status').innerHTML = 'JOIN';

        } else if(players_array_indep[1] != null) {

            document.getElementById('blue_player_status').innerHTML = 'JOIN';
            document.getElementById('red_player_status').innerHTML = 'Occupied';

        } else {
    
            document.getElementById('blue_player_status').innerHTML = 'JOIN';
            document.getElementById('red_player_status').innerHTML = 'JOIN';

        }
        
    }

    hitWallSound() {
        //The puck has hit a wall

        if(player) {
            
            playMusic(3, 2);    //The sound is higher when the player is playing

        } else {

            playMusic(3, 1);

        }

    }

    toWaitingRoom(viewId) {

        console.log('Room is full');    //Debugging

        if(player_id == viewId) {

            //The player is being kicked out from the server
            window.location.href = wr_link; //Sending them to the waiting room link (home)

        }

    }

    updatePoints(points) {
        //Somebody has scored       

        //Playing the 'goal' sfx
        if(player) {
            //Same thing here, louder if the player is playing (2nd attribute)

            playMusic(2, 2)

        } else {

            playMusic(2, 1);

        }

        //The function at the top of the page
        setPoints('b', points[0]);  //Updating the points using the formatted array
        setPoints('r', points[1]);  //Updating the points using the formatted array

    }

    updatePlayers() {
        //A player has joined or left

        players_array_indep = this.sceneModel.players_array;  //Getting the players array and storing it locallys 

        scoreboardActiveGame();

        //Changing the scoreboards
        if(players_array_indep[0] != null && players_array_indep[1] != null) {
            //A game is activley being played

            //Both models being shown
            player_models[0].position.x = 0; 
            player_models[1].position.x = 0;

            document.getElementById('blue_player_status').innerHTML = 'Ocuppied';
            document.getElementById('red_player_status').innerHTML = 'Ocuppied';

        } else if(players_array_indep[0] != null) {
            //The red player is missing

            //Only the blue player model to be shown
            player_models[0].position.x = 0;    
            player_models[1].position.x = 8;

            document.getElementById('blue_player_status').innerHTML = 'Ocuppied';
            document.getElementById('red_player_status').innerHTML = 'JOIN';

        } else if(players_array_indep[1] != null) {
            //The blue player is missing

            //Only the blue player model to be shown
            player_models[1].position.x = 0;    
            player_models[0].position.x = 8;

            document.getElementById('blue_player_status').innerHTML = 'JOIN';
            document.getElementById('red_player_status').innerHTML = 'Ocuppied';

        } else {
            
            scoreboardNoGame();

            //No player models to be shown
            player_models[0].position.x = 8;
            player_models[1].position.x = 8;

            document.getElementById('blue_player_status').innerHTML = 'JOIN';
            document.getElementById('red_player_status').innerHTML = 'JOIN';

        }

    }

    ended(winner) {
        //If the match has ended

        if(player && player_id == winner) {
            //If the player is the winner

            window.location.href = win_url; //Send to win url, to display win messsage

        } else if(player && winner != false) {
            //If the player is the loser

            window.location.href = lose_url;    //Send to lose url, to display lost message

        } else if(winner == false && player) {
            //If the other player has disconnected

            //window.location.href = dis_url;     //Send to disconected url

        }

    }

    posPadBlue(pos) {
        //If the blue paddle has moved

        this.publish(this.sceneModel.id, 'paddle-blue-moved', pos); //Publishing the position of the move

    }

    posPadRed(pos) {
        //If the red paddle has moved

        this.publish(this.sceneModel.id, 'paddle-red-moved', pos);  //Same thing here

    }

    moveTargetBlue(pos) {
        //The mouse has been dragged (player is player 1)

        // this method just moves the view of the target triangle
        if(pos[0] <= 0.45 && pos[0] >= -0.45) {
            //Checking the bounds

            this.blue_target.position.x = pos[0];

            paddle_blue[0].position.x = this.blue_target.position.x;    //Cloning the x position

        }

        //NOTE: Z bounds are not needed

        //Moving the paddle accordingly

        this.blue_target.position.z = (pos[1] * -1) + 1.8;  //Formatting

        //Cloning the position (moving the paddle model)
        paddle_blue[0].position.z = this.blue_target.position.z;

    }

    moveTargetRed(pos) {
        //The mouse has been dragged (player is player 2)

        //Moving the red target triangle
        if(pos[0] <= 0.45 && pos[0] >= -0.45) {
            //Checking for bounds

            this.red_target.position.x = pos[0];

            paddle_red[0].position.x = this.red_target.position.x;  //Cloning the position

        }

        //Z bounds are also not needed

        //Moving the target
        this.red_target.position.z = (pos[1]) - 1.8;    //Formatting

        //Cloning the position (moving the paddle model)
        paddle_red[0].position.z = (this.red_target.position.z);

    }

    movePuck(pos) {
        //The puck has been moved

        puck[0].position.set(pos[0], puck[0].position.y, pos[1])    //Setting the puck's position

    } 
  
    update(time) {
        //Every Croquet update

        if(player) {

            this.sceneRender(); //Calling the sceneRender method once loaded in

        } else {

            if(players_array_indep[0] != null && players_array_indep[1] != null) {

                document.getElementById('blue_player_status').innerHTML = 'Ocuppied';
                document.getElementById('red_player_status').innerHTML = 'Ocuppied';
    
            } else if(players_array_indep[0] != null) {
    
                document.getElementById('blue_player_status').innerHTML = 'Ocuppied';
                document.getElementById('red_player_status').innerHTML = 'JOIN';
    
            } else if(players_array_indep[1] != null) {
    
                document.getElementById('blue_player_status').innerHTML = 'JOIN';
                document.getElementById('red_player_status').innerHTML = 'Ocuppied';
    
            } else {
        
                document.getElementById('blue_player_status').innerHTML = 'JOIN';
                document.getElementById('red_player_status').innerHTML = 'JOIN';
    
            }

        }

    }
}

let currentTooltip = 0; //The current tooltip
const tooltip = ['Move your mouse to move the paddle','Move your mouse to move the paddle', 'Move your mouse to move the paddle']  //The messages
const tooltip_icon_href = ['./assets/icons/mouse.png','./assets/icons/mouse.png','./assets/icons/mouse.png']  //The icon urls

//Changing toolip function
function changeTooltip() {

    if(player) {
        //If the user is a player

        //We will change the tooltip instructions accordingly

        if(currentTooltip == 0) {
            //The current tooltip is 0

            currentTooltip = 1; //Changing it 

            //Loading the text and icons
            document.getElementById('tooltip-instructions').innerHTML = tooltip[1];
            document.getElementById('instruction-icon').src = tooltip_icon_href[1];

        } else if(currentTooltip == 1) {
            //Same thing here
            
            currentTooltip = 2;

            document.getElementById('tooltip-instructions').innerHTML = tooltip[2];
            document.getElementById('instruction-icon').src = tooltip_icon_href[2];

        } else if(currentTooltip == 2) {
            //Same thing here
                        
            currentTooltip = 0;

            document.getElementById('tooltip-instructions').innerHTML = tooltip[0];
            document.getElementById('instruction-icon').src = tooltip_icon_href[0];

        }

    }

}

setInterval(changeTooltip, 2500);   //Calling it every 2.5 seconds

//Croquet session data
Croquet.Session.join({
  appId: "com.gmail.davidgonzalezsomosaguas.microverse",
  apiKey: "1Pk7dnt6DcO16ombENGt89t09IDK5Icgihj6oLxai",
  name: "unnamed", 
  password: "secret",
  model: MyModel, 
  view: MyView,
});

//Bug fixes:

//Ending the game if the user is a spectator
var isTabActive = true;

window.onfocus = function () { 
  if(isTabActive == false) {
    window.location.href = spec_url;
  }
}; 

window.onblur = function () { 
  isTabActive = false; 
};

const messageForm = document.querySelector("#messageForm"); //form to get messages
const messageInput = document.querySelector("#messageInput"); // form where messages are typed
const messagesArea = document.querySelector("#messagesArea"); // <section> where the messages spawn


const roomName = document.getElementById('roomname'); //room title display


//Socketio
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("http://localhost:3030");


//room ID
const getLastItem = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)
const currentRoom = getLastItem(window.location.href);



//Create Username (move this to server side so users cant change their user with editing files)
let user;
getUsername();
function getUsername() {
  if (!localStorage.getItem("user")) {
    localStorage.setItem("user", "Anon" + Math.floor(Math.random() * 10000));
    user = localStorage.getItem("user");
  } else {
    user = localStorage.getItem("user");
  }
}

// request chat log on connection
socket.emit('gethistory', currentRoom);

//   SUBMIT FORM  \\
messageForm.addEventListener("submit", (e) => {
  let name = user;
  let message = messageInput.value;
  socket.emit("message", { name: name, message: message, room: currentRoom });
  createMessage({ name: name, message: message });

  messageInput.value = "";
  e.preventDefault();
});

//load messages onscreen
socket.on("messages", (arg) => {
  let messages = JSON.parse(arg);
  console.log();
  messages.forEach((m) => {
    let messageblock = document.createElement("div");
    let nametag = document.createElement("b");
    let messagetext = document.createElement("p");

    nametag.innerHTML = m.name;
    messagetext.innerHTML = m.message;

    messageblock.appendChild(nametag);
    messageblock.appendChild(messagetext);

    messagesArea.appendChild(messageblock);
  });
});

//new message from server
socket.on("newmessage", (arg) => {
  createMessage(arg);
});

// load new message onscreen
function createMessage(m) {
  let messageblock = document.createElement("div");
  let nametag = document.createElement("b");
  let messagetext = document.createElement("p");
  messageblock.classList.add("messageBlock");
  nametag.innerHTML = m.name;
  messagetext.innerHTML = m.message;

  messageblock.appendChild(nametag);
  messageblock.appendChild(messagetext);
  messagesArea.appendChild(messageblock);

  //scroll to bottom of messages
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

//getting room name from server
  socket.emit('getname', currentRoom);
  socket.on('roomname', (arg) =>{
   roomName.innerText = arg;
  console.log('set room name to ' + arg);
  })


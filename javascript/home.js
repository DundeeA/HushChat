import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("http://localhost:3030");

const createbutton = document.querySelector("#createButton");
const joinbutton = document.querySelector("#joinButton");

const mainContent = document.getElementById("#maincontent");
const joinContent = document.getElementById("joincontent");
const createContent = document.getElementById('createcontent');

const idinput = document.getElementById("idinput");
const roomnameinput = document.getElementById('nameinput');

const enterbutton = document.getElementById("enterbutton");

//open create button
createbutton.addEventListener("click", (e) => {
     createContent.style.visibility = 'visible'; 
     maincontent.style.visibility = "hidden";
});

//close create menu
document.getElementById("createbackbutton").addEventListener("click", () => {
  console.log("clicked back button");
  createContent.style.visibility = "hidden";
  maincontent.style.visibility = "visible";
  roomnameinput.value = '';
});

// click create room button
document.getElementById('createjoinbutton').addEventListener('click', () => {
    let roomname = roomnameinput.value;
  socket.emit("create", {'creator': socket.id, 'roomname': roomname}); //have server create room
})


createContent.addEventListener('submit', (e) => { e.preventDefault();});
joinContent.addEventListener('submit', (e) => {e.preventDefault();});

// open join menu
joinbutton.addEventListener("click", (e) => {
  console.log("clicked join button");
  joincontent.style.visibility = "visible";

  maincontent.style.visibility = "hidden";
});

//close join menu
document.getElementById("joinbackbutton").addEventListener("click", () => {
  console.log("clicked back button");
  joincontent.style.visibility = "hidden";
  maincontent.style.visibility = "visible";
  idinput.value = '';
});

//join room
enterbutton.addEventListener("click", () => {
  joinroom(idinput.value);
});
function joinroom(roomid) {
  window.location.href = `${window.location.href}${roomid}`;
}

//redirect
socket.on("redirect", (arg) => {
  joinroom(arg);
});

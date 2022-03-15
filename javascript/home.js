import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("http://localhost:3030");

//main menu ui
const mainContent = document.getElementById("maincontent"); //form for main page
const createbutton = document.getElementById("createButton"); //button to enter create menu
const joinbutton = document.getElementById("joinButton"); //button to enter join menu

//create room ui
const createContent = document.getElementById('createcontent');//form for room creation menu
const roomnameinput = document.getElementById('nameinput'); //input to enter name for new room
const enterbutton = document.getElementById("enterbutton"); //button to join new room


//join menu ui 
const joinContent = document.getElementById("joincontent"); //form for join room menu
const idinput = document.getElementById("idinput"); // input to enter a room id

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

// click create room button (creates a new room)
document.getElementById('createjoinbutton').addEventListener('click', () => {
    let roomname = roomnameinput.value;
  socket.emit("create", {'creator': socket.id, 'roomname': roomname}); //have server create room
})


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

//join room (goes to room id entered)
enterbutton.addEventListener("click", () => {
  joinroom(idinput.value);
});


//redirect to room id
function joinroom(roomid) {
  window.location.href = `${window.location.href}${roomid}`;
}

//socket redirect
socket.on("redirect", (arg) => {
  joinroom(arg);
});

//disable form submit defaults 
createContent.addEventListener('submit', (e) => { e.preventDefault();});
joinContent.addEventListener('submit', (e) => {e.preventDefault();});

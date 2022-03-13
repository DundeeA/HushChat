const express = require("express");
const bp = require("body-parser");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { json } = require("express/lib/response");
const app = express();

var fs = require("fs");
const { stringify } = require("querystring");
const { allowedNodeEnvironmentFlags } = require("process");
const { Console } = require("console");

app.use("/css", express.static("css"));
app.use("/javascript", express.static("javascript"));

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

//Check rooms
let roomList = [];
updateRoomList();

const roomLifeSpan = 15; //(minutes)

// Checking all rooms last updated time and deleting
setInterval(() => {
  if (roomList.length != 0) {
    roomList.forEach((room) => {
      let roomdata;
      fs.readFile(`rooms/${room}/data.json`, "utf8", (err, data) => {
        let currenttime = new Date().getMinutes();
        let roomtime = JSON.parse(data).updated;
        if (
          parseInt(currenttime) >=
            parseInt(roomtime) + parseInt(roomLifeSpan) ||
          parseInt(currenttime) < parseInt(roomLifeSpan)
        ) {
          deleteRoom(room);
        }
      });
    });
  }
}, roomLifeSpan * 60000);

//Socket io
const io = require("socket.io")(3030, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

//socket.io connections
io.on("connection", (socket) => {
  // Emit chat history on connection
  socket.on("gethistory", (arg) => {
    if (fs.existsSync(`rooms/${arg}/messages.json`)) {
      fs.readFile(`rooms/${arg}/messages.json`, "utf8", (err, data) => {
        //read json file
        let currentMessages = JSON.parse(data); //convert json file data into array
        console.log("sent all messages to room " + arg + "..." + data);
        socket.emit("messages", data);
      });
    }
  });

  //sending name
  socket.on("getname", (arg) => {
    let name = {};
    fs.readFile(`rooms/${arg}/data.json`, "utf8", (err, data) => {
      name = JSON.parse(data);
      socket.emit("roomname", name.name);
    });
  });

  //recieving message
  socket.on("message", (arg) => {
    console.log("recieved message inside room " + arg.room);
    if (fs.existsSync(`rooms/${arg.room}/messages.json`)) {
      fs.readFile(`rooms/${arg.room}/messages.json`, "utf8", (err, data) => {
        //read json file
        let currentMessages = JSON.parse(data); //convert json file data into array
        currentMessages.push(arg); // push new message request to the array
        updateDirectory(currentMessages, arg.room); // add the new message to the json file

        socket.broadcast.emit("newmessage", arg);
      });
    } else {
      fs.writeFile(
        `rooms/${arg.room}/messages.json`,
        JSON.stringify("[" + arg + "]"),
        function (err, result) {}
      );
    }
    console.log("current rooms" + roomList);
  });

  // request to create new room
  socket.on("create", (request) => {
    let client = request.creator;
    let roomname = request.roomname;
    createRoom(client, roomname);
  });
});

//Express server
app.listen(3000, () => {
  console.log("Express listening on port 3000");
});

// visit home page
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Visit room url
app.get("*", (req, res) => {
  //check if room requested exist
  if (fs.existsSync("rooms/" + req.url)) {
    res.render("room.ejs"); // render room
  } else {
    console.log("rooms" + req.url + " Didnt exist");
    res.redirect("/");
  }
});

if (!fs.existsSync("rooms")) {
  fs.mkdirSync("rooms");
}

//Create room
function createRoom(client, roomname) {
  let roomnumber = Math.floor(Math.random() * 100000); //gen a random room number
  let roomDir = "rooms/" + roomnumber;
  //create file for room
  if (!fs.existsSync(roomDir)) {
    fs.mkdirSync(roomDir);
    io.to(client).emit("redirect", roomnumber); //redirect client that created room , to that room
    console.log("successfully created room " + roomnumber);
  }
  //Create message log for room
  fs.writeFile(
    `rooms/${roomnumber}/messages.json`,
    JSON.stringify([]),
    function (err, result) {}
  );
  //create room data
  let date = new Date();
  fs.writeFile(
    `rooms/${roomnumber}/data.json`,
    JSON.stringify({
      name: roomname,
      updated: `${date.getMinutes()}`,
      creator: client,
    }),
    function (err, result) {}
  );

  //add new room to list of rooms
  updateRoomList();
}

//Adding message to json file
function updateDirectory(newdata, room) {
  fs.writeFile(
    `rooms/${room}/messages.json`,
    JSON.stringify(newdata),
    function (err, result) {}
  );
}

// Delete room
function deleteRoom(roomid) {
  let dir = "rooms/" + roomid;
  fs.rm(dir, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
    console.log(`${roomid} has been deleted!`);
    updateRoomList(); //remove room from list
  });
}

//Get list of current rooms
function updateRoomList() {
  roomList.length = 0;
  //get list of room files from directory
  fs.readdir("rooms", (err, files) => {
    files.forEach((file) => {
      roomList.push(file); //add each room id to the list
    });
  });
}

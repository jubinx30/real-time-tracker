const express = require("express");
const app = express();
const path = require('path');
const http= require("http");
const socketio=require("socket.io");
const server=http.createServer(app);
const io=socketio(server);
const markerColors = ["#e63946", "#1d7a8c", "#f4a261", "#6a4c93", "#2a9d8f", "#e76f51", "#457b9d", "#f72585", "#43aa8b", "#f9c74f"];
const connectedMarkerColors = new Map();

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

io.on("connection",function(socket){
    const usedColors = new Set(connectedMarkerColors.values());
    const markerColor = markerColors.find((color) => !usedColors.has(color)) || markerColors[connectedMarkerColors.size % markerColors.length];
    connectedMarkerColors.set(socket.id, markerColor);

    socket.on("send-location",function(data){
        io.emit("recieve-location",{id: socket.id, ...data, color: markerColor});
    });
    console.log("connected");

    socket.on("disconnect",function(){
        connectedMarkerColors.delete(socket.id);
        io.emit("user-disconnected",socket.id);
    })
})

app.get("/",function (req,res){
    res.render("index"); 
});
const PORT = process.env.PORT || 3200;

server.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});
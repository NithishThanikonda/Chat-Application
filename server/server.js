import {Server} from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(express.static("../client/public"));

const io = new Server(server,{
    cors: {
        // origin: ["http://localhost:3001"],
        origin: "*",
    }
});

io.on("connection", (socket)=>{
    // console.log("New client connected:", socket.id);

    socket.on("message", (message,roomId)=>{
        if(roomId!==""){
            socket.to(roomId).emit("message", message);
            // console.log(`Message from ${socket.id} to room ${roomId}: ${JSON.stringify(message)}`);
            return;
        }
        socket.broadcast.emit("message", message);
        // console.log(`Message from ${socket.id}: ${JSON.stringify(message)}`);
    });

    socket.on("join-room", (roomId)=>{
        socket.join(roomId);
        // console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on("leave-room", (roomId)=>{
        socket.leave(roomId);
        // console.log(`${socket.id} left room: ${roomId}`);
    })

    socket.on("disconnect", ()=>{
        // console.log("Client disconnected:", socket.id);
    });
})

server.listen(3001,()=>{
    console.log("Server is running on port 3001");
})
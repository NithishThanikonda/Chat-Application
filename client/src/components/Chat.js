import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:3001");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [myId, setMyId] = useState("");
  const [roomId, setRoomId] = useState("");
  const lastMessageRef = useRef(null);

  useEffect(()=>{
    if(lastMessageRef.current){
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  },[messages]);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = {
        text: messageInput,
        senderId: socket.id,
        roomId: roomId.trim() !== "" ? roomId : "global",
        timestamp: new Date().toISOString(),
      };
      socket.emit("message", message, roomId);
      setMessageInput("");
      setMessages((prev) => [...prev, message]); // optional: show immediately
    }
  };

  const joinRoom = () => {
    if (roomId.trim() !== "") {
      socket.emit("join-room", roomId);
      // console.log(`${socket.id} joined room: ${roomId}`);
    }
  };

  const leaveRoom = ()=>{
    if(roomId.trim()!=="")
      setRoomId("");
      socket.emit("leave-room", roomId);
  }

  return (
    <>
      <h1>Chat Application.</h1>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <>
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className={`message ${
                msg.senderId === myId ? "my-message" : "other-message"
              }`}
            >
              <div className={`sender-id ${msg.senderId === myId ? "me" : "other"}`}>
                {msg.senderId === myId ? "You" : msg.senderId}
              </div>
              <div>{msg.text}</div>
              <div className="room_and_time">
                <div className={`room-id ${msg.roomId}`}>
                  {msg.roomId}
                </div>
                <div className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                </div>
            </div>
            </>
          ))}
        </div>

      <div className="input-container">
        <div className="box">
          <input
            className="inp"
            type="text"
            placeholder="Type your messages here..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e)=>{e.key === 'Enter' && sendMessage()}}
          />
          <button className="button" onClick={sendMessage}>
            Send
          </button>
        </div>
        <div className="room box">
          <input
            className="inp"
            type="text"
            placeholder="Enter your Room ID here..."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="join button" onClick={joinRoom}>
            Join
          </button>
          <button className="leave button" onClick={leaveRoom}>
            Leave
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;

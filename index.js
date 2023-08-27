const http = require('http')
const { Server } = require('socket.io');
const express = require('express');
const events = require('./events');
const {v4} = require('uuid');
const {endHorizontal, endVertical, endMainDiagonal, endAntiDiagonal} = require('./algorithms');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin:  "*"
    }
  });


const caro = io.of('/caro');
const roomList = [];
const boardSize = 20;
const endGameCheck = (args) => {
    return (endHorizontal(args) || endVertical(args) || endMainDiagonal(args) || endAntiDiagonal(args))
}


caro.on('connection', (socket) => {
    console.log('A user connected')
    
    socket.on('disconnect', ()=> {
        const index = roomList.findIndex((room) => room.host === socket.id);
        if (index !== -1) {
            caro.in(roomList[index].roomID).emit(events.host_disconnected);
            roomList.splice(index,1);
        } else {
            caro.in(socket.joinedRoom).emit(events.player_disconnected);
        }
    })

    socket.on(events.host_room, () => {
        const roomID = v4();
        socket.join(roomID)
        socket.joinedRoom = roomID
        roomList.push({
            roomID: roomID,
            host: socket.id, 
            player: null, 
            X: null, 
            currentPlayer: null, 
            gameEnded: true});
        socket.emit(events.host_success, roomID);
    })

    socket.on(events.join_room, async (roomID) => {
        const index = roomList.findIndex((room) => room.roomID === roomID)
        if (index === -1) return socket.emit(events.connect_error, {roomID, err: 'invalid room'})
        
        const roomPlayer = (await caro.in(roomID).fetchSockets()).length
        if (roomPlayer > 1) return socket.emit(events.connect_error, {roomID, err: 'full'});
        
        socket.join(roomID);
        roomList[index].player = socket.id

        const hostName = caro.sockets.get(roomList[index].host).playerName;
        socket.joinedRoom = roomID
        socket.emit(events.room_connected, {hostName: hostName, roomID: roomID});
        socket.to(roomList[index].host).emit(events.player_joined, socket.playerName)
    })

    socket.on(events.name_selection, (name) => {
        for(let [id, sck] of caro.sockets) {
            if (sck.playerName === name) {
                socket.emit(events.name_rejected, name);
                return
            }
        }
        socket.playerName = name
        socket.emit(events.name_accepted, name);
    })

    socket.on('quit lobby', () => {
        const room = roomList.find((room) => socket.joinedRoom === room.roomID);
        if (!room) return;

        caro.in(socket.id).emit('quitted looby');
        socket.leave(room.roomID);
        socket.joinedRoom = null;
        if (room.host === socket.id){
            caro.in(room.player).emit(events.host_disconnected);
            roomList.splice(roomList.indexOf(room), 1)
        }
        else
            caro.in(room.host).emit(events.player_disconnected);
    })
    socket.on('leave room', (roomID) => {
        socket.leave(roomID);
        socket.joinedRoom = null;
    })
    socket.on(events.start_game, async () => {
        // index of room that this socket is hosting
        const index = roomList.findIndex((room) => room.host === socket.id)
        if (index !== -1) {
            const listPlayer = (await caro.in(roomList[index].roomID).fetchSockets());
            if (listPlayer.length < 2) return;
            let randomIndex = Math.round(Math.random());
            roomList[index].X = randomIndex ? roomList[index].player : roomList[index].host;
            roomList[index].currentPlayer = 'X';
            roomList[index].Board = Array(boardSize).fill('').map(() => Array(boardSize).fill('').map(() => ''))
            roomList[index].gameEnded = false;
            caro.in(roomList[index].roomID).emit(events.start_game, roomList[index].X);
        }
    })

    socket.on('tick', ({x, y}) => {
        const room = roomList.find((room) => socket.joinedRoom === room.roomID)
        if (room && !room.gameEnded){
            const role = room.X === socket.id ? 'X' : 'O'
            if (role !== room.currentPlayer) return null;
            room.Board[x][y] = role;
            const end = endGameCheck({  loc: {x: x, y: y},
                letter: role,
                size: {width: boardSize, height: boardSize},
                board: room.Board   });
            if (end){
                room.gameEnded = true;
                caro.in(socket.joinedRoom).emit('end game', {loc: {x: x, y: y}, role: role, arr: end});
            }
            else{
                room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
                caro.in(socket.joinedRoom).emit('tick', {x: x, y: y, role: role})
            }
        }
    })

    socket.on('restart game', () => {
        const room = roomList.find((r) => r.host === socket.id);
        if (room) {
            room.X = Math.round(Math.random()) ? room.player : room.host;
            room.currentPlayer = 'X';
            room.Board = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0).map(() => ''))
            room.gameEnded = false;
            caro.in(room.roomID).emit('restart game', {X: room.X})
        }
    })
})

server.listen(3001, () => {
    console.log('server listening on port ' + 3001)
})
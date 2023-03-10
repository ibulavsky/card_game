import express from "express";
import { Server } from 'socket.io';
import { createServer} from "http";
import {CARDS_BOARD_ARRAY, CARDS_IN_DECK, SOCKETS_MAP} from "./server/constant.js";
import {
  addPlayerGameLobby,
  addPlayerSocketIdToGameLobby,
  applyMove,
  initializeNewGame,
  removePlayerFromGame,
  sendStateUpdate
} from "./server/mainFunctions.js";

const app = express();

app.use(express.static('./public'));

// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/public/default.html');
// });

const http = createServer(app);
const port = 8080;

export const io = new Server(http);

/****************************************************************************
 *
 * Sockets
 *
 ****************************************************************************/


io.on('connection', function(socket) {
  console.log('\n');
  console.log('new connection ' + socket.id);

  socket.on('disconnect', function() {
    const gamePlayer = SOCKETS_MAP.get(socket.id);
    if (gamePlayer) {
      console.log('Player in gameRoom ' + gamePlayer.gameRoomId + ' and id ' + gamePlayer.playerId + ' is leaving game');
      removePlayerFromGame(gamePlayer.gameRoomId, gamePlayer.playerId);
      SOCKETS_MAP.delete(socket.id);
      sendStateUpdate(gamePlayer.gameRoomId);
    }
  })
  /**
   * Create Game.
   * name: Имя первого игрока (создателя)
   * numPlayers: количество всего игроков (2,3,4,6,8,9,10,12).
   * team: цвет команды ('GREEN', 'RED', 'BLUE'). В ней будет создатель комнаты.
   * Возвращаю сгенериованый номер комнаты (RoomId).
   * Так же на фронте надо подписать на прослушивание уведомлений с этой комнаты всех, кто входит в неё.
   * В дальнейшем я буду отправлять Game state по событию с названием = RoomId.
   */
  socket.on('createGame', function(msg) {
    const gameRoomId = initializeNewGame(msg.name, msg.numPlayers, socket.id, msg.team);
    io.to(socket.id).emit('createGameSuccess', gameRoomId);
    sendStateUpdate(gameRoomId)
  });

  /**
   * Присоединиться к созданной комнате.
   * name: Имя игрока.
   * room: id комнаты, который я вернул при создании комнаты.
   * team: Цвет команды нового игрока.
  */
  socket.on('joinGame', function(msg) {
    try {
      const playerId = addPlayerGameLobby(msg.name, msg.room, msg.team);
      addPlayerSocketIdToGameLobby(socket.id, msg.room, playerId);
      io.to(socket.id).emit(msg.room, { joinGameSuccess: true, playerId: playerId });
      sendStateUpdate(msg.room);
    } catch (err) {
      io.to(socket.id).emit('joinGameFailure', err);
    }
  });
  /**
   * Ход игрока.
   * 1 - move {string}
       * Возможны 2 действия
       * "PLACE TOKEN" - положить фишку на карту.
       * "REMOVE TOKEN" - убрать фишку с карты.
   * 2 - gameRoom {string}: тот же сгенерированый id комнаты.
   * 3 - playerId {number}: id игрока. У создателя всегда id = 0.
       * Можно сразу сохранять на фронте пи получении createGameSuccess.
       * id остальных игроков отправляю при присоединении к комнате.
   * 4 - card {string}: название карты на поле по типа
       * 1p2(где 1-номер карты (1 или 2), p- масть (p-пика, ch-чирва, h-крести, b-буба), 2- номинал карты)
  */
  socket.on('move', function(msg) {
    applyMove(msg.move, msg.gameRoom, msg.playerId, msg.card);
  });
})

http.listen(port, function() {
  console.log('listening on *:' + port);
  console.log('cards is ' + CARDS_IN_DECK.length);
  let cardsCount = 0;
  for (let arr of CARDS_BOARD_ARRAY) {
    cardsCount += arr.length;
  }
  console.log(cardsCount);
});

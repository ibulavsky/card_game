import {
  BOARD_WIDTH,
  CARD_POSITIONS,
  CARDS_BOARD_ARRAY,
  CARDS_IN_DECK,
  GAME_LOBBIES,
  INVALID_ROOM_CODE_ERROR,
  MAX_PLAYERS_ERROR,
  MoveType,
  PLAYER_WITH_SAME_NAME_ERROR,
  SEQUENCE_LENGTH,
  SequenceType, SOCKETS_MAP,
  WRONG_NUMBER_PLAYERS_ERROR
} from "./constant.js";
import {io} from "../app.js";

/**
 * Перемашивание колоды.
 */
export function shuffle(array) {
  return array
    .map(value => ({value, sort: Math.random()}))
    .sort((a, b) => a.sort - b.sort)
    .map(({value}) => value)
}

/**
 * Генерация рандомного номера комнаты.
 */
function generateRoomCode() {
  const codeLength = 4;
  const possibleChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let currentCode = '';
  for (let i = codeLength; i > 0; i--) {
    currentCode += possibleChar[Math.floor(Math.random() * possibleChar.length)];
  }
  if (GAME_LOBBIES.get(currentCode)) {

    return generateRoomCode();
  }
  return currentCode;
}

/**
 * Получить количество карт в зависимости от количества игроков.
 */
function getNumberOfCardsForPlayers(numPlayers) {
  const cardCountMap = {
    2 : 7,
    3 : 6,
    4 : 6,
    6 : 5,
    8 : 4,
    9 : 4,
    10 : 3,
    12 : 3,
  };
  if (numPlayers in cardCountMap) {
    return cardCountMap[numPlayers]
  } else {
    throw WRONG_NUMBER_PLAYERS_ERROR.replace("%s", numPlayers);
  }
}

/**
 * Возвращает кол-во последовательностей для выигрыша
 */
function getNumberOfSequencesForWin(numTeams) {
  if (numTeams === 2) {
    return 2;
  } else if (numTeams === 3) {
    return 1;
  }
}

/**
 * Возвращает кол-во команд.
 */
function getNumberOfTeamsForPlayers(numPlayers) {
  if (numPlayers % 2 === 0) {
    return 2;
  } else if (numPlayers % 3 === 0) {
    return 3;
  }
  throw "%s Players not supported.".replace("%s", numPlayers);
}

/**
 * Возвращает количество вхождений элемента в массив
 */
function numElementInArr(element, arr) {
  return arr.reduce(function (count, value){
    return count + (value === element)
  }, 0)
}


/**
 * Инициализация игрового поля
 */
function initializeCardBoard() {
  let cardBoard = [];
  for (let i = 0; i < BOARD_WIDTH; i++) {
    let row = [];
    for (let j = 0; j < BOARD_WIDTH; j++) {
      row.push({
        card: CARDS_BOARD_ARRAY[j][i],
        token: null,
        partOfSequence: false,
      });
    }
    cardBoard.push(row);
  }
  return cardBoard;
}

/**
 * Инициализация состояния игры
 */
function initializeGameState(gameRoomId, numPlayers) {
  const numTeams = getNumberOfTeamsForPlayers(numPlayers);
  const numSequencesForWin = getNumberOfSequencesForWin(numTeams);
  const GameState = {
    cardDeck: shuffle(CARDS_IN_DECK.slice()),
    deadCards: [],
    discardCards: [],
    currentPlayer: 0,
    gameId: gameRoomId,
    board: initializeCardBoard(),
    numCardsPerPerson: getNumberOfCardsForPlayers(numPlayers),
    numPlayers: numPlayers,
    numTeams: numTeams,
    numSequences: 0,
    numSequencesForWin: numSequencesForWin,
    players: new Map(),
    teams: new Map(),
  }
  return GameState;
}

/**
 * Мёртвая карта (некуда положить)
*/
function isDeadCard(gameRoom, card) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  for (const deadCard of GameState.deadCards) {
    if (deadCard === card) {
      return true;
    }
  }
  return false;
}

/**
 * Взять карту из колоды
*/
function getCard(gameRoom) {
  const card = GAME_LOBBIES.get(gameRoom).cardDeck.pop();
  if (isDeadCard(gameRoom, card)) {
    return getCard(gameRoom);
  }
  return card;
}

/**
 * Добавить нового игрока в комнату
 * @param {string} gameRoom
 * @param {number} id
 * @param {string} name
 * @param {string} team (BLUE, RED, GREEN)
 */
function createPlayer(gameRoom, id, name, team) {
  if (!GAME_LOBBIES.get(gameRoom).teams.get(team)) {
    GAME_LOBBIES.get(gameRoom).teams.set(team, {
      sequences: [],
      players: [id],
    });
  } else {
    GAME_LOBBIES.get(gameRoom).teams.get(team).players.push(id);
  }

  const numCardsPerPerson = getNumberOfCardsForPlayers(GAME_LOBBIES.get(gameRoom).numPlayers);
  const player = {
    id: id,
    name: name,
    team: team,
    cardsInHand: []
  };
  for (let i = 0; i < numCardsPerPerson; i++) {
    player.cardsInHand.push(getCard(gameRoom));
  }
  GAME_LOBBIES.get(gameRoom).players.set(id, player);
  return player;
}

/**
 * Инициализация новой игры с одним игроком. Первый игрок инициализирует игру
 * @param {string} playerName Имя игрока
 * @param {string} numPlayers Кол-во игроков
 * @param {string} socketId id сокета
 * @param {string} team цвет своей команды (BLUE, RED, GREEN)
*/
export function initializeNewGame(playerName, numPlayers, socketId, team) {
  const gameRoomId = generateRoomCode();
  const gameState = initializeGameState(gameRoomId, numPlayers);
  GAME_LOBBIES.set(gameRoomId, gameState);
  const player = createPlayer(gameRoomId, 0, playerName, team);
  // добавление первой команды
  GAME_LOBBIES.get(gameRoomId).teams.set(team, {
    sequences: [],
    players: [player.id]
  });
  // добавление id сокета и игрока в лоби
  addPlayerSocketIdToGameLobby(socketId, gameRoomId, player.id);
  GAME_LOBBIES.get(gameRoomId).playerNames = [];
  GAME_LOBBIES.get(gameRoomId).playerNames.push(playerName);
  return gameRoomId;
}

/**
 * Проверка ли собрана(ы) линия(и) в этом ходу.
 * Возвращает массив линии(й)
 * {
 *  type: SequenceType
 *  positions: [
 *    { x: 0, y, 0},
 *    { x: 1, y, 0},
 *    { x: 2, y, 0},
 *    { x: 3, y, 0},
 *    { x: 4, y, 0},
 *  ]
 * }
 */
function getSequenceWithToken(gameRoom, color, tokenX, tokenY) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const x1 = tokenX - 9;
  const x2 = tokenX + 9;
  const y1 = tokenY - 9;
  const y2 = tokenY + 9;
  const sequences = [];
  let sequenceSoFar = [];
  // проверка диагонали левый верх -> правый низ
  for (let i = x1, j = y1; i <= x2, j <= y2; i++, j++) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    const card = GameState.board[i][j];
    const cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({
          type: SequenceType.TOP_LEFT_RIGHT_DOWN,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  // Проверка диогонали левый низ -> правый верх
  sequenceSoFar = [];
  for (let i = x1, j = y2; i <= x2, j >= y1; i++, j--) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    const card = GameState.board[i][j];
    const cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({
          type: SequenceType.BOTTOM_LEFT_RIGHT_TOP,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  // Проверка горизонтальной линии
  sequenceSoFar = [];
  for (let i = x1, j = tokenY; i <= x2; i++) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    const card = GameState.board[i][j];
    const cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({
          type: SequenceType.HORIZONTAL,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  // Проверка вертикальной линии
  sequenceSoFar = [];
  for (let i = tokenX, j = y1; j <= y2; j++) {
    if (i > 9 || i < 0 || j < 0 || j > 9) {
      continue;
    }
    const card = GameState.board[i][j];
    const cardColor = card.token;
    if (cardColor === color || card.card === 'W') {
      sequenceSoFar.push({ x: i, y: j, card: card.card });
      if (sequenceSoFar.length === SEQUENCE_LENGTH) {
        sequences.push({
          type: SequenceType.VERTICAL,
          positions: sequenceSoFar
        });
        sequenceSoFar = [];
      }
    } else {
      sequenceSoFar = [];
    }
  }
  return sequences;
}

/**
 * Проверка ли одинаковые последовательности.
 * @param {*} sequence1
 * @param {*} sequence2
 */
function isSequenceEqual(sequence1, sequence2) {
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    const position1 = sequence1[i];
    const position2 = sequence2[i];
    if (position1.x !== position2.x || position1.y !== position2.y) {
      return false;
    }
  }
  return true;
}

/**
 * Проверка нет ли перекрытий между двумя последовательностями.
 * @param {*} sequence1
 * @param {*} sequence2
 */
function checkOverlap(sequence1, sequence2) {
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    for (let j = 0; j < SEQUENCE_LENGTH; j++) {
      const cell1 = sequence1.positions[i];
      const cell2 = sequence2.positions[j];
      if (cell1.x === cell2.x && cell1.y === cell2.y) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Добавить последовательность к последовательностям команды
 * @param {string} gameRoom
 * @param {string} team
 * @param {*} sequence
 */
function addSequenceToTeam(gameRoom, team, sequence) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const teamSequences = GameState.teams.get(team).sequences;
  for (let teamSequence of teamSequences) {
    if (!isSequenceEqual(teamSequence.positions, sequence.positions)) {
      // проверка перекрытий последовательностей
      if (teamSequence.type === sequence.type) {
        if (checkOverlap(teamSequence, sequence)) {
          continue;
        }
      }
      GameState.numSequences++;
      teamSequences.push(sequence);
      for (let pos of sequence.positions) {
        GameState.board[pos.x][pos.y].partOfSequence = true;
      }
    }
  }
  // если у команды нет последовательностей, то просто добавляем
  if (teamSequences.length === 0) {
    teamSequences.push(sequence);
    for (let pos of sequence.positions) {
      GameState.board[pos.x][pos.y].partOfSequence = true;
    }
    GameState.numSequences++;
  }
}

/**
 * Определение ли есть требуемая карта на руке
 * Если нет карт кроме двухглазого валета, то вернёт её
 * Иначе вернёт -1
 * @param {string} gameRoom
 * @param {number} playerId
 * @param {string} cardId
 */
function getPositionOfCardInHand(gameRoom, playerId, cardId) {
  const tokenCard = cardId.substring(1);
  const cardsInHand = GAME_LOBBIES.get(gameRoom).players.get(playerId).cardsInHand;
  let wildCard = -1;
  for (let i = 0; i < cardsInHand.length; i++) {
    const card = cardsInHand[i];
    if (card === tokenCard) {
      return i;
    } else if (card === 'hj' || card === 'bj') {
      wildCard = i;
    }
  }
  return wildCard;
}

/**
 * Проверка ли есть у игроков на руках мёртвые карты, если да, то заменить
 * @param {string} gameRoom
 * @param {string} card
 */
function checkDeadCards(gameRoom, card) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const cardClass = card.substring(1);
  const cardPosition1 = CARD_POSITIONS['1' + cardClass];
  const cardPosition2 = CARD_POSITIONS['2' + cardClass];
  if (GameState.board[cardPosition1.x][cardPosition1.y].token != null && GameState.board[cardPosition2.x][cardPosition2.y].token != null) {
    GameState.deadCards.push(cardClass);
    GameState.players.forEach((player, key, map)=> {
      for (let i = 0; i < player.cardsInHand.length; i++) {
        const card = player.cardsInHand[i];
        if (card === cardClass) {
          player.cardsInHand[i] = getCard(gameRoom);
        }
      }
    })
  }
}

/**
 * Поместить фишку на доску и проверить ли собрана последовательность.
 * Добавить последовательность команде.
 * @param {string} gameRoom
 * @param {number} playerId
 * @param {string} card
 */
function placeTokenOnCard(gameRoom, playerId, card) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const positionCard = getPositionOfCardInHand(gameRoom, playerId, card);
  if (positionCard === -1) {
    throw "Player does not have the card in their hand";
  }
  // ставим фишку команды
  const position = CARD_POSITIONS[card];
  const colorToken = GameState.players.get(playerId).team;
  GameState.board[position.x][position.y].token = colorToken;

  // удаление карты из руки
  GameState.players.get(playerId).cardsInHand[positionCard] = getCard(gameRoom);

  // Проверка на мёртвые карты
  checkDeadCards(gameRoom, card);

  // проверка на последовательность
  const sequences = getSequenceWithToken(gameRoom, colorToken, position.x, position.y);
  if (sequences.length > 0) {
    for (let sequence of sequences) {
      addSequenceToTeam(gameRoom, colorToken, sequence);
    }
  }
}

/**
 * Обновить ход следующего игрока
 * @param {string} gameRoom
 */
function updateNextPlayer(gameRoom) {
  const game = GAME_LOBBIES.get(gameRoom);
  const currentPlayer = game.currentPlayer;
  const length = game.players.size;
  const nextPlayer = currentPlayer >= length - 1 ? 0 : currentPlayer + 1;
  GAME_LOBBIES.get(gameRoom).currentPlayer = nextPlayer;
}

/**
 * Проверка ли занята карта другой командой
 * @param {string} gameRoom
 * @param {number} playerId
 * @param {string} cardId
 */
function checkIfCardOccupied(gameRoom, playerId, cardId) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const cardPosition = CARD_POSITIONS[cardId];
  const token = GameState.board[cardPosition.x][cardPosition.y].token;
  const team = GameState.players.get(playerId).team;
  const isOccupied = token !== null && token !== team;
  return isOccupied;
}

/**
 * Получить первую карту одноглазого валета на руке у игрока
 * Если нет вернёт -1
 * @param {string} gameRoom
 * @param {number} playerId
 */
function getOneEyedJack(gameRoom, playerId) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const cards = GameState.players.get(playerId).cardsInHand;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (card === 'chj' || card ==='pj') {
      return i;
    }
  }
  return -1;
}

/**
 * Удаление фишки с поля
 * @param {string} gameRoom
 * @param {number} playerId
 * @param {string} card
 */
function removeToken(gameRoom, playerId, card) {
  const GameState = GAME_LOBBIES.get(gameRoom);
  const positionOneEyeJack = getOneEyedJack(gameRoom, playerId);
  const isOccupied = checkIfCardOccupied(gameRoom, playerId, card);
  if (!isOccupied) {
    throw 'For gameRoom ' + gameRoom + ', playerId: ' + playerId + ', card ' + card + ' is not occupied or is occupied by the same team';
  }
  if (positionOneEyeJack === -1) {
    throw 'Player ' + playerId + ' in game room ' + gameRoom + ' does not have a one eyed jack';
  }
  const position = CARD_POSITIONS[card];
  const isPartOfSequence = GameState.board[position.x][position.y].partOfSequence;
  if (isPartOfSequence) {
    throw 'Token is part of sequence';
  }
  GameState.board[position.x][position.y].token = null;

  // Если есть мертвая карта, то вернуть в колоду
  for (let i = 0; i < GameState.deadCards.length; i++) {
    if (GameState.deadCards[i] === card.substring(1)) {
      GameState.deadCards.splice(i, 1);
      GameState.cardDeck.push(card.substring(1))
      // перемешать колоду
      GameState.cardDeck = shuffle(GameState.cardDeck);
    }
  }
  // удалить карту одноглазого валета с руки
  GameState.players.get(playerId).cardsInHand[positionOneEyeJack] = getCard(gameRoom);
}

/**
 * Сделать хоть и отправить сокету инфу
 * @param {string} move moveType ("PLACE TOKEN", "REMOVE TOKEN", "SHOW CARDS ON BOARD")
 * @param {string} gameRoom
 * @param {number} playerId
 * @param {string} card
 */
export function applyMove(move, gameRoom, playerId, card) {
  if (move === MoveType.PLACE_TOKEN) {
    try {
      placeTokenOnCard(gameRoom, playerId, card);
      updateNextPlayer(gameRoom);
      sendStateUpdate(gameRoom);

    } catch (err) {
      console.log('',err);
    }
  } else if (move === MoveType.REMOVE_TOKEN) {
    try {
      removeToken(gameRoom, playerId, card);
      updateNextPlayer(gameRoom);
      sendStateUpdate(gameRoom);
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * Создание нового игрокаи добавление в комнату
 * @param {string} name
 * @param {string} gameRoomId
 * @param {string} team
 */
export function addPlayerGameLobby(name, gameRoomId, team) {
  const gameRoom = GAME_LOBBIES.get(gameRoomId);
  if (!gameRoom) {
    throw INVALID_ROOM_CODE_ERROR;
  }
  const playerIds = Array.from(gameRoom.players.keys());
  const lastPlayer = gameRoom.players.get(playerIds[playerIds.length - 1]);
  const playerId = lastPlayer.id + 1;
  const numSameName = numElementInArr(name, gameRoom.playerNames);
  if (numSameName > 0) {
    throw PLAYER_WITH_SAME_NAME_ERROR.replace("%s", name);
  }
  const player = createPlayer(gameRoomId, playerId, name, team);
  if (playerIds.length >= gameRoom.numPlayers) {
    throw MAX_PLAYERS_ERROR;
  }
  GAME_LOBBIES.get(gameRoomId).players.set(playerId, player);
  GAME_LOBBIES.get(gameRoomId).playerNames.push(name);
  sendStateUpdate(gameRoomId);
  return playerId;
}

/**
 * Удаление пользователя
 * @param {string} gameRoomId
 * @param {number} playerId
 */
export function removePlayerFromGame(gameRoomId, playerId) {
  const gameRoom = GAME_LOBBIES.get(gameRoomId);
  if (!gameRoom || gameRoom.players.size === 0) { return; }
  const player = gameRoom.players.get(playerId);
  if (!player) { return; }
  // вернуть карты с руки в калоду
  gameRoom.cardDeck = gameRoom.cardDeck.concat(player.cardsInHand);
  // удаление игрока из команды
  for (let i = 0; i < gameRoom.teams.get(player.team).players.length; i++) {
    const teamPlayer = gameRoom.teams.get(player.team).players[i]
    if (teamPlayer === playerId) {
      gameRoom.teams.get(player.team).players.splice(i, 1);
    }
  }
  // удаление игрока из игры
  gameRoom.players.delete(playerId);
  const playerNames = gameRoom.playerNames;
  playerNames.splice(playerNames.indexOf(player.name), 1);

  // удаление команды, если не осталось игроков
  if (gameRoom.teams.get(player.team).players.length === 0) {
    gameRoom.teams.delete(player.team);
  }

  // передача хода
  if (gameRoom.currentPlayer === playerId) {
    updateNextPlayer(gameRoomId);
  }

  // удаление комнаты, если нет игроков
  if (gameRoom.players.size === 0) {
    GAME_LOBBIES.delete(gameRoomId);
  }
}

export function addPlayerSocketIdToGameLobby(socketId, gameRoomId, playerId) {
  SOCKETS_MAP.set(socketId, { playerId: playerId, gameRoomId: gameRoomId });
}

export function sendStateUpdate(gameRoomId) {
  const gameRoom = GAME_LOBBIES.get(gameRoomId);
  if (gameRoom) {
    const players = new Map(gameRoom.players);
    const teams = new Map(gameRoom.teams);
    gameRoom.players = JSON.stringify(Array.from(players));
    gameRoom.teams = JSON.stringify(Array.from(teams));
    io.sockets.emit(gameRoomId, { state: gameRoom });
    gameRoom.players = players;
    gameRoom.teams = teams;
  }
}


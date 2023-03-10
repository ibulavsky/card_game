/**
 * Карта всех игровых лобби - ключ - это код комнаты, а значение - само лобби
*/
export const GAME_LOBBIES = new Map();

/**
 * Карта  всех подключеных сокетов
*/
export const SOCKETS_MAP = new Map();

export const BOARD_WIDTH = 10;

export const TEAM_COLOR = {
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE"
};

export const COLORS = ["GREEN", "BLUE", "RED"]

export const SequenceType = {
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL",
  TOP_LEFT_RIGHT_DOWN: "TOP-LEFT RIGHT-DOWN",
  BOTTOM_LEFT_RIGHT_TOP: "BOTTOM-LEFT RIGHT-TOP"
}

export const SEQUENCE_LENGTH = 5;

export const CARDS_IN_DECK = [
  'hj', 'bj', 'hj', 'bj', 'chj', 'pj',
  'chj', 'pj', 'b2', 'b3', 'b4', 'b5',
  'b6', 'b7', 'b8', 'b9', 'b10', 'bq',
  'bk', 'ba', 'b2', 'b3', 'b4', 'b5',
  'b6', 'b7', 'b8', 'b9', 'b10', 'bq',
  'bk', 'ba', 'p2', 'p3', 'p4', 'p5',
  'p6', 'p7', 'p8', 'p9', 'p10', 'pq',
  'pk', 'pa', 'p2', 'p3', 'p4', 'p5',
  'p6', 'p7', 'p8', 'p9', 'p10', 'pq',
  'pk', 'pa', 'h2', 'h3', 'h4', 'h5',
  'h6', 'h7', 'h8', 'h9', 'h10', 'hq',
  'hk', 'ha', 'h2', 'h3', 'h4', 'h5',  'h6', 'h7', 'h8', 'h9', 'h10', 'hq',
  'hk', 'ha', 'ch2', 'ch3', 'ch4', 'ch5',
  'ch6', 'ch7', 'ch8', 'ch9', 'ch10', 'chq',
  'chk', 'cha', 'ch2', 'ch3', 'ch4', 'ch5',
  'ch6', 'ch7', 'ch8', 'ch9', 'ch10', 'chq',
  'chk', 'cha'];

export const CARDS_BOARD_ARRAY = [
  ['W', '1p2', '1p3', '1p4', '1p5', '1p6', '1p7', '1p8', '1p9', 'W'],
  ['1h6', '1h5', '1h4', '1h3', '1h2', '1cha', '1chk', '1chq', '1ch10', '1p10'],
  ['1h7', '1pa', '1b2', '1b3', '1b4', '1b5', '1b6', '1b7', '1ch9', '1pq'],
  ['1h8', '1pk', '2h6', '2h5', '2h4', '2h3', '2h2', '1b8', '1ch8', '2pk'],
  ['1h9', '2pq', '2h7', '1ch6', '1ch5', '1ch4', '2cha', '1b9', '1ch7', '2pa'],
  ['1h10', '2p10', '2h8', '2ch7', '1ch2', '1ch3', '2chk', '1b10', '2ch6', '2b2'],
  ['1hq', '2p9', '2h9', '2ch8', '2ch9', '2ch10', '2chq', '1bq', '2ch5', '2b3'],
  ['1hk', '2p8', '2h10', '2hq', '2hk', '1ha', '1ba', '1bk', '2ch4', '2b4'],
  ['2ha', '2p7', '2p6', '2p5', '2p4', '2p3', '2p2', '2ch2', '2ch3', '2b5'],
  ['W', '2ba', '2bk', '2bq', '2b10', '2b9', '2b8', '2b7', '2b6', 'W']];

export const MoveType = {
  PLACE_TOKEN: "PLACE TOKEN",
  REMOVE_TOKEN: "REMOVE TOKEN",
}

/**
 * Карта карт и их позиции на игровой доске
*/
export const CARD_POSITIONS = {
  '1p2': {x: 1, y: 0},
  '1p3': {x: 2, y: 0},
  '1p4': {x: 3, y: 0},
  '1p5': {x: 4, y: 0},
  '1p6': {x: 5, y: 0},
  '1p7': {x: 6, y: 0},
  '1p8': {x: 7, y: 0},
  '1p9': {x: 8, y: 0},

  '1h6': {x: 0, y: 1},
  '1h5': {x: 1, y: 1},
  '1h4': {x: 2, y: 1},
  '1h3': {x: 3, y: 1},
  '1h2': {x: 4, y: 1},
  '1cha': {x: 5, y: 1},
  '1chk': {x: 6, y: 1},
  '1chq': {x: 7, y: 1},
  '1ch10': {x: 8, y: 1},
  '1p10': {x: 9, y: 1},

  '1h7': {x: 0, y: 2},
  '1pa': {x: 1, y: 2},
  '1b2': {x: 2, y: 2},
  '1b3': {x: 3, y: 2},
  '1b4': {x: 4, y: 2},
  '1b5': {x: 5, y: 2},
  '1b6': {x: 6, y: 2},
  '1b7': {x: 7, y: 2},
  '1ch9': {x: 8, y: 2},
  '1pq': {x: 9, y: 2},

  '1h8': {x: 0, y: 3},
  '1pk': {x: 1, y: 3},
  '2h6': {x: 2, y: 3},
  '2h5': {x: 3, y: 3},
  '2h4': {x: 4, y: 3},
  '2h3': {x: 5, y: 3},
  '2h2': {x: 6, y: 3},
  '1b8': {x: 7, y: 3},
  '1ch8': {x: 8, y: 3},
  '2pk': {x: 9, y: 3},

  '1h9': {x: 0, y: 4},
  '2pq': {x: 1, y: 4},
  '2h7': {x: 2, y: 4},
  '1ch6': {x: 3, y: 4},
  '1ch5': {x: 4, y: 4},
  '1ch4': {x: 5, y: 4},
  '2cha': {x: 6, y: 4},
  '1b9': {x: 7, y: 4},
  '1ch7': {x: 8, y: 4},
  '2pa': {x: 9, y: 4},

  '1h10': {x: 0, y: 5},
  '2p10': {x: 1, y: 5},
  '2h8': {x: 2, y: 5},
  '2ch7': {x: 3, y: 5},
  '1ch2': {x: 4, y: 5},
  '1ch3': {x: 5, y: 5},
  '2chk': {x: 6, y: 5},
  '1b10': {x: 7, y: 5},
  '2ch6': {x: 8, y: 5},
  '2b2': {x: 9, y: 5},

  '1hq': {x: 0, y: 6},
  '2p9': {x: 1, y: 6},
  '2h9': {x: 2, y: 6},
  '2ch8': {x: 3, y: 6},
  '2ch9': {x: 4, y: 6},
  '2ch10': {x: 5, y: 6},
  '2chq': {x: 6, y: 6},
  '1bq': {x: 7, y: 6},
  '2ch5': {x: 8, y: 6},
  '2b3': {x: 9, y: 6},

  '1hk': {x: 0, y: 7},
  '2p8': {x: 1, y: 7},
  '2h10': {x: 2, y: 7},
  '2hq': {x: 3, y: 7},
  '2hk': {x: 4, y: 7},
  '1ha': {x: 5, y: 7},
  '1ba': {x: 6, y: 7},
  '1bk': {x: 7, y: 7},
  '2ch4': {x: 8, y: 7},
  '2b4': {x: 9, y: 7},

  '2ha': {x: 0, y: 8},
  '2p7': {x: 1, y: 8},
  '2p6': {x: 2, y: 8},
  '2p5': {x: 3, y: 8},
  '2p4': {x: 4, y: 8},
  '2p3': {x: 5, y: 8},
  '2p2': {x: 6, y: 8},
  '2ch2': {x: 7, y: 8},
  '2ch3': {x: 8, y: 8},
  '2b5': {x: 9, y: 8},

  '2ba': {x: 1, y: 9},
  '2bk': {x: 2, y: 9},
  '2bq': {x: 3, y: 9},
  '2b10': {x: 4, y: 9},
  '2b9': {x: 5, y: 9},
  '2b8': {x: 6, y: 9},
  '2b7': {x: 7, y: 9},
  '2b6': {x: 8, y: 9}
}

/**
 * Ошибки.
*/
export const WRONG_NUMBER_PLAYERS_ERROR = "%s players is not supported.";
export const INVALID_ROOM_CODE_ERROR = "Invalid room code";
export const MAX_PLAYERS_ERROR = "Invalid room code";
export const PLAYER_WITH_SAME_NAME_ERROR = "Player with name '%s' is already in game. Choose different name";

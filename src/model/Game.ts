enum HexColor {
  Black,
  Grey,
  White
}

enum PlayerColor {
  Black,
  White
}

enum PieceType {
  Pawn,
  Rook,
  Knight,
  Bishop,
  Queen,
  King
}

export class Piece {
  type: PieceType
  color: PlayerColor

  constructor(type: PieceType, color: PlayerColor) {
    this.type = type
    this.color = color
  }
}

export class Hex {
  q: number
  r: number

  constructor(q: number, r: number) {
    this.q = q
    this.r = r
  }

  get color(): HexColor {
    if ((this.q - this.r - 1) % 3 === 0) {
      return HexColor.White
    } else if ((this.q - this.r - 2) % 3 === 0) {
      return HexColor.Black
    } else {
      return HexColor.Grey
    }
  }
}

export class HexBoard {
  /**
   * The length (in hexagons) of one side of the board
   */
  static readonly BOARD_SIZE = 6

  /**
   * @returns Default starting board
   */
  static default() {
    return new HexBoard()
  }

  private hexes: Array<Array<Hex>>

  constructor() {
    const N = HexBoard.BOARD_SIZE - 1
    this.hexes = []

    for (let r = -5; r <= 5; r++) {
      // const qLen = 2 * HexBoard.BOARD_SIZE - Math.abs(r) - 1
      const qArr: Array<Hex> = [];
      for (let q = Math.max(-N, -r-N); q <= Math.min(N, -r+N); q++) {
        qArr.push(new Hex(q, r))
      }
      this.hexes.push(qArr);
    }
  }

  at(q: number, r: number): Hex {
    const N = HexBoard.BOARD_SIZE - 1
    return this.hexes[r + N][Math.min(N+r, N) + q]
  }
}

export default class ChessGame {
  turn: "black" | "white" = "white";
  board: HexBoard = HexBoard.default()
}

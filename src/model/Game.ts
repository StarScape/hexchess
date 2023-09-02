export enum HexColor {
  Black = "black",
  Grey = "grey",
  White = "white"
}

export enum PlayerColor {
  Black = "Black",
  White = "White"
}

export enum PieceType {
  Pawn = "Pawn",
  Rook = "Rook",
  Knight = "Knight",
  Bishop = "Bishop",
  Queen = "Queen",
  King = "King"
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
  piece?: Piece

  constructor(q: number, r: number, piece?: Piece) {
    this.q = q
    this.r = r
    this.piece = piece
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
  private static readonly N = HexBoard.BOARD_SIZE - 1

  /**
   * @returns Default starting board
   */
  static default() {
    return new HexBoard()
  }

  private hexes: Array<Array<Hex>>

  constructor() {
    this.hexes = []
    for (let r = -5; r <= 5; r++) {
      const qArr: Array<Hex> = [];
      for (let q = Math.max(-HexBoard.N, -r-HexBoard.N); q <= Math.min(HexBoard.N, -r+HexBoard.N); q++) {
        qArr.push(new Hex(q, r))
      }
      this.hexes.push(qArr);
    }

    this.place(-4, 5, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(-3, 4, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(-2, 3, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(-1, 2, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(0, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(1, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(2, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(3, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    this.place(4, 1, new Piece(PieceType.Pawn, PlayerColor.White))

    this.place(-3, 5, new Piece(PieceType.Rook, PlayerColor.White))
    this.place(3, 2, new Piece(PieceType.Rook, PlayerColor.White))

    this.place(-2, 5, new Piece(PieceType.Knight, PlayerColor.White))
    this.place(2, 3, new Piece(PieceType.Knight, PlayerColor.White))

    this.place(0, 3, new Piece(PieceType.Bishop, PlayerColor.White))
    this.place(0, 4, new Piece(PieceType.Bishop, PlayerColor.White))
    this.place(0, 5, new Piece(PieceType.Bishop, PlayerColor.White))

    this.place(1, 4, new Piece(PieceType.King, PlayerColor.White))
    this.place(-1, 5, new Piece(PieceType.Queen, PlayerColor.White))

    this.place(-4, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(-3, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(-2, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(-1, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(0, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(1, -2, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(2, -3, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(3, -4, new Piece(PieceType.Pawn, PlayerColor.Black))
    this.place(4, -5, new Piece(PieceType.Pawn, PlayerColor.Black))

    this.place(-3, -2, new Piece(PieceType.Rook, PlayerColor.Black))
    this.place(3, -5, new Piece(PieceType.Rook, PlayerColor.Black))

    this.place(-2, -3, new Piece(PieceType.Knight, PlayerColor.Black))
    this.place(2, -5, new Piece(PieceType.Knight, PlayerColor.Black))

    this.place(0, -3, new Piece(PieceType.Bishop, PlayerColor.Black))
    this.place(0, -4, new Piece(PieceType.Bishop, PlayerColor.Black))
    this.place(0, -5, new Piece(PieceType.Bishop, PlayerColor.Black))

    this.place(1, -5, new Piece(PieceType.King, PlayerColor.Black))
    this.place(-1, -4, new Piece(PieceType.Queen, PlayerColor.Black))

  }

  private idxs(q: number, r: number): Array<number> {
    return [r + HexBoard.N, Math.min(HexBoard.N+r, HexBoard.N) + q]
  }

  at(q: number, r: number): Hex {
    const [ri, qi] = this.idxs(q, r)
    return this.hexes[ri][qi]
  }

  place(q: number, r: number, piece: Piece) {
    const [ri, qi] = this.idxs(q, r)
    this.hexes[ri][qi].piece = piece
  }

  forEach(f: (hex: Hex) => void): void {
    for (let q = -HexBoard.N; q <= HexBoard.N; q++) {
      for (let r = Math.max(-HexBoard.N, -q-HexBoard.N); r <= Math.min(HexBoard.N, -q+HexBoard.N); r++) {
        f(this.at(q, r))
      }
    }
  }
}

export default class ChessGame {
  turn: "black" | "white" = "white";
  board: HexBoard = HexBoard.default()
}

type Axial = [q: number, r: number]

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
  hasMoved: boolean = false

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
  static default(): HexBoard {
    const board = new HexBoard()

    board.place(-4, 5, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(-3, 4, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(-2, 3, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(-1, 2, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(0, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(1, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(2, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(3, 1, new Piece(PieceType.Pawn, PlayerColor.White))
    board.place(4, 1, new Piece(PieceType.Pawn, PlayerColor.White))

    board.place(-3, 5, new Piece(PieceType.Rook, PlayerColor.White))
    board.place(3, 2, new Piece(PieceType.Rook, PlayerColor.White))

    board.place(-2, 5, new Piece(PieceType.Knight, PlayerColor.White))
    board.place(2, 3, new Piece(PieceType.Knight, PlayerColor.White))

    board.place(0, 3, new Piece(PieceType.Bishop, PlayerColor.White))
    board.place(0, 4, new Piece(PieceType.Bishop, PlayerColor.White))
    board.place(0, 5, new Piece(PieceType.Bishop, PlayerColor.White))

    board.place(1, 4, new Piece(PieceType.King, PlayerColor.White))
    board.place(-1, 5, new Piece(PieceType.Queen, PlayerColor.White))

    board.place(-4, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(-3, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(-2, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(-1, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(0, -1, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(1, -2, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(2, -3, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(3, -4, new Piece(PieceType.Pawn, PlayerColor.Black))
    board.place(4, -5, new Piece(PieceType.Pawn, PlayerColor.Black))

    board.place(-3, -2, new Piece(PieceType.Rook, PlayerColor.Black))
    board.place(3, -5, new Piece(PieceType.Rook, PlayerColor.Black))

    board.place(-2, -3, new Piece(PieceType.Knight, PlayerColor.Black))
    board.place(2, -5, new Piece(PieceType.Knight, PlayerColor.Black))

    board.place(0, -3, new Piece(PieceType.Bishop, PlayerColor.Black))
    board.place(0, -4, new Piece(PieceType.Bishop, PlayerColor.Black))
    board.place(0, -5, new Piece(PieceType.Bishop, PlayerColor.Black))

    board.place(1, -5, new Piece(PieceType.King, PlayerColor.Black))
    board.place(-1, -4, new Piece(PieceType.Queen, PlayerColor.Black))

    return board
  }

  static isValidHex(q: number, r: number): boolean {
    const N = HexBoard.N
    if (r >= 0 && r <= N) {
      return q >= -N && q <= N-r
    } else if (r >= -N) {
      return q <= N && q >= -(N+r)
    } else {
      return false
    }
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
  }

  private idxs(q: number, r: number): [ri: number, qi: number] {
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

  getLine([q, r]: Axial, [dirQ, dirR]: Axial, limit: number = Number.POSITIVE_INFINITY): Array<Axial> {
    const hexes: Array<Axial> = []
    let currQ = q
    let currR = r
    while (hexes.length < limit) {
      const hexInLine: Axial = [currQ + dirQ, currR + dirR]
      // don't add if there is piece of same color at hex in line
      if (this.at(...hexInLine).piece?.color === this.at(q, r).piece?.color) {
        break;
      }
      hexes.push(hexInLine)
      if (this.at(...hexInLine).piece) {
        break;
      }
      currQ = hexInLine[0]
      currR = hexInLine[1]
    }
    return hexes
  }

  getValidMoves(q: number, r: number, piece: Piece): Array<Axial> {
    const moves: Array<[number, number]> = []
    const addMoves = (...ms: Array<Axial>) => {
      for (const [toQ, toR] of ms) {
        if (HexBoard.isValidHex(toQ, toR  ) && this.at(toQ, toR).piece?.color !== piece.color) {
          moves.push([toQ, toR])
        }
      }
    }

    // But wHy No PoLyMoRpHiSm? It's chess. It doesn't *need* to be extensible.
    // It's never going to change.
    switch (piece.type) {
      case PieceType.Pawn:
        const colorDir = piece.color === PlayerColor.White ? -1 : 1
        // todo: prevent jumping
        const pawnMoves = this.getLine([q, r], [0, colorDir], piece.hasMoved ? 1 : 2)
        addMoves(...pawnMoves)
        // todo: diagonal taking
        break
      default:
        break
    }
    return moves
  }

  movePiece(q1: number, r1: number, q2: number, r2: number) {
    const [r1i, q1i] = this.idxs(q1, r1)
    const [r2i, q2i] = this.idxs(q2, r2)
    const pieceToMove = this.hexes[r1i][q1i].piece!
    this.hexes[r2i][q2i].piece = pieceToMove
    this.hexes[r1i][q1i].piece = undefined
    pieceToMove.hasMoved = true
  }
}

export default class ChessGame {
  turn: PlayerColor = PlayerColor.White;
  board: HexBoard = HexBoard.default()

  /**
   * Moves piece on board and switches turn
   */
  movePiece(q1: number, r1: number, q2: number, r2: number) {
    this.board.movePiece(q1, r1, q2, r2)
    this.turn = this.turn === PlayerColor.White ? PlayerColor.Black : PlayerColor.White
  }
}

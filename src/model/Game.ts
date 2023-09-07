import { p } from '../utils'

// See https://www.redblobgames.com/grids/hexagons/#coordinates-axial for explanation of axial coordinates
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

function oppositeColor(c: PlayerColor): PlayerColor {
  return c === PlayerColor.Black ? PlayerColor.White : PlayerColor.Black
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
  coords: Axial
  piece?: Piece

  constructor(coords: Axial, piece?: Piece) {
    this.coords = coords
    this.piece = piece
  }

  get q(): number { return this.coords[0] }
  get r(): number { return this.coords[1] }

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
  private static readonly neighborDirections: Axial[] = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]]
  private static readonly diagonalDirections: Axial[] = [[-1, -1], [1, -2], [2, -1], [1, 1], [-1, 2], [-2, 1]]

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

  /**
   * @returns Board with one white piece of chosen type in the middle hex. For testing purposes.
   */
  static singlePieceBoard(pieceType: PieceType) {
    const board = new HexBoard()
    board.place(0, 0, new Piece(pieceType, PlayerColor.White))
    return board
  }

  static isValidHex([q, r]: Axial): boolean {
    const N = HexBoard.N
    if (r >= 0 && r <= N) {
      return q >= -N && q <= N-r
    } else if (r >= -N && r < 0) {
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
        qArr.push(new Hex([q, r]))
      }
      this.hexes.push(qArr);
    }
  }

  private idxs(q: number, r: number): [ri: number, qi: number] {
    return [r + HexBoard.N, Math.min(HexBoard.N+r, HexBoard.N) + q]
  }

  at([q, r]: Axial): Hex {
    const [ri, qi] = this.idxs(q, r)
    return this.hexes[ri][qi]
  }

  place(q: number, r: number, piece: Piece) {
    const [ri, qi] = this.idxs(q, r)
    this.hexes[ri][qi].piece = piece
  }

  /**
   * Iterates through every valid hex on the board and passes its axial coordinates to a callback.
   */
  forEach(f: (hexLocation: Axial) => void): void {
    for (let q = -HexBoard.N; q <= HexBoard.N; q++) {
      for (let r = Math.max(-HexBoard.N, -q-HexBoard.N); r <= Math.min(HexBoard.N, -q+HexBoard.N); r++) {
        f([q, r])
      }
    }
  }

  getLine(start: Axial, [dirQ, dirR]: Axial, limit: number = Number.POSITIVE_INFINITY): Array<Axial> {
    const hexes: Array<Axial> = []
    const [q, r] = start
    let currQ = q
    let currR = r
    const piece = this.at(start).piece

    while (hexes.length < limit) {
      const hex: Axial = [currQ + dirQ, currR + dirR]
      // Don't add if there is piece of same color at hex in line
      if (!HexBoard.isValidHex(hex) || this.at(hex).piece?.color === piece?.color) {
        break;
      }
      hexes.push(hex)
      if (this.at(hex).piece) {
        break
      }
      [currQ, currR] = hex
    }
    return hexes
  }

  getValidMoves(start: Axial): Array<Axial> {
    console.log(start)
    const [q, r] = start
    const piece = this.at(start).piece
    if (piece === null || piece === undefined) { return [] }

    const moves: Axial[] = []
    const addMoves = (...ms: Array<Axial>) => {
      for (const m of ms) {
        if (HexBoard.isValidHex(m) && this.at(m).piece?.color !== piece.color) {
          moves.push(m)
        }
      }
    }

    // But wHy No PoLyMoRpHiSm? It's chess. It doesn't *need* to be extensible. It's never going to change.
    switch (piece.type) {
      case PieceType.Pawn: {
        const colorDir = piece.color === PlayerColor.White ? -1 : 1
        const pawnMoves = this.getLine(start, [0, colorDir], piece.hasMoved ? 1 : 2)

        // No taking pieces from front
        addMoves(...pawnMoves.filter(m => !this.at(m).piece))

        // Front-left and front-right diagonal taking of enemy pieces
        const capturableHexes: Array<Axial> = [[q + colorDir, r], [q - colorDir, r + colorDir]]
        for (const capturable of capturableHexes) {
          if (this.at(capturable).piece?.color === oppositeColor(piece.color)) {
            addMoves(capturable)
          }
        }
        break
      }
      case PieceType.Rook: {
        addMoves(...HexBoard.neighborDirections.map(dir =>
          this.getLine(start, dir)
        ).flat())
        break
      }
      case PieceType.Bishop: {
        addMoves(...HexBoard.diagonalDirections.map(dir =>
          this.getLine(start, dir)
        ).flat())
        break
      }
      case PieceType.Knight: {
        const knightDirections = [
          [-1, -2], [1, -3],
          [2, -3], [3, -2],
          [3, -1], [2, 1],
          [-1, 3], [1, 2],
          [-2, 3], [-3, 2],
          [-3, 1], [-2, -1]
        ]
        const knightMoves: Axial[] = knightDirections.map(([dr, dq]) => [q + dq, r + dr])
        addMoves(...knightMoves)
        break
      }
      case PieceType.Queen: {
        const queenMoves: Axial[] = [
          ...HexBoard.diagonalDirections,
          ...HexBoard.neighborDirections
        ].map(dir => this.getLine(start, dir)).flat()
        addMoves(...queenMoves)
        break
      }
      case PieceType.King: {
        const kingMoves: Axial[] = [
          ...HexBoard.diagonalDirections,
          ...HexBoard.neighborDirections
        ].map(([dq, dr]) => [q + dq, r + dr])
        addMoves(...kingMoves)
        break
      }
      default: {
        console.error("Unexpected error, unrecognized piece type.")
        break
      }
    }
    return moves
  }

  movePiece([q1, r1]: Axial, [q2, r2]: Axial) {
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
  board: HexBoard

  constructor(board = HexBoard.default()) {
    this.board = board
  }

  /**
   * Moves piece on board and switches turn
   */
  movePiece(start: Axial, end: Axial) {
    this.board.movePiece(start, end)
    this.turn = oppositeColor(this.turn)
  }
}

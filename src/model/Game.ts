import { p } from '../utils'

// See https://www.redblobgames.com/grids/hexagons/#coordinates-axial for explanation of axial coordinates
export type Axial = [q: number, r: number]

export function axialEquals(a1?: Axial, a2?: Axial): boolean {
  return !a1 || !a2 ? false : a1[0] === a2[0] && a1[1] === a2[1]
}

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
  validMoves: Axial[] = []
  hex: Axial = [0, 0]

  constructor(type: PieceType, color: PlayerColor) {
    this.type = type
    this.color = color
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

  // /**
  //  * @returns Board with one white piece of chosen type in the middle hex. For testing purposes.
  //  */
  // static singlePieceBoard(pieceType: PieceType) {
  //   const board = new HexBoard()
  //   board.place(0, 0, new Piece(pieceType, PlayerColor.White))
  //   return board
  // }

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

  private hexes: Array<Array<Piece | undefined>>

  constructor() {
    this.hexes = []
    for (let r = -5; r <= 5; r++) {
      const qArr: Array<Piece | undefined> = [];
      for (let q = Math.max(-HexBoard.N, -r-HexBoard.N); q <= Math.min(HexBoard.N, -r+HexBoard.N); q++) {
        qArr.push(undefined)
      }
      this.hexes.push(qArr)
    }
  }

  private idxs([q, r]: Axial): [ri: number, qi: number] {
    return [r + HexBoard.N, Math.min(HexBoard.N+r, HexBoard.N) + q]
  }

  at(location: Axial): Piece | undefined {
    const [ri, qi] = this.idxs(location)
    return this.hexes[ri][qi]
  }

  place(location: Axial, piece: Piece) {
    const [ri, qi] = this.idxs(location)
    this.hexes[ri][qi] = piece
    piece.hex = location
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
    const piece = this.at(start)

    while (hexes.length < limit) {
      const hex: Axial = [currQ + dirQ, currR + dirR]
      // Don't add if there is piece of same color at hex in line
      if (!HexBoard.isValidHex(hex) || this.at(hex)?.color === piece?.color) {
        break // found piece of same color or past edge of board, don't add to line
      }
      hexes.push(hex)
      if (this.at(hex)) {
        break // found piece of different color, add but go no further
      }
      [currQ, currR] = hex
    }
    return hexes
  }
  getValidMoves(start: Axial): Array<Axial> {
    const [q, r] = start
    const piece = this.at(start)
    if (piece === null || piece === undefined) { return [] }

    const moves: Axial[] = []
    const addMoves = (...ms: Array<Axial>) => {
      for (const m of ms) {
        if (HexBoard.isValidHex(m) && this.at(m)?.color !== piece.color) {
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
        addMoves(...pawnMoves.filter(m => !this.at(m)))

        // Front-left and front-right diagonal taking of enemy pieces
        const capturableHexes: Array<Axial> = [[q + colorDir, r], [q - colorDir, r + colorDir]]
        for (const capturable of capturableHexes) {
          if (this.at(capturable)?.color === oppositeColor(piece.color)) {
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

  /**
   * Moves a piece on the board from first hex to second hex.
   * @return `Piece` captured if movement captures a piece
   */
  movePiece(from: Axial, to: Axial): Piece | undefined {
    const [r1i, q1i] = this.idxs(from)
    const [r2i, q2i] = this.idxs(to)
    const pieceToMove = this.hexes[r1i][q1i]
    // assert(pieceToMove)
    const pieceInNewHex = this.hexes[r2i][q2i]
    this.hexes[r2i][q2i] = pieceToMove
    this.hexes[r1i][q1i] = undefined
    pieceToMove!.hex = to

    return pieceInNewHex
  }
}

export default class ChessGame {
  board: HexBoard
  currentPlayer: PlayerColor = PlayerColor.White
  pieces: Record<PlayerColor, Set<Piece>> = {
    [PlayerColor.Black]: new Set(),
    [PlayerColor.White]: new Set()
  }

  playerInCheck: PlayerColor | undefined = undefined
  checkmate: boolean = false

  /**
   * @returns Default starting board
   */
  static defaultBoard() {
    const game = new ChessGame()

    game.place([-4, 5], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([-3, 4], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([-2, 3], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([-1, 2], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([0, 1], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([1, 1], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([2, 1], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([3, 1], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([4, 1], new Piece(PieceType.Pawn, PlayerColor.White))
    game.place([-3, 5], new Piece(PieceType.Rook, PlayerColor.White))
    game.place([3, 2], new Piece(PieceType.Rook, PlayerColor.White))
    game.place([-2, 5], new Piece(PieceType.Knight, PlayerColor.White))
    game.place([2, 3], new Piece(PieceType.Knight, PlayerColor.White))
    game.place([0, 3], new Piece(PieceType.Bishop, PlayerColor.White))
    game.place([0, 4], new Piece(PieceType.Bishop, PlayerColor.White))
    game.place([0, 5], new Piece(PieceType.Bishop, PlayerColor.White))
    game.place([1, 4], new Piece(PieceType.King, PlayerColor.White))
    game.place([-1, 5], new Piece(PieceType.Queen, PlayerColor.White))
    game.place([-4, -1], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([-3, -1], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([-2, -1], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([-1, -1], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([0, -1], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([1, -2], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([2, -3], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([3, -4], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([4, -5], new Piece(PieceType.Pawn, PlayerColor.Black))
    game.place([-3, -2], new Piece(PieceType.Rook, PlayerColor.Black))
    game.place([3, -5], new Piece(PieceType.Rook, PlayerColor.Black))
    game.place([-2, -3], new Piece(PieceType.Knight, PlayerColor.Black))
    game.place([2, -5], new Piece(PieceType.Knight, PlayerColor.Black))
    game.place([0, -3], new Piece(PieceType.Bishop, PlayerColor.Black))
    game.place([0, -4], new Piece(PieceType.Bishop, PlayerColor.Black))
    game.place([0, -5], new Piece(PieceType.Bishop, PlayerColor.Black))
    game.place([1, -5], new Piece(PieceType.King, PlayerColor.Black))
    game.place([-1, -4], new Piece(PieceType.Queen, PlayerColor.Black))

    game.populateValidMoves()
    return game
  }

  constructor(piecePlacementCallback?: (placePiece: (location: Axial, piece: Piece) => void) => void) {
    this.board = new HexBoard()
    if (piecePlacementCallback) {
      piecePlacementCallback(this.place.bind(this))
      this.populateValidMoves()
    }
  }

  private place(location: Axial, piece: Piece) {
    this.board.place(location, piece)
    this.pieces[piece.color].add(piece)
  }

  /**
   * Moves piece on board and switches turn
   */
  movePiece(start: Axial, end: Axial): Piece | undefined {
    this.board.at(start)!.hasMoved = true
    const capturedPiece = this.board.movePiece(start, end)
    if (capturedPiece) {
      this.pieces[capturedPiece.color].delete(capturedPiece)
    }

    // Switch turn
    this.currentPlayer = oppositeColor(this.currentPlayer)
    this.populateValidMoves()

    return capturedPiece
  }

  private populateValidMoves() {
    this.playerInCheck = undefined
    const playersInCheckmate = {
      [PlayerColor.White]: true,
      [PlayerColor.Black]: true,
    }
    for (const color of Object.values(PlayerColor)) {
      for (const piece of this.pieces[color]) {
        const originalHex = piece.hex
        const potentialMoves = this.board.getValidMoves(originalHex)
        piece.validMoves = potentialMoves.filter(move => !this.movePutsPlayerInCheck(originalHex, move, color))
        if (piece.validMoves.length > 0) playersInCheckmate[color] = false

        for (const move of piece.validMoves) {
          const checks = this.checkFor(move, oppositeColor(color))
          if (checks) {
            this.playerInCheck = oppositeColor(color)
            break
          }
        }
      }
    }

    if (playersInCheckmate[PlayerColor.White]) {
      this.checkmate = true
      console.log("White in CHECKMATE!")
    }
    else if (playersInCheckmate[PlayerColor.Black]) {
      this.checkmate = true
      console.log("Black in CHECKMATE!")
    }

  }

  movePutsPlayerInCheck(from: Axial, to: Axial, color: PlayerColor): boolean {
    // Move piece into potential position and see if it puts player in check
    let check = false
    const captured = this.board.movePiece(from, to)
    for (const oppositeColorPiece of this.pieces[oppositeColor(color)]) {
      if (oppositeColorPiece === captured) continue

      const oppositeColorPieceMoves = this.board.getValidMoves(oppositeColorPiece.hex)
      check = oppositeColorPieceMoves.some(hex => this.checkFor(hex, color))
      if (check) break
    }

    // move back
    this.board.movePiece(to, from)
    if (captured) {
      this.board.place(to, captured)
    }
    return check
  }

  checkFor(move: Axial, color: PlayerColor) {
    return this.board.at(move)?.color === color && this.board.at(move)?.type === PieceType.King
  }

  isValidMove(from: Axial, to: Axial): boolean {
    return this.board.at(from)?.validMoves.some(move => axialEquals(move, to)) ?? false
  }
}

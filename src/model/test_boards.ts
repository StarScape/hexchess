import ChessGame, { Piece, PieceType, PlayerColor } from "./Game";

export function easyCheckMate(): ChessGame {
  return new ChessGame(place => {
    place([0, 0], new Piece(PieceType.King, PlayerColor.Black))
    place([0, 5], new Piece(PieceType.Rook, PlayerColor.White))
  })
}

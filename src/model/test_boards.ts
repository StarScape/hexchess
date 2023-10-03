import ChessGame, { Piece, PieceType, PlayerColor } from "./Game";

export function easyCheckMate(): ChessGame {
  return new ChessGame(place => {
    place([0, -5], new Piece(PieceType.King, PlayerColor.Black))
    place([0, -4], new Piece(PieceType.Pawn, PlayerColor.White))
    // -4r, 2q
    place([2, -3], new Piece(PieceType.Bishop, PlayerColor.White))
    place([-2, -1], new Piece(PieceType.Bishop, PlayerColor.White))
    // place([0, -1], new Piece(PieceType.Pawn, PlayerColor.White))
    // place([1, -1], new Piece(PieceType.Pawn, PlayerColor.White))
    // place([-1, 1], new Piece(PieceType.Pawn, PlayerColor.White))
    // place([-1, 4], new Piece(PieceType.Rook, PlayerColor.White))
    place([-1, 4], new Piece(PieceType.Rook, PlayerColor.White))
  })
}

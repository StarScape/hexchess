import ChessGame, { Piece, PieceType, PlayerColor } from './model/Game.ts'

interface GraphicsInfo {
  hexSizePx: number
  canvasSizePx: number
  ctx: CanvasRenderingContext2D
}

type Images = Record<PlayerColor, Record<PieceType, CanvasImageSource>>
const images: Images = {
  [PlayerColor.White]: {
    [PieceType.Pawn]: document.getElementById('img-pawn-white') as HTMLImageElement,
    [PieceType.Rook]: document.getElementById('img-rook-white') as HTMLImageElement,
    [PieceType.Knight]: document.getElementById('img-knight-white') as HTMLImageElement,
    [PieceType.Bishop]: document.getElementById('img-bishop-white') as HTMLImageElement,
    [PieceType.Queen]: document.getElementById('img-queen-white') as HTMLImageElement,
    [PieceType.King]: document.getElementById('img-king-white') as HTMLImageElement,
  },
  [PlayerColor.Black]: {
    [PieceType.Pawn]: document.getElementById('img-pawn-black') as HTMLImageElement,
    [PieceType.Rook]: document.getElementById('img-rook-black') as HTMLImageElement,
    [PieceType.Knight]: document.getElementById('img-knight-black') as HTMLImageElement,
    [PieceType.Bishop]: document.getElementById('img-bishop-black') as HTMLImageElement,
    [PieceType.Queen]: document.getElementById('img-queen-black') as HTMLImageElement,
    [PieceType.King]: document.getElementById('img-king-black') as HTMLImageElement,
  }
}

function axialToPixel(q: number, r: number, hexSize: number, canvasSizePx: number) {
  const offset = canvasSizePx / 2
  const x = hexSize * (1.5 * q)
  const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
  return [x + offset, y + offset]
}

function drawHex(ctx: CanvasRenderingContext2D, px: number, py: number, r: number, color: string) {
  const a = 2 * Math.PI / 6;
  ctx.strokeStyle = 'black'
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(px + r * Math.cos(a * i), py + r * Math.sin(a * i))
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
}

function drawPiece(px: number, py: number, piece: Piece, graphics: GraphicsInfo) {
  const {ctx} = graphics
  const imgSize = graphics.hexSizePx
  ctx.fillStyle = 'red'
  ctx.drawImage(images[piece.color][piece.type], px - imgSize/2, py - imgSize/2, imgSize, imgSize)
}

function drawBoard(game: ChessGame, graphics: GraphicsInfo) {
  const {ctx, hexSizePx, canvasSizePx} = graphics
  game.board.forEach((hex) => {
    const [px, py] = axialToPixel(hex.q, hex.r, hexSizePx, canvasSizePx)
    drawHex(ctx, px, py, hexSizePx, hex.color)
    if (hex.piece) {
      drawPiece(px, py, hex.piece, graphics)
    }
  })
}

function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio
  const canvasSize = 800
  canvas.style.width = `${canvasSize}px`
  canvas.style.height = `${canvasSize}px`
  canvas.width = canvasSize * dpr
  canvas.height = canvasSize * dpr
  ctx.scale(dpr, dpr)

  const graphics: GraphicsInfo = {
    canvasSizePx: canvasSize,
    hexSizePx: 40,
    ctx: ctx,
  }
  const game = new ChessGame()
  drawBoard(game, graphics)
}

document.addEventListener('DOMContentLoaded', (_) => main())


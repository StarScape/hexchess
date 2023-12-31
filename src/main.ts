import ChessGame, { HexBoard, Hex, Piece, PieceType, PlayerColor, Axial, axialEquals, HexColor, oppositeColor } from './model/Game.ts'
import { easyCheckMate } from './model/test_boards.ts'

interface GraphicsInfo {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  hexSizePx: number
  canvasSizePx: number
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

function axialToPixel([q, r]: Axial, hexSize: number, canvasSizePx: number) {
  const offset = canvasSizePx / 2
  const x = hexSize * (1.5 * q)
  const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
  return [x + offset, y + offset]
}

function cubeRound(q: number, r: number, s: number): [q: number, r: number, s: number] {
  let qRounded = Math.round(q)
  let rRounded = Math.round(r)
  let sRounded = Math.round(s)

  const qDiff = Math.abs(qRounded - q)
  const rDiff = Math.abs(rRounded - r)
  const sDiff = Math.abs(sRounded - s)

  if (qDiff > rDiff && qDiff > sDiff) {
    qRounded = -rRounded - sRounded
  } else if (rDiff > sDiff) {
    rRounded = -qRounded - sRounded
  } else {
    sRounded = -qRounded - rRounded
  }
  return [qRounded, rRounded, sRounded]
}

function cubeToAxial(q: number, r: number, s: number): [q: number, r: number] {
  return [q, r]
}

function axialToCube(q: number, r: number): [q: number, r: number, s: number] {
  return [q, r, -q-r]
}

function axialRound(q: number, r: number): [q: number, r: number] {
  return cubeToAxial(...cubeRound(...axialToCube(q, r)))
}

function pixelToAxial(x: number, y: number, {hexSizePx, canvasSizePx}: GraphicsInfo): [q: number, r: number] {
  const offset = canvasSizePx / 2
  const px = x - offset
  const py = y - offset
  const q = ( 2.0/3 * px) / hexSizePx
  const r = (-1.0/3 * px + Math.sqrt(3)/3 * py) / hexSizePx
  return axialRound(q, r)
}

function drawHex(ctx: CanvasRenderingContext2D, px: number, py: number, r: number, color: string) {
  const a = 2 * Math.PI / 6;
  ctx.strokeStyle = 'black'
  ctx.fillStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(px + r * Math.cos(a * i), py + r * Math.sin(a * i))
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function hexColor([q, r]: Axial): HexColor {
  // assert HexBoard.isValidHex([q, r])
  if ((q - r - 1) % 3 === 0) {
    return HexColor.White
  } else if ((q - r - 2) % 3 === 0) {
    return HexColor.Black
  } else {
    return HexColor.Grey
  }
}

function drawPiece(px: number, py: number, piece: Piece, graphics: GraphicsInfo) {
  const {ctx} = graphics
  const imgSize = graphics.hexSizePx
  ctx.fillStyle = 'red'
  ctx.drawImage(images[piece.color][piece.type], px - imgSize/2, py - imgSize/2, imgSize, imgSize)
}

function drawText(graphics: GraphicsInfo, text: string) {
  graphics.ctx.font = "18px serif"
  graphics.ctx.fillText(text, 10, 25)
}

function drawBoard(game: ChessGame, ui: GameUI, graphics: GraphicsInfo) {
  const {ctx, hexSizePx, canvasSizePx} = graphics
  graphics.ctx.clearRect(0, 0, graphics.canvasSizePx, graphics.canvasSizePx)
  game.board.forEach((hex) => {
    const [px, py] = axialToPixel(hex, hexSizePx, canvasSizePx)
    const piece = game.board.at(hex)
    let color
    if (axialEquals(ui.selectedHex, hex)) {
      color = "lightblue"
    } else if (ui.selectedHex && game.isValidMove(ui.selectedHex, hex)) {
      color = "yellow"
    } else {
      color = hexColor(hex)
    }
    drawHex(ctx, px, py, hexSizePx, color)
    if (piece) {
      drawPiece(px, py, piece, graphics)
    }
  })

  if (game.checkmate) {
    drawText(graphics, `Game over, ${game.currentPlayer} in checkmate.`)
  } else if (game.playerInCheck) {
    drawText(graphics, `${game.playerInCheck} is in check`)
  }
}

function clickedLocation(clientX: number, clientY: number, graphics: GraphicsInfo): [q: number, r: number] {
  return pixelToAxial(
    clientX - graphics.canvas.offsetLeft,
    clientY - graphics.canvas.offsetTop,
    graphics
  )
}

class GameUI {
  game: ChessGame
  graphics: GraphicsInfo
  selectedHex?: Axial

  constructor(game: ChessGame, graphics: GraphicsInfo) {
    this.game = game
    this.graphics = graphics
  }

  handleClick(e: MouseEvent) {
    const clicked = clickedLocation(e.clientX, e.clientY, this.graphics)
    if (this.game.checkmate) {
      return
    }
    if (HexBoard.isValidHex(clicked)) {
      if (this.selectedHex) {
        this.handleMovePiece(clicked)
      } else {
        this.handleSelectPiece(clicked)
      }
      drawBoard(this.game, this, this.graphics)
      updateTurnImg(this.game)
    }
  }

  handleMovePiece(clicked: Axial) {
    const {game} = this
    const clickedPiece = game.board.at(clicked)
    if (clickedPiece && clickedPiece.color === game.currentPlayer) {
      this.handleSelectPiece(clicked)
    } else {
      if (this.selectedHex && game.isValidMove(this.selectedHex, clicked)) {
        const captured = game.movePiece(this.selectedHex, clicked)
        this.selectedHex = undefined
        if (captured) this.addToCapturedRow(captured)
      }
    }
  }

  handleSelectPiece(clicked: Axial) {
    const {game} = this
    const clickedPiece = game.board.at(clicked)
    if (clickedPiece && clickedPiece.color === game.currentPlayer) {
      if (axialEquals(this.selectedHex, clicked)) {
        this.selectedHex = undefined
      } else {
        this.selectedHex = clicked
      }
    } else {
      // play 'nope' sound
    }
  }

  addToCapturedRow(piece: Piece) {
    const row = document.querySelector(`#captured-by-${piece.color === PlayerColor.Black ? 'white' : 'black'}`)
    if (row) {
      const {src} = images[piece.color][piece.type] as HTMLImageElement
      row.innerHTML = row.innerHTML + `<span><img width="35px" src="${src}"></span>`
    }
  }
}

function updateTurnImg(game: ChessGame) {
  const img = images[game.currentPlayer][PieceType.Pawn] as HTMLImageElement
  (document.querySelector('#current-turn-img') as HTMLImageElement).src = img.src
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
    canvas,
    ctx,
    canvasSizePx: canvasSize,
    hexSizePx: 40,
  }
  // const game = ChessGame.defaultBoard()
  const game = easyCheckMate()
  const ui = new GameUI(game, graphics)

  drawBoard(game, ui, graphics)

  canvas.addEventListener('click', (e) => ui.handleClick(e))
}

document.addEventListener('DOMContentLoaded', (_) => main())

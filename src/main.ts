import ChessGame, { HexBoard, Hex, Piece, PieceType, PlayerColor, Axial } from './model/Game.ts'

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

function axialToPixel(q: number, r: number, hexSize: number, canvasSizePx: number) {
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

function drawPiece(px: number, py: number, piece: Piece, graphics: GraphicsInfo) {
  const {ctx} = graphics
  const imgSize = graphics.hexSizePx
  ctx.fillStyle = 'red'
  ctx.drawImage(images[piece.color][piece.type], px - imgSize/2, py - imgSize/2, imgSize, imgSize)
}

function drawBoard(game: ChessGame, ui: GameUI, graphics: GraphicsInfo) {
  const {ctx, hexSizePx, canvasSizePx} = graphics
  game.board.forEach((hex) => {
    const [px, py] = axialToPixel(hex.q, hex.r, hexSizePx, canvasSizePx)
    let color
    if (ui.selectedHex === hex) {
      color = "lightblue"
    } else if (ui.isValidMove(hex.q, hex.r)) {
      color = "yellow"
    } else {
      color = hex.color
    }
    drawHex(ctx, px, py, hexSizePx, color)
    if (hex.piece) {
      drawPiece(px, py, hex.piece, graphics)
    }
  })
}

function clickedLocation(clientX: number, clientY: number, graphics: GraphicsInfo): [q: number, r: number] {
  return pixelToAxial(
    clientX - graphics.canvas.offsetLeft,
    clientY - graphics.canvas.offsetTop,
    graphics
  )
}

class GameUI {
  selectedHex?: Hex
  validMoves: Array<[number, number]> = []

  isValidMove(q: number, r: number): boolean {
    for (let i = 0; i < this.validMoves.length; i++) {
      const [vq, vr] = this.validMoves[i];
      if (vq === q && vr === r) {
        return true
      }
    }
    return false
  }

  handleMovePiece(q: number, r: number, game: ChessGame) {
    const hex = game.board.at(q, r)
    if (hex.piece && hex.piece.color === game.turn) {
      this.handleSelectPiece(q,r, game)
    } else {
      if (this.isValidMove(q, r)) {
        game.movePiece(this.selectedHex!.q, this.selectedHex!.r, q, r)
        this.selectedHex = undefined
        this.validMoves = []
      }
    }
  }

  handleSelectPiece(q: number, r: number, game: ChessGame) {
    const hex = game.board.at(q, r)
    if (hex.piece && hex.piece.color === game.turn) {
      this.selectedHex = game.board.at(q, r)
      this.validMoves = game.board.getValidMoves(q, r, hex.piece)
    } else {
      // play 'nope' sound
    }
  }
}

function updateTurnImg(game: ChessGame) {
  const img = images[game.turn][PieceType.Pawn] as HTMLImageElement
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
  const ui = new GameUI()
  // const game = new ChessGame(HexBoard.singlePieceBoard(PieceType.Rook))
  const game = new ChessGame()
  drawBoard(game, ui, graphics)

  canvas.addEventListener('click', (e) => {
    const [q, r] = clickedLocation(e.clientX, e.clientY, graphics)
    if (HexBoard.isValidHex(q, r)) {
      if (ui.selectedHex) {
        ui.handleMovePiece(q, r, game)
      } else {
        ui.handleSelectPiece(q, r, game)
      }
      drawBoard(game, ui, graphics)
      updateTurnImg(game)
    }
  })
}

document.addEventListener('DOMContentLoaded', (_) => main())

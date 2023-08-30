const N = 5

const isGray = (q: number, r: number) => (q - r) % 3 === 0
const isWhite = (q: number, r: number) => (q - r - 1) % 3 === 0
const isBlack = (q: number, r: number) => (q - r - 2) % 3 === 0

function axialToPixel(size: number, q: number, r: number, offset = 0) {
  const x = size * (1.5 * q)
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
  return [x + offset, y + offset]
}

function forEachHex(f: (a: number, b: number) => void): void {
  for (let q = -N; q <= N; q++) {
    for (let r = Math.max(-N, -q-N); r <= Math.min(N, -q+N); r++) {
      f(q, r)
    }
  }
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const a = 2 * Math.PI / 6;

  ctx.strokeStyle = 'black'
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
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

  const size = 40
  const offset = canvasSize/2

  forEachHex((q, r) => {
    const [px, py] = axialToPixel(size, q, r, offset)
    let color
    if (isBlack(q, r)) {
      color = "black"
    } else if (isGray(q, r)) {
      color = "gray"
    } else {
      color = "white"
    }
    drawHex(ctx, px, py, size, color)
  })
}

document.addEventListener('DOMContentLoaded', (_) => main())


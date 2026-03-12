import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'

// ── Geometry ───────────────────────────────────────────────────────────────────
const VW = 1000, VH = 580
const HX = 110, HY = 55, HW = 780, HH = 470, WALL = 15
const IX = HX + WALL        // 125  inner left
const IY = HY + WALL        // 70   inner top
const IR = HX + HW - WALL   // 875  inner right
const IB = HY + HH - WALL   // 510  inner bottom

const CX1 = 385  // left/mid column split
const CX2 = 625  // mid/right column split
const RY1 = 258  // top/bottom row split

// Room definitions
const ROOMS = {
  b1: { x: IX,  y: IY,  w: CX1-IX,  h: RY1-IY,  label: 'Bedroom 1',   floor: '#f3ece1', tile: false },
  b2: { x: CX1, y: IY,  w: CX2-CX1, h: RY1-IY,  label: 'Bedroom 2',   floor: '#eee8dc', tile: false },
  ba: { x: CX2, y: IY,  w: IR-CX2,  h: RY1-IY,  label: 'Bathroom',    floor: '#d4e8f5', tile: true  },
  li: { x: IX,  y: RY1, w: CX1-IX,  h: IB-RY1,  label: 'Living Room', floor: '#ece7d3', tile: false },
  ki: { x: CX1, y: RY1, w: CX2-CX1, h: IB-RY1,  label: 'Kitchen',     floor: '#f0e6d8', tile: true  },
  es: { x: CX2, y: RY1, w: IR-CX2,  h: IB-RY1,  label: 'En Suite',    floor: '#bfdaf0', tile: true  },
}

const ROOM_LIST = Object.entries(ROOMS).map(([id, r]) => ({ id, ...r }))

const rc = (id) => {
  const r = ROOMS[id]
  return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : { x: 0, y: 0 }
}

// ── Characters ─────────────────────────────────────────────────────────────────
const CHARS = [
  {
    id: 'a', color: '#3FB8E0', head: '#f0c898', dark: '#1e6e8e',
    route: ['ba', 'es'],
    speech: ['Full rip-out. New tiles, new everything.', 'Walk-in wet room — serious impact.'],
  },
  {
    id: 'b', color: '#e8784a', head: '#f5d0a0', dark: '#a04020',
    route: ['ki', 'li'],
    speech: ['New kitchen, new worktops. Let\'s sort it.', 'Bit of plastering and it\'s immaculate.'],
  },
  {
    id: 'c', color: '#52c468', head: '#fad098', dark: '#286838',
    route: ['b1', 'b2'],
    speech: ['Built-in wardrobe. Does the room justice.', 'Skirting, cornicing — proper finish.'],
  },
]

// ── Furniture helper ───────────────────────────────────────────────────────────
const F_FILL   = 'rgba(0,0,0,0.065)'
const F_STROKE = 'rgba(0,0,0,0.18)'
const F_SW     = 1

function Rect({ x, y, w, h, rx = 2, fill = F_FILL, stroke = F_STROKE, sw = F_SW }) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={sw} />
}

function Bed({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h} rx={4} />
      <Rect x={x} y={y} w={w} h={13} rx={2} fill="rgba(0,0,0,0.10)" />
      <Rect x={x + 7} y={y + 18} w={w * 0.38} h={18} rx={9} fill="rgba(255,255,255,0.7)" />
      <Rect x={x + w * 0.57} y={y + 18} w={w * 0.36} h={18} rx={9} fill="rgba(255,255,255,0.7)" />
    </g>
  )
}

function Bath({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h} rx={6} fill="rgba(160,210,245,0.25)" />
      <Rect x={x + 8} y={y + 8} w={w - 16} h={h - 16} rx={14} fill="rgba(160,210,245,0.35)" />
      <circle cx={x + w - 16} cy={y + h - 14} r={5} fill="rgba(0,0,0,0.12)" stroke={F_STROKE} strokeWidth={0.8} />
    </g>
  )
}

function Toilet({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h * 0.42} rx={3} />
      <ellipse cx={x + w / 2} cy={y + h * 0.73} rx={w / 2} ry={h * 0.3} fill={F_FILL} stroke={F_STROKE} strokeWidth={F_SW} />
    </g>
  )
}

function Sink({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h} rx={3} />
      <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.33} ry={h * 0.33} fill="rgba(160,210,245,0.4)" stroke={F_STROKE} strokeWidth={0.8} />
    </g>
  )
}

function Shower({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h} fill="rgba(140,200,240,0.18)" rx={3} />
      <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={F_STROKE} strokeWidth={0.6} />
      <line x1={x + w} y1={y} x2={x} y2={y + h} stroke={F_STROKE} strokeWidth={0.6} />
      <circle cx={x + w * 0.72} cy={y + h * 0.28} r={5} fill="rgba(140,200,240,0.5)" stroke={F_STROKE} strokeWidth={0.8} />
    </g>
  )
}

function Sofa({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h} rx={5} fill="rgba(110,95,80,0.1)" />
      <Rect x={x} y={y} w={16} h={h} rx={4} fill="rgba(110,95,80,0.16)" />
      <Rect x={x + w - 16} y={y} w={16} h={h} rx={4} fill="rgba(110,95,80,0.16)" />
      <Rect x={x} y={y} w={w} h={14} rx={4} fill="rgba(110,95,80,0.16)" />
    </g>
  )
}

function Wardrobe({ x, y, w, h }) {
  return (
    <g>
      <Rect x={x} y={y} w={w} h={h} fill="rgba(0,0,0,0.09)" rx={2} />
      <line x1={x + w / 2} y1={y + 2} x2={x + w / 2} y2={y + h - 2} stroke={F_STROKE} strokeWidth={0.8} />
    </g>
  )
}

// ── Character component ────────────────────────────────────────────────────────
function Character({ char, pos, bubbleKey, speech }) {
  return (
    <g
      className="char-g"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      {/* Drop shadow */}
      <ellipse cx={3} cy={5} rx={16} ry={10} fill="rgba(0,0,0,0.18)" />
      {/* Body */}
      <circle cx={0} cy={0} r={16} fill={char.color} />
      {/* Head */}
      <circle cx={0} cy={-4} r={10} fill={char.head} />
      {/* Hair dot */}
      <circle cx={0} cy={-7} r={3.5} fill={char.dark} opacity={0.7} />
      {/* Outline */}
      <circle cx={0} cy={0} r={16} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />

      {/* Speech bubble — key remount restarts animation */}
      <g key={bubbleKey} className="bubble-anim" style={{ transformOrigin: '0px -30px' }}>
        <g filter="url(#bubbleShadow)">
          <rect x={-82} y={-100} width={164} height={52} rx={9}
            fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
          <polygon points="-8,-48 8,-48 0,-36" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth={0.5} />
        </g>
        <foreignObject x={-76} y={-97} width={152} height={46}>
          <div xmlns="http://www.w3.org/1999/xhtml"
            style={{ fontSize: '10.5px', fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.4, padding: '3px 0' }}>
            {speech}
          </div>
        </foreignObject>
      </g>
    </g>
  )
}

// ── Door arc helper ────────────────────────────────────────────────────────────
function DoorArc({ cx, cy, r = 44, startAngle, endAngle }) {
  const rad = (deg) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(rad(startAngle))
  const y1 = cy + r * Math.sin(rad(startAngle))
  const x2 = cx + r * Math.cos(rad(endAngle))
  const y2 = cy + r * Math.sin(rad(endAngle))
  return (
    <>
      <line x1={cx} y1={cy} x2={x1} y2={y1} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="3,2" />
    </>
  )
}

// ── Tree cluster ───────────────────────────────────────────────────────────────
function Trees({ cx, cy }) {
  const colors = ['#0e2010', '#162c12', '#1c3818', '#122610', '#183214']
  const blobs = [
    [0, 0, 36], [-28, 18, 28], [24, 20, 30], [-10, -28, 24], [30, -18, 22],
  ]
  return (
    <g>
      {blobs.map(([dx, dy, r], i) => (
        <circle key={i} cx={cx + dx} cy={cy + dy} r={r} fill={colors[i % colors.length]} opacity={0.92} />
      ))}
      {/* Highlight dot on top tree */}
      <circle cx={cx} cy={cy - 10} r={6} fill="rgba(255,255,255,0.06)" />
    </g>
  )
}

// ── Main scene ─────────────────────────────────────────────────────────────────
export default function HeroScene() {
  const setSceneLoaded = useAppStore((s) => s.setSceneLoaded)
  const [isMobile, setIsMobile]     = useState(false)
  const [hovered, setHovered]       = useState(null)
  const [tick, setTick]             = useState(0)

  useEffect(() => {
    setIsMobile(window.innerWidth < 900)
    const t = setTimeout(() => setSceneLoaded(), 400)
    const id = setInterval(() => setTick(n => n + 1), 1000)
    return () => { clearTimeout(t); clearInterval(id) }
  }, [setSceneLoaded])

  if (isMobile) return null

  const charData = CHARS.map((char, i) => {
    const offset   = i * 3
    const period   = 8
    const roomIdx  = Math.floor((tick + offset) / period) % char.route.length
    const phase    = (tick + offset) % period   // 0=just moved, 1-7=settled
    const pos      = rc(char.route[roomIdx])
    const speech   = char.speech[roomIdx % char.speech.length]
    const bubbleKey = `${char.id}-${Math.floor((tick + offset) / period)}`
    return { char, pos, phase, speech, bubbleKey }
  })

  // ── Horizontal divider wall segments (y = RY1) ─────────────────────────────
  // Gaps (doors): b1↔li at x~218-290, b2↔ki at x~468-540, ba↔es at x~698-770
  const hWallD = `M ${IX} ${RY1} L 215 ${RY1}  M 292 ${RY1} L 462 ${RY1}  M 538 ${RY1} L 695 ${RY1}  M 772 ${RY1} L ${IR} ${RY1}`
  // Vertical divider CX1 (gaps: b1↔b2 at y~135-198, li↔ki at y~348-418)
  const vWall1D = `M ${CX1} ${IY} L ${CX1} 132  M ${CX1} 200 L ${CX1} 345  M ${CX1} 420 L ${CX1} ${IB}`
  // Vertical divider CX2 (gaps: b2↔ba at y~135-198, ki↔es at y~348-418)
  const vWall2D = `M ${CX2} ${IY} L ${CX2} 132  M ${CX2} 200 L ${CX2} 345  M ${CX2} 420 L ${CX2} ${IB}`

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <style>{`
            .char-g { transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1); }
            @keyframes bubbleIn {
              0%   { opacity:0; transform:scale(.9) translateY(5px); }
              20%  { opacity:1; transform:scale(1) translateY(0); }
              78%  { opacity:1; transform:scale(1) translateY(0); }
              100% { opacity:0; transform:scale(.95) translateY(-4px); }
            }
            .bubble-anim { animation: bubbleIn 8s ease forwards; transform-box: fill-box; }
          `}</style>

          {/* Tile grid */}
          <pattern id="tiles" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="transparent" />
            <rect x=".5" y=".5" width="21" height="21" fill="rgba(255,255,255,0.04)" />
            <line x1="0" y1="22" x2="22" y2="22" stroke="rgba(0,0,0,0.07)" strokeWidth=".6" />
            <line x1="22" y1="0" x2="22" y2="22" stroke="rgba(0,0,0,0.07)" strokeWidth=".6" />
          </pattern>

          {/* Wood planks for bedrooms */}
          <pattern id="wood" x="0" y="0" width="36" height="10" patternUnits="userSpaceOnUse">
            <rect width="36" height="10" fill="transparent" />
            <line x1="0" y1="10" x2="36" y2="10" stroke="rgba(0,0,0,0.04)" strokeWidth=".8" />
          </pattern>

          {/* Grass */}
          <pattern id="grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#162e12" />
            <circle cx="5" cy="5" r="1.8" fill="#112a0e" />
            <circle cx="0" cy="0" r="1.2" fill="#1a341a" />
            <circle cx="10" cy="10" r="1.2" fill="#132d12" />
          </pattern>

          {/* Bubble drop shadow */}
          <filter id="bubbleShadow" x="-20%" y="-30%" width="145%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="rgba(0,0,0,0.22)" />
          </filter>

          {/* Room hover glow */}
          <filter id="roomGlow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
        </defs>

        {/* ── Garden background ─────────────────────────────────────────────── */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#grass)" />

        {/* Path / driveway */}
        <rect x={215} y={HY + HH} width={160} height={VH - HY - HH + 4} rx={4}
          fill="#8a7b68" opacity={0.85} />
        {/* Kerb lines */}
        <line x1={215} y1={HY + HH} x2={215} y2={VH} stroke="#6e6358" strokeWidth={2} />
        <line x1={375} y1={HY + HH} x2={375} y2={VH} stroke="#6e6358" strokeWidth={2} />

        {/* Garden beds */}
        <ellipse cx={72} cy={320} rx={42} ry={60} fill="#122510" opacity={0.6} />
        <ellipse cx={928} cy={200} rx={38} ry={52} fill="#122510" opacity={0.55} />

        {/* Tree clusters — corners and edges */}
        <Trees cx={45}  cy={45}  />
        <Trees cx={955} cy={42}  />
        <Trees cx={42}  cy={538} />
        <Trees cx={958} cy={536} />
        <Trees cx={505} cy={30}  />
        <Trees cx={68}  cy={200} />
        <Trees cx={935} cy={340} />

        {/* ── House footprint (walls) ────────────────────────────────────────── */}
        <rect x={HX} y={HY} width={HW} height={HH} fill="#1e1c1a" rx={3} />

        {/* ── Room floors ──────────────────────────────────────────────────── */}
        {ROOM_LIST.map(room => (
          <g key={room.id}
            onMouseEnter={() => setHovered(room.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Base floor */}
            <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={room.floor} />
            {/* Pattern overlay */}
            <rect x={room.x} y={room.y} width={room.w} height={room.h}
              fill={room.tile ? 'url(#tiles)' : 'url(#wood)'} opacity={0.9} />
            {/* Hover highlight */}
            {hovered === room.id && (
              <rect x={room.x} y={room.y} width={room.w} height={room.h}
                fill="rgba(63,184,224,0.12)" />
            )}
          </g>
        ))}

        {/* ── Furniture — Bedroom 1 ─────────────────────────────────────────── */}
        <Bed       x={170} y={78}  w={148} h={96}  />
        <Wardrobe  x={354} y={78}  w={22}  h={148} />
        <Rect      x={162} y={78}  w={20}  h={20}  />
        <Rect      x={323} y={78}  w={20}  h={20}  />
        <Rect      x={130} y={195} w={230} h={48}  rx={6} fill="rgba(180,145,110,0.1)" stroke="rgba(0,0,0,0.07)" sw={1}/>

        {/* ── Furniture — Bedroom 2 ─────────────────────────────────────────── */}
        <Bed       x={420} y={78}  w={135} h={92}  />
        <Wardrobe  x={390} y={78}  w={22}  h={148} />
        <Rect      x={416} y={78}  w={19}  h={19}  />
        <Rect      x={558} y={78}  w={19}  h={19}  />

        {/* ── Furniture — Bathroom ─────────────────────────────────────────── */}
        <Bath      x={632} y={76}  w={165} h={68}  />
        <Toilet    x={820} y={76}  w={38}  h={55}  />
        <Sink      x={820} y={140} w={40}  h={36}  />
        <Shower    x={632} y={168} w={88}  h={78}  />

        {/* ── Furniture — Living Room ───────────────────────────────────────── */}
        <Rect      x={138} y={264} w={220} h={18}  fill="rgba(0,0,0,0.1)" />
        {/* TV */}
        <rect x={145} y={265} width={206} height={14} rx={2} fill="#111" opacity={0.7} />
        <Sofa      x={132} y={462} w={238} h={44}  />
        <Rect      x={170} y={395} w={120} h={52}  rx={4} fill="rgba(0,0,0,0.05)" />
        <Rect      x={135} y={384} w={238} h={115} rx={8} fill="rgba(160,130,90,0.08)" stroke="rgba(0,0,0,0.06)" sw={1}/>

        {/* ── Furniture — Kitchen ───────────────────────────────────────────── */}
        <Rect      x={390} y={264} w={230} h={20}  />
        <Rect      x={600} y={284} w={20}  h={220} />
        <Rect      x={390} y={284} w={20}  h={220} />
        {/* Island */}
        <Rect      x={420} y={365} w={130} h={70}  rx={4} fill="rgba(180,158,128,0.15)" />
        {/* Hob burners */}
        {[0,1,2,3].map(i => (
          <circle key={i} cx={430 + (i % 2) * 22} cy={275 + Math.floor(i / 2) * 16} r={5}
            fill="rgba(0,0,0,0.12)" stroke={F_STROKE} strokeWidth={0.8} />
        ))}

        {/* ── Furniture — En Suite ─────────────────────────────────────────── */}
        <Shower    x={630} y={263} w={148} h={132} />
        <Toilet    x={820} y={263} w={40}  h={56}  />
        <Sink      x={630} y={472} w={48}  h={34}  />
        {/* Vanity unit */}
        <Rect      x={627} y={468} w={200} h={38}  />

        {/* ── Internal divider walls ────────────────────────────────────────── */}
        {/* Horizontal */}
        <path d={hWallD} fill="none" stroke="#1a1818" strokeWidth={WALL} strokeLinecap="butt" />
        {/* Vertical */}
        <path d={vWall1D} fill="none" stroke="#1a1818" strokeWidth={WALL} strokeLinecap="butt" />
        <path d={vWall2D} fill="none" stroke="#1a1818" strokeWidth={WALL} strokeLinecap="butt" />

        {/* ── Door arcs ─────────────────────────────────────────────────────── */}
        <DoorArc cx={215} cy={RY1} r={42} startAngle={0}   endAngle={-90} />
        <DoorArc cx={462} cy={RY1} r={42} startAngle={180} endAngle={-90} />
        <DoorArc cx={695} cy={RY1} r={42} startAngle={0}   endAngle={-90} />
        <DoorArc cx={CX1} cy={132} r={42} startAngle={90}  endAngle={0}   />
        <DoorArc cx={CX2} cy={132} r={42} startAngle={90}  endAngle={0}   />
        <DoorArc cx={CX1} cy={420} r={42} startAngle={90}  endAngle={0}   />
        <DoorArc cx={CX2} cy={420} r={42} startAngle={90}  endAngle={0}   />

        {/* ── Outer wall border ─────────────────────────────────────────────── */}
        <rect x={HX} y={HY} width={HW} height={HH}
          fill="none" stroke="#111" strokeWidth={WALL * 2} rx={2} />

        {/* ── Room labels ──────────────────────────────────────────────────── */}
        {ROOM_LIST.map(room => (
          <text
            key={room.id + '-lbl'}
            x={room.x + room.w / 2}
            y={room.y + room.h - 14}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fontFamily="Inter, -apple-system, sans-serif"
            letterSpacing="0.08em"
            fill={hovered === room.id ? '#1e6e8e' : 'rgba(0,0,0,0.35)'}
            style={{ textTransform: 'uppercase', userSelect: 'none', pointerEvents: 'none' }}
          >
            {room.label.toUpperCase()}
          </text>
        ))}

        {/* ── Characters ───────────────────────────────────────────────────── */}
        {charData.map(({ char, pos, speech, bubbleKey }) => (
          <Character key={char.id} char={char} pos={pos} speech={speech} bubbleKey={bubbleKey} />
        ))}

        {/* ── Bottom gradient so hero text is readable ─────────────────────── */}
        <defs>
          <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f8f5f0" stopOpacity="0" />
            <stop offset="100%" stopColor="#f8f5f0" stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <rect x={0} y={VH * 0.55} width={VW} height={VH * 0.45} fill="url(#heroFade)" />

        {/* Compass rose (top-right corner) */}
        <g transform="translate(945, 90)" opacity={0.28}>
          <circle cx={0} cy={0} r={18} fill="none" stroke="#1a1a1a" strokeWidth={1} />
          <polygon points="0,-14 3,-4 0,-8 -3,-4" fill="#1a1a1a" />
          <polygon points="0,14 3,4 0,8 -3,4"  fill="#1a1a1a" opacity={0.4} />
          <polygon points="-14,0 -4,-3 -8,0 -4,3" fill="#1a1a1a" opacity={0.4} />
          <polygon points="14,0 4,-3 8,0 4,3"  fill="#1a1a1a" opacity={0.4} />
          <text x={0} y={-20} textAnchor="middle" fontSize={8} fontWeight={700}
            fontFamily="Inter, sans-serif" fill="#1a1a1a">N</text>
        </g>

        {/* Scale bar */}
        <g transform="translate(58, 540)" opacity={0.35}>
          <line x1={0} y1={0} x2={80} y2={0} stroke="#1a1a1a" strokeWidth={2} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="#1a1a1a" strokeWidth={1.5} />
          <line x1={80} y1={-4} x2={80} y2={4} stroke="#1a1a1a" strokeWidth={1.5} />
          <text x={40} y={-8} textAnchor="middle" fontSize={8} fontFamily="Inter, sans-serif" fill="#1a1a1a">5m</text>
        </g>

      </svg>
    </div>
  )
}

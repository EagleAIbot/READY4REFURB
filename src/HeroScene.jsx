import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'

// ── Original house geometry (unchanged — we translate the whole house group) ──
const HX = 110, HY = 55, HW = 780, HH = 470, WALL = 15
const IX = HX + WALL        // 125
const IY = HY + WALL        // 70
const IR = HX + HW - WALL   // 875
const IB = HY + HH - WALL   // 510
const CX1 = 385, CX2 = 625, RY1 = 258

// ── Zoomed-out viewport — house sits centred with big garden border ────────────
const VW = 1380, VH = 760
const TX = 190, TY = 90     // translate applied to house group

// Room definitions (house-space coordinates)
const ROOMS = {
  b1: { x: IX,  y: IY,  w: CX1-IX,  h: RY1-IY,  label: 'Bedroom 1',   floor: '#f3ece1', tile: false },
  b2: { x: CX1, y: IY,  w: CX2-CX1, h: RY1-IY,  label: 'Bedroom 2',   floor: '#eee8dc', tile: false },
  ba: { x: CX2, y: IY,  w: IR-CX2,  h: RY1-IY,  label: 'Bathroom',    floor: '#d4e8f5', tile: true  },
  li: { x: IX,  y: RY1, w: CX1-IX,  h: IB-RY1,  label: 'Living Room', floor: '#ece7d3', tile: false },
  ki: { x: CX1, y: RY1, w: CX2-CX1, h: IB-RY1,  label: 'Kitchen',     floor: '#f0e6d8', tile: true  },
  es: { x: CX2, y: RY1, w: IR-CX2,  h: IB-RY1,  label: 'En Suite',    floor: '#bfdaf0', tile: true  },
}
const ROOM_LIST = Object.entries(ROOMS).map(([id, r]) => ({ id, ...r }))
const rc = (id) => { const r = ROOMS[id]; return r ? { x: r.x + r.w/2, y: r.y + r.h/2 } : { x:0, y:0 } }

// ── Two-character concept: Client tours rooms → Contractor follows & responds ──
const ROUTE = ['ba', 'li', 'b1', 'ki', 'es', 'b2']

const CLIENT_SPEECH = {
  ba: 'This bathroom needs a full rip-out.',
  li: 'Could do with a fresh plaster in here.',
  b1: 'Built-in wardrobe would be ideal.',
  ki: 'New kitchen, new worktops — the lot.',
  es: 'I want this as a walk-in wet room.',
  b2: 'Sort the ceiling and skirting boards.',
}
const CONTRACTOR_SPEECH = {
  ba: 'Not a problem — strip out, full refit.',
  li: 'Easy. Skim and sand, done properly.',
  b1: "Built-ins are our thing. Leave it to us.",
  ki: 'Measured and fitted. No stress.',
  es: "Done it hundreds of times. Immaculate.",
  b2: "Sorted. Tidy job, every time.",
}

// ── Furniture helpers ──────────────────────────────────────────────────────────
const FF = 'rgba(0,0,0,0.065)', FS = 'rgba(0,0,0,0.18)', FSW = 1

function Rect({ x, y, w, h, rx=2, fill=FF, stroke=FS, sw=FSW }) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={sw} />
}
function Bed({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h} rx={4} />
    <Rect x={x} y={y} w={w} h={13} rx={2} fill="rgba(0,0,0,0.10)" />
    <Rect x={x+7} y={y+18} w={w*0.38} h={18} rx={9} fill="rgba(255,255,255,0.7)" />
    <Rect x={x+w*0.57} y={y+18} w={w*0.36} h={18} rx={9} fill="rgba(255,255,255,0.7)" />
  </g>
}
function Bath({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h} rx={6} fill="rgba(160,210,245,0.25)" />
    <Rect x={x+8} y={y+8} w={w-16} h={h-16} rx={14} fill="rgba(160,210,245,0.35)" />
    <circle cx={x+w-16} cy={y+h-14} r={5} fill="rgba(0,0,0,0.12)" stroke={FS} strokeWidth={0.8} />
  </g>
}
function Toilet({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h*0.42} rx={3} />
    <ellipse cx={x+w/2} cy={y+h*0.73} rx={w/2} ry={h*0.3} fill={FF} stroke={FS} strokeWidth={FSW} />
  </g>
}
function Sink({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h} rx={3} />
    <ellipse cx={x+w/2} cy={y+h/2} rx={w*0.33} ry={h*0.33} fill="rgba(160,210,245,0.4)" stroke={FS} strokeWidth={0.8} />
  </g>
}
function Shower({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h} fill="rgba(140,200,240,0.18)" rx={3} />
    <line x1={x} y1={y} x2={x+w} y2={y+h} stroke={FS} strokeWidth={0.6} />
    <line x1={x+w} y1={y} x2={x} y2={y+h} stroke={FS} strokeWidth={0.6} />
    <circle cx={x+w*0.72} cy={y+h*0.28} r={5} fill="rgba(140,200,240,0.5)" stroke={FS} strokeWidth={0.8} />
  </g>
}
function Sofa({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h} rx={5} fill="rgba(110,95,80,0.1)" />
    <Rect x={x} y={y} w={16} h={h} rx={4} fill="rgba(110,95,80,0.16)" />
    <Rect x={x+w-16} y={y} w={16} h={h} rx={4} fill="rgba(110,95,80,0.16)" />
    <Rect x={x} y={y} w={w} h={14} rx={4} fill="rgba(110,95,80,0.16)" />
  </g>
}
function Wardrobe({ x, y, w, h }) {
  return <g>
    <Rect x={x} y={y} w={w} h={h} fill="rgba(0,0,0,0.09)" rx={2} />
    <line x1={x+w/2} y1={y+2} x2={x+w/2} y2={y+h-2} stroke={FS} strokeWidth={0.8} />
  </g>
}

// ── Character (top-down view) ──────────────────────────────────────────────────
// showBubble: when false the bubble is not mounted at all — mounting it triggers the CSS animation
function Character({ pos, color, headColor, hairColor, hairSize, bubbleKey, speech, bubbleRight, showBubble = true }) {
  const bw = 170, bh = 56
  const bx = bubbleRight ? 20 : -(bw + 20)
  return (
    <g className="char-g" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <ellipse cx={3} cy={5} rx={16} ry={10} fill="rgba(0,0,0,0.18)" />
      <circle cx={0} cy={0} r={16} fill={color} />
      <circle cx={0} cy={-4} r={10} fill={headColor} />
      <ellipse cx={0} cy={-8} rx={hairSize} ry={hairSize * 0.65} fill={hairColor} opacity={0.88} />
      <circle cx={0} cy={0} r={16} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />

      {showBubble && (
        <g key={bubbleKey} className="bubble-anim" style={{ transformOrigin: `${bx + bw/2}px -32px` }}>
          <g filter="url(#bubbleShadow)">
            <rect x={bx} y={-bh - 28} width={bw} height={bh} rx={10}
              fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
            <polygon
              points={`${bubbleRight ? bx+18 : bx+bw-18},-28  ${bubbleRight ? bx+34 : bx+bw-34},-28  ${bubbleRight ? bx+18 : bx+bw-18},-14`}
              fill="white"
            />
          </g>
          <foreignObject x={bx+10} y={-bh-25} width={bw-20} height={bh-4}>
            <div xmlns="http://www.w3.org/1999/xhtml" style={{
              fontSize: '10.5px', fontFamily: 'Inter, -apple-system, sans-serif',
              fontWeight: 500, color: '#1a1a1a', lineHeight: 1.45,
            }}>
              {speech}
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  )
}

// ── Door arc ───────────────────────────────────────────────────────────────────
function DoorArc({ cx, cy, r=44, startAngle, endAngle }) {
  const rad = d => (d * Math.PI) / 180
  const x1 = cx + r * Math.cos(rad(startAngle)), y1 = cy + r * Math.sin(rad(startAngle))
  const x2 = cx + r * Math.cos(rad(endAngle)),   y2 = cy + r * Math.sin(rad(endAngle))
  return <>
    <line x1={cx} y1={cy} x2={x1} y2={y1} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
    <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
      fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={1} strokeDasharray="3,2" />
  </>
}

// ── Tree cluster ───────────────────────────────────────────────────────────────
function Trees({ cx, cy, scale=1 }) {
  const blobs = [[0,0,36],[-28,18,28],[24,20,30],[-10,-28,24],[30,-18,22]]
  const cols  = ['#0e2010','#162c12','#1c3818','#122610','#183214']
  return <g>
    {blobs.map(([dx,dy,r],i) => (
      <circle key={i} cx={cx+dx*scale} cy={cy+dy*scale} r={r*scale}
        fill={cols[i % cols.length]} opacity={0.92} />
    ))}
    <circle cx={cx} cy={cy-10*scale} r={6*scale} fill="rgba(255,255,255,0.05)" />
  </g>
}

// ── Mobile: 2-room scene (Bedroom + Bathroom side by side) ────────────────────
const MOB_VW = 400, MOB_VH = 480
const MOB_WALL = 12
// Two rooms filling the viewBox with a thick dividing wall
const MOB_BED = { x: MOB_WALL, y: MOB_WALL, w: 175, h: MOB_VH - MOB_WALL*2, label: 'BEDROOM', floor: '#f3ece1' }
const MOB_BAT = { x: 213,      y: MOB_WALL, w: MOB_VW - 213 - MOB_WALL, h: MOB_VH - MOB_WALL*2, label: 'BATHROOM', floor: '#d4e8f5' }
const MOB_CHARS = [
  { id:'mc', color:'#3FB8E0', headColor:'#f5d0a8', hairColor:'#c89050', hairSize:4 },
  { id:'mk', color:'#1e2d40', headColor:'#d4956a', hairColor:'#1a1a1a', hairSize:9 },
]
const MOB_ROUTE = ['bed', 'bath']
const MOB_POS   = { bed: { x: MOB_BED.x + MOB_BED.w/2, y: MOB_VH/2 }, bath: { x: MOB_BAT.x + MOB_BAT.w/2, y: MOB_VH/2 } }
const MOB_CLIENT_SPEECH = { bed: 'Bedroom could do with a wardrobe fit-out.', bath: 'This bathroom needs a full rip-out.' }
const MOB_CONTR_SPEECH  = { bed: 'Built-ins are our thing. Leave it to us.', bath: 'Not a problem — full refit, sorted.' }

function MobileScene({ tick }) {
  const PERIOD = 12
  const roomIdx    = Math.floor(tick / PERIOD) % 2
  const currentRoom = MOB_ROUTE[roomIdx]
  // Both in same room, side by side
  const mobCenter  = MOB_POS[currentRoom]
  const mClientPos = { x: mobCenter.x - 22, y: mobCenter.y }
  const mContPos   = { x: mobCenter.x + 22, y: mobCenter.y }
  const mPhase      = tick % PERIOD
  const mClientKey  = `mc-${roomIdx}`
  const mContKey    = `mk-${roomIdx}`
  const mShowCont   = mPhase >= 5

  return (
    <svg viewBox={`0 0 ${MOB_VW} ${MOB_VH}`} width="100%" height="100%"
      preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
      <defs>
        <style>{`
          .mob-char { transition: transform 1.8s cubic-bezier(0.4,0,0.2,1); }
          @keyframes mobBubble {
            0%{opacity:0;transform:translateY(5px)}18%{opacity:1;transform:translateY(0)}
            80%{opacity:1}100%{opacity:0;transform:translateY(-3px)}
          }
          .mob-bubble { animation: mobBubble ${PERIOD}s ease forwards; }
        `}</style>
        <pattern id="mtiles" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="transparent"/>
          <line x1="0" y1="22" x2="22" y2="22" stroke="rgba(0,0,0,0.07)" strokeWidth=".6"/>
          <line x1="22" y1="0" x2="22" y2="22" stroke="rgba(0,0,0,0.07)" strokeWidth=".6"/>
        </pattern>
        <pattern id="mwood" x="0" y="0" width="36" height="10" patternUnits="userSpaceOnUse">
          <rect width="36" height="10" fill="transparent"/>
          <line x1="0" y1="10" x2="36" y2="10" stroke="rgba(0,0,0,0.04)" strokeWidth=".8"/>
        </pattern>
        <filter id="mbShadow" x="-20%" y="-30%" width="150%" height="190%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(0,0,0,0.18)"/>
        </filter>
        <linearGradient id="mobFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0e0c" stopOpacity="0"/>
          <stop offset="100%" stopColor="#0a0e0c" stopOpacity="0.88"/>
        </linearGradient>
      </defs>

      {/* Outer wall */}
      <rect x={0} y={0} width={MOB_VW} height={MOB_VH} fill="#1e1c1a"/>
      {/* Bedroom floor */}
      <rect x={MOB_BED.x} y={MOB_BED.y} width={MOB_BED.w} height={MOB_BED.h} fill={MOB_BED.floor}/>
      <rect x={MOB_BED.x} y={MOB_BED.y} width={MOB_BED.w} height={MOB_BED.h} fill="url(#mwood)" opacity={0.9}/>
      {/* Bathroom floor */}
      <rect x={MOB_BAT.x} y={MOB_BAT.y} width={MOB_BAT.w} height={MOB_BAT.h} fill={MOB_BAT.floor}/>
      <rect x={MOB_BAT.x} y={MOB_BAT.y} width={MOB_BAT.w} height={MOB_BAT.h} fill="url(#mtiles)" opacity={0.9}/>

      {/* Dividing wall */}
      <rect x={190} y={MOB_WALL} width={22} height={MOB_VH - MOB_WALL*2} fill="#1a1818"/>
      {/* Door gap in dividing wall */}
      <rect x={190} y={MOB_VH/2 - 35} width={22} height={70} fill={MOB_BED.floor}/>

      {/* Bedroom furniture */}
      <Bed x={MOB_BED.x + 25} y={MOB_BED.y + 18} w={125} h={88}/>
      <Wardrobe x={MOB_BED.x + 5} y={MOB_BED.y + 120} w={20} h={130}/>

      {/* Bathroom furniture */}
      <Bath   x={MOB_BAT.x + 8}  y={MOB_BAT.y + 12}  w={MOB_BAT.w - 16} h={65}/>
      <Toilet x={MOB_BAT.x + 8}  y={MOB_BAT.y + 90}  w={38}             h={55}/>
      <Sink   x={MOB_BAT.x + 55} y={MOB_BAT.y + 90}  w={42}             h={38}/>
      <Shower x={MOB_BAT.x + 8}  y={MOB_BAT.y + 160} w={MOB_BAT.w - 20} h={MOB_VH - MOB_WALL*2 - 175}/>

      {/* Room labels */}
      {[MOB_BED, MOB_BAT].map((r, i) => (
        <text key={i} x={r.x + r.w/2} y={r.y + r.h - 14}
          textAnchor="middle" fontSize={9} fontWeight={700} letterSpacing="0.1em"
          fontFamily="Inter,-apple-system,sans-serif" fill="rgba(0,0,0,0.28)"
          style={{ userSelect:'none' }}>
          {r.label}
        </text>
      ))}

      {/* Characters — both in same room, client LEFT bubble, contractor RIGHT bubble */}
      {[
        { char: MOB_CHARS[0], pos: mClientPos, speech: MOB_CLIENT_SPEECH[currentRoom], key: mClientKey, right: false, show: true       },
        { char: MOB_CHARS[1], pos: mContPos,   speech: MOB_CONTR_SPEECH[currentRoom],  key: mContKey,   right: true,  show: mShowCont  },
      ].map(({ char, pos, speech, key, right, show }) => {
        const bw = 145, bh = 48, bx = right ? 22 : -(bw + 22)
        return (
          <g key={char.id} className="mob-char" style={{ transform:`translate(${pos.x}px, ${pos.y}px)`, willChange:'transform' }}>
            <ellipse cx={3} cy={5} rx={15} ry={9} fill="rgba(0,0,0,0.18)"/>
            <circle cx={0} cy={0} r={15} fill={char.color}/>
            <circle cx={0} cy={-4} r={9} fill={char.headColor}/>
            <ellipse cx={0} cy={-8} rx={char.hairSize} ry={char.hairSize*0.65} fill={char.hairColor} opacity={0.88}/>
            <circle cx={0} cy={0} r={15} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5}/>
            {show && (
              <g key={key} className="mob-bubble">
                <g filter="url(#mbShadow)">
                  <rect x={bx} y={-bh-24} width={bw} height={bh} rx={8} fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth={1}/>
                  <polygon points={`${right?bx+16:bx+bw-16},-24 ${right?bx+28:bx+bw-28},-24 ${right?bx+16:bx+bw-16},-12`} fill="white"/>
                </g>
                <foreignObject x={bx+8} y={-bh-21} width={bw-16} height={bh-4}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize:'9.5px', fontFamily:'Inter,sans-serif', fontWeight:500, color:'#1a1a1a', lineHeight:1.4 }}>
                    {speech}
                  </div>
                </foreignObject>
              </g>
            )}
          </g>
        )
      })}

      {/* Bottom fade */}
      <rect x={0} y={MOB_VH*0.52} width={MOB_VW} height={MOB_VH*0.48} fill="url(#mobFade)"/>
    </svg>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HeroScene() {
  const setSceneLoaded = useAppStore(s => s.setSceneLoaded)
  const [isMobile, setIsMobile] = useState(false)
  const [hovered, setHovered]   = useState(null)
  const [tick, setTick]         = useState(0)

  useEffect(() => {
    setIsMobile(window.innerWidth < 900)
    const t  = setTimeout(() => setSceneLoaded(), 400)
    const id = setInterval(() => setTick(n => n + 1), 1000)
    return () => { clearTimeout(t); clearInterval(id) }
  }, [setSceneLoaded])

  // ── Mobile: 2-room scene ───────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
        <MobileScene tick={tick} />
      </div>
    )
  }

  // ── Both in same room, side by side — client left, contractor right ──────────
  const PERIOD = 12
  const roomIdx    = Math.floor(tick / PERIOD) % ROUTE.length
  const currentRoom = ROUTE[roomIdx]
  const center     = rc(currentRoom)
  // Side-by-side offset
  const clientPos     = { x: center.x - 26, y: center.y }
  const contractorPos = { x: center.x + 26, y: center.y }
  const phaseInRoom       = tick % PERIOD        // 0–11 within current room visit
  const clientKey         = `client-${roomIdx}`
  const contractorKey     = `contractor-${roomIdx}` // fresh key per room; only mounted when due
  const showContractor    = phaseInRoom >= 5        // contractor silent for first 5s
  const clientRoom        = currentRoom
  const contractorRoom    = currentRoom

  // ── Wall paths with door gaps ────────────────────────────────────────────────
  const hWall  = `M ${IX} ${RY1} L 215 ${RY1}  M 292 ${RY1} L 462 ${RY1}  M 538 ${RY1} L 695 ${RY1}  M 772 ${RY1} L ${IR} ${RY1}`
  const vWall1 = `M ${CX1} ${IY} L ${CX1} 132  M ${CX1} 200 L ${CX1} 345  M ${CX1} 420 L ${CX1} ${IB}`
  const vWall2 = `M ${CX2} ${IY} L ${CX2} 132  M ${CX2} 200 L ${CX2} 345  M ${CX2} 420 L ${CX2} ${IB}`

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>

        <defs>
          <style>{`
            .char-g { transition: transform 1.8s cubic-bezier(0.4,0,0.2,1); }
            @keyframes bubbleIn {
              0%   { opacity:0; transform:scale(.88) translateY(6px); }
              18%  { opacity:1; transform:scale(1) translateY(0); }
              80%  { opacity:1; }
              100% { opacity:0; transform:scale(.95) translateY(-3px); }
            }
            .bubble-anim { animation: bubbleIn ${PERIOD}s ease forwards; transform-box: fill-box; }
          `}</style>

          <pattern id="tiles" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="transparent" />
            <rect x=".5" y=".5" width="21" height="21" fill="rgba(255,255,255,0.04)" />
            <line x1="0" y1="22" x2="22" y2="22" stroke="rgba(0,0,0,0.07)" strokeWidth=".6" />
            <line x1="22" y1="0" x2="22" y2="22" stroke="rgba(0,0,0,0.07)" strokeWidth=".6" />
          </pattern>
          <pattern id="wood" x="0" y="0" width="36" height="10" patternUnits="userSpaceOnUse">
            <rect width="36" height="10" fill="transparent" />
            <line x1="0" y1="10" x2="36" y2="10" stroke="rgba(0,0,0,0.04)" strokeWidth=".8" />
          </pattern>
          <pattern id="grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#162e12" />
            <circle cx="5" cy="5" r="1.8" fill="#112a0e" />
            <circle cx="0" cy="0" r="1.2" fill="#1a341a" />
            <circle cx="10" cy="10" r="1.2" fill="#132d12" />
          </pattern>
          <filter id="bubbleShadow" x="-20%" y="-30%" width="150%" height="190%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.2)" />
          </filter>
          <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0a0e0c" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0e0c" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* ── Garden background ────────────────────────────────────────────── */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#grass)" />

        {/* Driveway */}
        <rect x={TX+215} y={TX > 0 ? TY+HY+HH : HY+HH} width={160}
          height={VH - TY - HY - HH + 4} rx={3} fill="#8a7b68" opacity={0.8} />
        <line x1={TX+215} y1={TY+HY+HH} x2={TX+215} y2={VH} stroke="#6e6358" strokeWidth={2} />
        <line x1={TX+375} y1={TY+HY+HH} x2={TX+375} y2={VH} stroke="#6e6358" strokeWidth={2} />

        {/* Garden beds */}
        <ellipse cx={TX+55}  cy={TY+320} rx={44} ry={62} fill="#112210" opacity={0.55} />
        <ellipse cx={TX+920} cy={TY+180} rx={40} ry={55} fill="#112210" opacity={0.5}  />
        <ellipse cx={TX+900} cy={TY+400} rx={35} ry={50} fill="#112210" opacity={0.45} />

        {/* Tree clusters — more spread across larger garden */}
        <Trees cx={TX+38}   cy={TY+38}   />
        <Trees cx={TX+960}  cy={TY+36}   />
        <Trees cx={TX+36}   cy={TY+542}  />
        <Trees cx={TX+962}  cy={TY+540}  />
        <Trees cx={TX+500}  cy={TY+22}   />
        <Trees cx={TX+60}   cy={TY+200}  scale={0.8} />
        <Trees cx={TX+940}  cy={TY+340}  scale={0.85} />
        <Trees cx={TX+300}  cy={TY+555}  scale={0.75} />
        <Trees cx={TX+700}  cy={TY+558}  scale={0.75} />
        {/* Extra trees in expanded side gardens */}
        <Trees cx={TX-110}  cy={TY+150}  scale={0.9} />
        <Trees cx={TX-115}  cy={TY+390}  scale={0.85} />
        <Trees cx={TX+1085} cy={TY+120}  scale={0.9} />
        <Trees cx={TX+1090} cy={TY+420}  scale={0.85} />

        {/* ── House group — everything in original house-space coords ──────── */}
        <g transform={`translate(${TX}, ${TY})`}>

          {/* House wall background */}
          <rect x={HX} y={HY} width={HW} height={HH} fill="#1e1c1a" rx={3} />

          {/* Room floors */}
          {ROOM_LIST.map(room => (
            <g key={room.id}
              onMouseEnter={() => setHovered(room.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={room.floor} />
              <rect x={room.x} y={room.y} width={room.w} height={room.h}
                fill={room.tile ? 'url(#tiles)' : 'url(#wood)'} opacity={0.9} />
              {hovered === room.id && (
                <rect x={room.x} y={room.y} width={room.w} height={room.h}
                  fill="rgba(63,184,224,0.13)" />
              )}
            </g>
          ))}

          {/* Furniture — Bedroom 1 */}
          <Bed      x={170} y={78}  w={148} h={96}  />
          <Wardrobe x={354} y={78}  w={22}  h={148} />
          <Rect     x={162} y={78}  w={20}  h={20}  />
          <Rect     x={323} y={78}  w={20}  h={20}  />
          <Rect     x={130} y={195} w={230} h={48} rx={6} fill="rgba(180,145,110,0.1)" stroke="rgba(0,0,0,0.07)" sw={1} />

          {/* Furniture — Bedroom 2 */}
          <Bed      x={420} y={78}  w={135} h={92}  />
          <Wardrobe x={390} y={78}  w={22}  h={148} />
          <Rect     x={416} y={78}  w={19}  h={19}  />
          <Rect     x={558} y={78}  w={19}  h={19}  />

          {/* Furniture — Bathroom */}
          <Bath     x={632} y={76}  w={165} h={68}  />
          <Toilet   x={820} y={76}  w={38}  h={55}  />
          <Sink     x={820} y={140} w={40}  h={36}  />
          <Shower   x={632} y={168} w={88}  h={78}  />

          {/* Furniture — Living Room */}
          <rect x={145} y={265} width={206} height={14} rx={2} fill="#111" opacity={0.7} />
          <Sofa     x={132} y={462} w={238} h={44}  />
          <Rect     x={170} y={395} w={120} h={52} rx={4} fill="rgba(0,0,0,0.05)" />
          <Rect     x={135} y={384} w={238} h={115} rx={8} fill="rgba(160,130,90,0.08)" stroke="rgba(0,0,0,0.06)" sw={1} />

          {/* Furniture — Kitchen */}
          <Rect     x={390} y={264} w={230} h={20}  />
          <Rect     x={600} y={284} w={20}  h={220} />
          <Rect     x={390} y={284} w={20}  h={220} />
          <Rect     x={420} y={365} w={130} h={70} rx={4} fill="rgba(180,158,128,0.15)" />
          {[0,1,2,3].map(i => (
            <circle key={i} cx={430+(i%2)*22} cy={275+Math.floor(i/2)*16} r={5}
              fill="rgba(0,0,0,0.12)" stroke={FS} strokeWidth={0.8} />
          ))}

          {/* Furniture — En Suite */}
          <Shower   x={630} y={263} w={148} h={132} />
          <Toilet   x={820} y={263} w={40}  h={56}  />
          <Sink     x={630} y={472} w={48}  h={34}  />
          <Rect     x={627} y={468} w={200} h={38}  />

          {/* Internal walls */}
          <path d={hWall}  fill="none" stroke="#1a1818" strokeWidth={WALL} strokeLinecap="butt" />
          <path d={vWall1} fill="none" stroke="#1a1818" strokeWidth={WALL} strokeLinecap="butt" />
          <path d={vWall2} fill="none" stroke="#1a1818" strokeWidth={WALL} strokeLinecap="butt" />

          {/* Door arcs */}
          <DoorArc cx={215} cy={RY1} r={42} startAngle={0}   endAngle={-90} />
          <DoorArc cx={462} cy={RY1} r={42} startAngle={180} endAngle={-90} />
          <DoorArc cx={695} cy={RY1} r={42} startAngle={0}   endAngle={-90} />
          <DoorArc cx={CX1} cy={132} r={42} startAngle={90}  endAngle={0}   />
          <DoorArc cx={CX2} cy={132} r={42} startAngle={90}  endAngle={0}   />
          <DoorArc cx={CX1} cy={420} r={42} startAngle={90}  endAngle={0}   />
          <DoorArc cx={CX2} cy={420} r={42} startAngle={90}  endAngle={0}   />

          {/* Outer wall border */}
          <rect x={HX} y={HY} width={HW} height={HH}
            fill="none" stroke="#111" strokeWidth={WALL * 2} rx={2} />

          {/* Room labels */}
          {ROOM_LIST.map(room => (
            <text key={room.id+'-lbl'}
              x={room.x + room.w/2} y={room.y + room.h - 14}
              textAnchor="middle" fontSize={10} fontWeight={600}
              fontFamily="Inter, -apple-system, sans-serif" letterSpacing="0.08em"
              fill={hovered === room.id ? '#1e6e8e' : 'rgba(0,0,0,0.3)'}
              style={{ userSelect:'none', pointerEvents:'none' }}>
              {room.label.toUpperCase()}
            </text>
          ))}

          {/* ── Client (blue) — bubble always goes LEFT ──────────────────── */}
          <Character
            pos={clientPos}
            color="#3FB8E0"
            headColor="#f5d0a8"
            hairColor="#c89050"
            hairSize={4}
            bubbleKey={clientKey}
            speech={CLIENT_SPEECH[clientRoom]}
            bubbleRight={false}
          />

          {/* ── Contractor (dark navy) — waits 5s then responds RIGHT ──────── */}
          <Character
            pos={contractorPos}
            color="#1e2d40"
            headColor="#d4956a"
            hairColor="#1a1a1a"
            hairSize={9}
            bubbleKey={contractorKey}
            speech={CONTRACTOR_SPEECH[contractorRoom]}
            bubbleRight={true}
            showBubble={showContractor}
          />

        </g>{/* end house group */}

        {/* ── Bottom gradient for hero text readability ─────────────────────── */}
        <rect x={0} y={VH*0.52} width={VW} height={VH*0.48} fill="url(#heroFade)" />

        {/* Compass */}
        <g transform={`translate(${VW-55}, 80)`} opacity={0.25}>
          <circle cx={0} cy={0} r={20} fill="none" stroke="#1a1a1a" strokeWidth={1} />
          <polygon points="0,-15 3,-4 0,-8 -3,-4" fill="#1a1a1a" />
          <polygon points="0,15 3,4 0,8 -3,4"  fill="#1a1a1a" opacity={0.4} />
          <polygon points="-15,0 -4,-3 -8,0 -4,3" fill="#1a1a1a" opacity={0.4} />
          <polygon points="15,0 4,-3 8,0 4,3"  fill="#1a1a1a" opacity={0.4} />
          <text x={0} y={-22} textAnchor="middle" fontSize={8} fontWeight={700}
            fontFamily="Inter,sans-serif" fill="#1a1a1a">N</text>
        </g>

        {/* Scale bar */}
        <g transform="translate(60, 710)" opacity={0.32}>
          <line x1={0} y1={0} x2={80} y2={0} stroke="#1a1a1a" strokeWidth={2} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="#1a1a1a" strokeWidth={1.5} />
          <line x1={80} y1={-4} x2={80} y2={4} stroke="#1a1a1a" strokeWidth={1.5} />
          <text x={40} y={-8} textAnchor="middle" fontSize={8}
            fontFamily="Inter,sans-serif" fill="#1a1a1a">5m</text>
        </g>

      </svg>
    </div>
  )
}

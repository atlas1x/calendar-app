// V4 — Time River
// A vertical luminous "river of time" runs down the center. Events bloom
// off it as orbs whose color and glow saturate near "now" and dim toward
// the edges of the day. The whole canvas tints subtly with the time of day
// (cool dawn → warm dusk). Touch an orb for detail.

const V4 = (() => {
  const { events, weather, tasks } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    fg: '#f3eee5',
    dim: 'rgba(243,238,229,0.55)',
    faint: 'rgba(243,238,229,0.28)',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
    serif: '"Cormorant Garamond", Georgia, serif',
  };

  // Day spans 6am → 11pm
  const DAY_START = 6 * 60, DAY_END = 23 * 60;
  // We render the river within Y range [120, 880] of the 540×960 board.
  const Y_TOP = 130, Y_BOT = 860;
  const mToY = (m) => Y_TOP + (m - DAY_START) / (DAY_END - DAY_START) * (Y_BOT - Y_TOP);

  // Tint of the ambient backdrop based on time-of-day.
  const bgFor = (mins) => {
    // Hue swings from cool indigo (morning) → soft amber (evening) → deep night.
    const noon = 12 * 60;
    if (mins < 6 * 60)  return { a: '#0a0b18', b: '#0e0c14' };       // pre-dawn
    if (mins < 9 * 60)  return { a: '#10142a', b: '#1a1428' };       // dawn
    if (mins < 14 * 60) return { a: '#181a2c', b: '#1d1a2a' };       // midday cool
    if (mins < 18 * 60) return { a: '#1f1a26', b: '#241825' };       // afternoon warm
    if (mins < 21 * 60) return { a: '#1b1322', b: '#180e1a' };       // dusk
    return                    { a: '#0a0712', b: '#08060f' };        // night
  };

  function Backdrop({ now }) {
    const mins = U.minsOfDay(now);
    const c = bgFor(mins);
    return (
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 70% at 50% 30%, ${c.a} 0%, ${c.b} 70%, #050609 100%)` }} />
    );
  }

  function Header({ now }) {
    const h12 = now.getHours() % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ap = now.getHours() >= 12 ? 'pm' : 'am';
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dnum = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    return (
      <div style={{ position: 'relative', padding: '22px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: t.serif, fontSize: 26, color: t.fg, letterSpacing: -0.4, fontStyle: 'italic', lineHeight: 1 }}>
            {dayName}
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 10.5, color: t.dim, letterSpacing: 2, marginTop: 6, textTransform: 'uppercase' }}>
            {month} {dnum}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 200, color: t.fg, letterSpacing: -1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {h12}:{mm}<span style={{ fontSize: 12, color: t.dim, marginLeft: 4 }}>{ap}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
            <window.WeatherGlyph kind={weather.now.icon} size={14} color={t.dim} />
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.dim, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</span>
          </div>
        </div>
      </div>
    );
  }

  // The river itself: an SVG path with a soft gradient that brightens near "now".
  function River({ nowMin }) {
    const yNow = mToY(nowMin);
    // Vertical wavy path (slight sinusoidal sway)
    const points = [];
    for (let i = 0; i <= 30; i++) {
      const y = Y_TOP + (Y_BOT - Y_TOP) * (i / 30);
      const x = 270 + Math.sin((i / 30) * Math.PI * 2.4 + 0.4) * 8;
      points.push([x, y]);
    }
    const pathD = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');

    // Hour markers (every 3h)
    const hourTicks = [6, 9, 12, 15, 18, 21];

    return (
      <svg viewBox="0 0 540 960" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="riverGrad" x1="0" y1={Y_TOP} x2="0" y2={Y_BOT} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3a3a52" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#6b7390" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2a2438" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="nowGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffd9a8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f08a6c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f08a6c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* outer soft glow */}
        <path d={pathD} stroke="url(#riverGrad)" strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.55" filter="blur(6px)" />
        {/* core line */}
        <path d={pathD} stroke="url(#riverGrad)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* hour ticks */}
        {hourTicks.map((h) => {
          const y = mToY(h * 60);
          const past = h * 60 < nowMin;
          return (
            <g key={h} opacity={past ? 0.35 : 0.8}>
              <line x1="262" y1={y} x2="278" y2={y} stroke={t.dim} strokeWidth="1" />
              <text x="248" y={y + 3} textAnchor="end" fill={t.faint} fontSize="9" fontFamily={t.mono} letterSpacing="1">
                {h % 12 || 12}{h < 12 ? 'A' : 'P'}
              </text>
            </g>
          );
        })}

        {/* current moment — soft halo + horizontal sweep */}
        {nowMin >= DAY_START && nowMin <= DAY_END && (
          <g>
            <circle cx="270" cy={yNow} r="80" fill="url(#nowGlow)" />
            <line x1="40" y1={yNow} x2="500" y2={yNow} stroke="#ffd9a8" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx="270" cy={yNow} r="6" fill="#ffd9a8" />
            <circle cx="270" cy={yNow} r="11" fill="none" stroke="#ffd9a8" strokeOpacity="0.45" strokeWidth="1.2" />
          </g>
        )}
      </svg>
    );
  }

  function EventOrb({ event, side, nowMin, onTap }) {
    const sm = U.parseHM(event.start), em = U.parseHM(event.end);
    const yMid = mToY((sm + em) / 2);
    const past = em < nowMin;
    const live = nowMin >= sm && nowMin < em;
    // attention dims linearly with distance from now (in minutes), within day
    const dist = Math.min(Math.abs((sm + em) / 2 - nowMin), 600);
    const attention = 1 - dist / 600;
    const opacity = past ? 0.35 : 0.55 + attention * 0.45;
    const dur = em - sm;
    // Orbs nudge left/right of river based on side
    const x = side === 'L' ? 220 : 320;
    const textAlign = side === 'L' ? 'right' : 'left';
    const labelX = side === 'L' ? 195 : 345;

    return (
      <div onClick={() => onTap(event)} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* connector line from river to orb */}
        <svg viewBox="0 0 540 960" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <line x1={270} y1={yMid} x2={x} y2={yMid} stroke={event.color} strokeOpacity={opacity * 0.5} strokeWidth="1" />
        </svg>
        {/* orb */}
        <div style={{ position: 'absolute', left: `${(x / 540) * 100}%`, top: `${(yMid / 960) * 100}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
          <div onClick={() => onTap(event)} style={{
            width: 18 + Math.min(dur / 30, 4) * 2,
            height: 18 + Math.min(dur / 30, 4) * 2,
            borderRadius: '50%',
            background: event.color,
            opacity,
            boxShadow: live ? `0 0 22px ${event.color}, 0 0 2px #fff inset` : `0 0 ${10 * attention}px ${event.color}`,
            cursor: 'pointer',
            border: live ? `2px solid #fff` : 'none',
          }} />
        </div>
        {/* label */}
        <div style={{
          position: 'absolute',
          left: side === 'L' ? 0 : `${(labelX / 540) * 100}%`,
          right: side === 'L' ? `${((540 - labelX) / 540) * 100}%` : 0,
          top: `${(yMid / 960) * 100}%`,
          transform: 'translateY(-50%)',
          textAlign,
          paddingLeft: side === 'L' ? 16 : 0,
          paddingRight: side === 'L' ? 0 : 16,
          opacity,
        }}>
          <div style={{ fontFamily: t.mono, fontSize: 9.5, color: event.color, letterSpacing: 0.8, fontWeight: 600 }}>{U.fmt12Short(sm).toUpperCase()}</div>
          <div style={{ fontFamily: t.serif, fontSize: 16, color: t.fg, letterSpacing: -0.3, marginTop: 1, lineHeight: 1.1, fontStyle: live ? 'italic' : 'normal', textWrap: 'balance' }}>{event.title}</div>
          <div style={{ fontFamily: t.mono, fontSize: 9, color: t.dim, marginTop: 3, letterSpacing: 0.4 }}>{event.loc}</div>
        </div>
      </div>
    );
  }

  function Footer({ now }) {
    const nowMin = U.minsOfDay(now);
    const next = U.nextEvent(events, nowMin);
    const undone = tasks.filter((tk) => !tk.done).length;
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 28px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, fontFamily: t.mono }}>
        <div>
          <div style={{ fontSize: 9.5, color: t.faint, letterSpacing: 1.5 }}>NEXT</div>
          {next ? (
            <div style={{ fontFamily: t.serif, fontSize: 16, color: t.fg, fontStyle: 'italic', marginTop: 2 }}>
              {next.title} <span style={{ fontFamily: t.mono, fontSize: 10, color: t.dim, fontStyle: 'normal' }}>· {U.countdownLabel(U.parseHM(next.start) - nowMin)}</span>
            </div>
          ) : <div style={{ fontFamily: t.serif, fontSize: 14, color: t.dim, fontStyle: 'italic' }}>the day is done</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9.5, color: t.faint, letterSpacing: 1.5 }}>OPEN</div>
          <div style={{ fontFamily: t.serif, fontSize: 16, color: t.fg, fontStyle: 'italic', marginTop: 2 }}>{undone} tasks</div>
        </div>
      </div>
    );
  }

  function EventDetail({ event, onClose }) {
    if (!event) return null;
    const sm = U.parseHM(event.start), em = U.parseHM(event.end);
    return (
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,12,0.7)', backdropFilter: 'blur(14px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: event.color, margin: '0 auto', boxShadow: `0 0 48px ${event.color}` }} />
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.dim, letterSpacing: 2, marginTop: 18, textTransform: 'uppercase' }}>{event.cat}</div>
          <div style={{ fontFamily: t.serif, fontSize: 32, color: t.fg, marginTop: 8, letterSpacing: -0.7, fontStyle: 'italic', textWrap: 'balance' }}>{event.title}</div>
          <div style={{ fontFamily: t.mono, fontSize: 12, color: t.dim, marginTop: 14, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>{U.fmt12(sm)} – {U.fmt12(em)}</div>
          <div style={{ fontFamily: t.mono, fontSize: 11, color: t.faint, marginTop: 4, letterSpacing: 1 }}>{event.loc.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  function TimeRiver() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const nowMin = U.minsOfDay(now);
    const [tapped, setTapped] = React.useState(null);
    // Alternate sides for orbs to avoid overlap
    const sided = events.map((e, i) => ({ e, side: i % 2 === 0 ? 'L' : 'R' }));

    return (
      <div style={{ width: '100%', height: '100%', background: '#08060a', color: t.fg, fontFamily: t.font, position: 'relative', overflow: 'hidden' }}>
        <Backdrop now={now} />
        <Header now={now} />
        <River nowMin={nowMin} />
        {sided.map(({ e, side }) => (
          <EventOrb key={e.id} event={e} side={side} nowMin={nowMin} onTap={setTapped} />
        ))}
        <Footer now={now} />
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return TimeRiver;
})();

window.V4TimeRiver = V4;

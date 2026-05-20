// V5.3 — Terminal / NOC dashboard
// Loses the retro CRT chrome. Still monospace, but more like a modern dev
// dashboard: tight panel grid, cool monochrome with a single neutral accent,
// data tiles (next event T-minus, tasks pct, weather sparkline), and a
// taller schedule column on the right. No scanlines, no [TTY].

const V5NOC = (() => {
  const { events, weather, tasks, notes } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#0c0f14',
    panel: '#11151c',
    panel2: '#0e1218',
    rule: 'rgba(255,255,255,0.06)',
    fg: '#d8dee9',
    mid: '#8896a8',
    dim: 'rgba(216,222,233,0.55)',
    faint: 'rgba(216,222,233,0.28)',
    accent: '#7aa2f7',
    ok: '#9ece6a',
    warn: '#e0af68',
    mono: '"JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace',
  };

  const HOUR_PX = 34;
  const DAY_START = 7 * 60, DAY_END = 22 * 60;
  const mToY = (m) => (m - DAY_START) / 60 * HOUR_PX;

  // Reusable framed panel
  function Panel({ title, right, children, style }) {
    return (
      <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 4, padding: '10px 12px', ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 9.5, color: t.mid, letterSpacing: 1.6, fontWeight: 600 }}>{title}</span>
          {right && <span style={{ fontSize: 9, color: t.faint, letterSpacing: 0.8, fontVariantNumeric: 'tabular-nums' }}>{right}</span>}
        </div>
        {children}
      </div>
    );
  }

  function TopBar({ now }) {
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dnum = String(now.getDate()).padStart(2,'0');
    return (
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.panel2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: t.ok, boxShadow: `0 0 6px ${t.ok}` }} />
          <span style={{ fontSize: 11, color: t.mid, letterSpacing: 1.5 }}>calendar.live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontSize: 11, color: t.dim, letterSpacing: 1 }}>{day} {month} {dnum}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: t.fg, letterSpacing: -0.4 }}>{h}:{m}<span style={{ color: t.faint, fontSize: 11, marginLeft: 4 }}>:{s}</span></span>
        </div>
      </div>
    );
  }

  function TileNow({ now }) {
    const nowMin = U.minsOfDay(now);
    const cur = U.currentEvent(events, nowMin);
    const next = U.nextEvent(events, nowMin);
    if (cur) {
      const em = U.parseHM(cur.end);
      const sm = U.parseHM(cur.start);
      const pct = Math.min(100, Math.max(0, (nowMin - sm) / (em - sm) * 100));
      return (
        <Panel title="● LIVE" right={`${em - nowMin}m left`}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.fg, letterSpacing: -0.3, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.title}</div>
          <div style={{ fontSize: 10, color: t.dim, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{cur.start}–{cur.end} · {cur.loc}</div>
          <div style={{ marginTop: 8, height: 3, background: t.rule, borderRadius: 1.5, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: cur.color }} />
          </div>
        </Panel>
      );
    }
    return (
      <Panel title="○ IDLE" right={next ? U.countdownLabel(U.parseHM(next.start) - nowMin) : '—'}>
        {next ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.fg, letterSpacing: -0.3, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</div>
            <div style={{ fontSize: 10, color: t.dim, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{next.start} · {next.loc}</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: next.color, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>
              T-{String(Math.floor((U.parseHM(next.start) - nowMin) / 60)).padStart(2,'0')}h{String((U.parseHM(next.start) - nowMin) % 60).padStart(2,'0')}m
            </div>
          </>
        ) : <div style={{ fontSize: 13, color: t.dim }}>End of day.</div>}
      </Panel>
    );
  }

  function TileWeather() {
    const temps = weather.week.map((d) => d.hi);
    const min = Math.min(...temps), max = Math.max(...temps);
    const points = temps.map((tp, i) => {
      const x = (i / (temps.length - 1)) * 100;
      const y = max === min ? 50 : 100 - ((tp - min) / (max - min)) * 70 - 15;
      return [x, y];
    });
    const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    const area = `${path} L100,100 L0,100 Z`;
    return (
      <Panel title="WEATHER" right="SAN FRANCISCO">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <window.WeatherGlyph kind={weather.now.icon} size={18} color={t.fg} />
          <span style={{ fontSize: 22, fontWeight: 700, color: t.fg, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</span>
          <span style={{ fontSize: 10, color: t.dim, fontVariantNumeric: 'tabular-nums' }}>↑{weather.now.hi} ↓{weather.now.lo}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="42">
            <path d={area} fill={`${t.accent}22`} />
            <path d={path} stroke={t.accent} strokeWidth="1.4" fill="none" vectorEffect="non-scaling-stroke" />
            {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill={t.accent} />)}
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${temps.length}, 1fr)`, fontSize: 9, color: t.faint, marginTop: 2, letterSpacing: 0.5 }}>
            {weather.week.map((d, i) => <div key={i} style={{ textAlign: 'center' }}>{d.d[0]}</div>)}
          </div>
        </div>
      </Panel>
    );
  }

  function TileTasks() {
    const undone = tasks.filter((tk) => !tk.done);
    const pct = Math.round((1 - undone.length / tasks.length) * 100);
    return (
      <Panel title="TASKS" right={`${pct}%`}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
          {tasks.map((tk) => (
            <div key={tk.id} style={{ flex: 1, height: 4, background: tk.done ? t.ok : t.rule, borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {undone.slice(0, 3).map((task) => (
            <div key={task.id} style={{ fontSize: 11, color: t.fg, display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ color: task.due === 'today' ? t.warn : t.mid, width: 9 }}>[ ]</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{task.text}</span>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  // 24h density bar (slim)
  function DayBar({ now }) {
    const nowMin = U.minsOfDay(now);
    return (
      <Panel title="DAY" right={`${events.length} EVENTS`}>
        <div style={{ position: 'relative', height: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }} />
          {events.map((e) => {
            const sm = U.parseHM(e.start), em = U.parseHM(e.end);
            return (
              <div key={e.id} style={{
                position: 'absolute',
                left: `${(sm / 1440) * 100}%`,
                width: `${((em - sm) / 1440) * 100}%`,
                top: 0, bottom: 0,
                background: e.color,
                opacity: em < nowMin ? 0.35 : 1,
                borderRadius: 1.5,
              }} />
            );
          })}
          <div style={{ position: 'absolute', left: `${(nowMin / 1440) * 100}%`, top: -3, bottom: -3, width: 2, background: t.fg, boxShadow: `0 0 6px ${t.fg}` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: t.faint, marginTop: 4, letterSpacing: 0.5 }}>
          <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
        </div>
      </Panel>
    );
  }

  function Schedule({ now, onTap }) {
    const nowMin = U.minsOfDay(now);
    const hours = []; for (let h = 7; h <= 22; h++) hours.push(h);
    return (
      <Panel title="SCHEDULE" right="07–22 PT" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ position: 'relative', flex: 1, marginTop: 2, paddingLeft: 36 }}>
          {hours.map((h) => {
            const y = mToY(h * 60);
            return (
              <React.Fragment key={h}>
                <div style={{ position: 'absolute', left: 36, right: 0, top: y, height: 1, background: t.rule }} />
                <div style={{ position: 'absolute', left: 0, top: y - 5, fontSize: 9.5, color: t.faint, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                  {String(h).padStart(2,'0')}:00
                </div>
              </React.Fragment>
            );
          })}

          {events.map((e) => {
            const sm = U.parseHM(e.start), em = U.parseHM(e.end);
            if (em < DAY_START || sm > DAY_END) return null;
            const top = mToY(sm);
            const height = Math.max(18, mToY(em) - mToY(sm) - 2);
            const past = em < nowMin;
            return (
              <div key={e.id} onClick={() => onTap(e)} style={{
                position: 'absolute', left: 36, right: 0, top, height,
                background: `${e.color}1f`,
                borderLeft: `3px solid ${e.color}`,
                padding: '3px 8px',
                color: t.fg,
                cursor: 'pointer',
                opacity: past ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                <span style={{ fontSize: 9.5, color: t.dim, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 6 }}>{e.start}</span>
              </div>
            );
          })}

          {nowMin >= DAY_START && nowMin <= DAY_END && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: mToY(nowMin), pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: 28, right: 0, height: 1, background: t.fg }} />
              <div style={{ position: 'absolute', left: 24, top: -3, width: 6, height: 6, background: t.fg, borderRadius: 1 }} />
            </div>
          )}
        </div>
      </Panel>
    );
  }

  function NotesPanel() {
    return (
      <Panel title="MESSAGES" right={`${notes.length}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notes.slice(0, 2).map((n, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${t.accent}`, paddingLeft: 8 }}>
              <div style={{ fontSize: 8.5, color: t.mid, letterSpacing: 1, textTransform: 'uppercase' }}>{n.from}</div>
              <div style={{ fontSize: 10.5, color: t.fg, marginTop: 1, lineHeight: 1.3 }}>{n.text}</div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  function EventDetail({ event, onClose }) {
    if (!event) return null;
    return (
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(12,15,20,0.85)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, fontFamily: t.mono }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: t.panel, border: `1px solid ${event.color}`, borderRadius: 6, padding: 20 }}>
          <div style={{ fontSize: 10, color: t.mid, letterSpacing: 1.5 }}>EVENT · {event.cat.toUpperCase()}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: event.color, marginTop: 8, letterSpacing: -0.4 }}>{event.title}</div>
          <div style={{ marginTop: 14, fontSize: 11, color: t.fg, lineHeight: 1.9, fontVariantNumeric: 'tabular-nums' }}>
            <div><span style={{ color: t.mid }}>WHEN  </span>{event.start} → {event.end}</div>
            <div><span style={{ color: t.mid }}>WHERE </span>{event.loc}</div>
            <div><span style={{ color: t.mid }}>DUR   </span>{U.parseHM(event.end) - U.parseHM(event.start)}m</div>
          </div>
        </div>
      </div>
    );
  }

  function TerminalNOC() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, fontFamily: t.mono, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar now={now} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 10, minHeight: 0 }}>
          {/* row 1: NOW + WEATHER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <TileNow now={now} />
            <TileWeather />
          </div>
          {/* row 2: DAY bar */}
          <DayBar now={now} />
          {/* row 3: SCHEDULE (flex) */}
          <Schedule now={now} onTap={setTapped} />
          {/* row 4: TASKS + MESSAGES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <TileTasks />
            <NotesPanel />
          </div>
        </div>
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return TerminalNOC;
})();

window.V5NOC = V5NOC;

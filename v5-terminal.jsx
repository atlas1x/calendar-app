// V5 — Terminal
// Monospace dashboard like a tmux status / NOC display. Strict grid, no
// flourishes. Events still get saturated category colors, but the rest of
// the chrome is hairlines and bracketed labels. Includes a temperature
// sparkline and ASCII-ish day-graph.

const V5 = (() => {
  const { events, weather, tasks, notes, allDay } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#0a0e0c',
    panel: '#0f1411',
    fg: '#c8e6c9',
    mid: '#7fb88c',
    dim: 'rgba(200,230,201,0.55)',
    faint: 'rgba(200,230,201,0.28)',
    grid: 'rgba(127,184,140,0.16)',
    mono: '"JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace',
  };

  const HOUR_PX = 36;
  const DAY_START = 7 * 60, DAY_END = 22 * 60;
  const mToY = (m) => (m - DAY_START) / 60 * HOUR_PX;

  function StatusBar({ now }) {
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    const date = now.toISOString().slice(0,10);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${t.grid}`, background: t.panel, fontSize: 11, letterSpacing: 1 }}>
        <div style={{ color: t.mid }}>[ wallcal :: tty1 ]</div>
        <div style={{ color: t.fg, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{date}  {h}:{m}:{s}</div>
        <div style={{ color: t.mid, textAlign: 'right' }}>● ONLINE</div>
      </div>
    );
  }

  function Header({ now }) {
    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dnum = String(now.getDate()).padStart(2, '0');
    const dow = String(Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000)).padStart(3, '0');
    return (
      <div style={{ padding: '16px 18px 14px', borderBottom: `1px solid ${t.grid}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: t.fg, letterSpacing: -1, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>
            {day}.{dnum}
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: t.dim, lineHeight: 1.5 }}>
            <div>MONTH={month}</div>
            <div>DAY-OF-YEAR={dow}/365</div>
            <div>TZ=PST · UTC-08</div>
          </div>
        </div>
      </div>
    );
  }

  // 24-cell hour graph showing density of meetings.
  function DayGraph({ now }) {
    const nowMin = U.minsOfDay(now);
    const cells = [];
    for (let h = 0; h < 24; h++) {
      const hStart = h * 60, hEnd = (h + 1) * 60;
      // is any event active in this hour?
      const ev = events.find((e) => {
        const sm = U.parseHM(e.start), em = U.parseHM(e.end);
        return sm < hEnd && em > hStart;
      });
      const isNow = nowMin >= hStart && nowMin < hEnd;
      cells.push({ h, ev, isNow });
    }
    return (
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.grid}` }}>
        <div style={{ fontSize: 9.5, color: t.dim, letterSpacing: 1.5, marginBottom: 8 }}>[ DAY/24h ]</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
          {cells.map((c) => (
            <div key={c.h} style={{
              height: 16,
              background: c.ev ? c.ev.color : 'rgba(127,184,140,0.08)',
              outline: c.isNow ? `1px solid #fff` : 'none',
              outlineOffset: c.isNow ? '1px' : 0,
              opacity: c.h * 60 + 60 < nowMin ? 0.35 : 1,
            }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginTop: 4, fontSize: 8.5, color: t.faint, fontVariantNumeric: 'tabular-nums' }}>
          {['00','03','06','09','12','15','18','21'].map((h) => <div key={h}>{h}</div>)}
        </div>
      </div>
    );
  }

  function Schedule({ now, onTap }) {
    const nowMin = U.minsOfDay(now);
    const hours = [];
    for (let h = 7; h <= 22; h++) hours.push(h);
    return (
      <div style={{ position: 'relative', padding: '10px 18px 10px 50px', borderBottom: `1px solid ${t.grid}`, flex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 6, left: 18, fontSize: 9.5, color: t.dim, letterSpacing: 1.5 }}>[ SCHED ]</div>

        {hours.map((h) => {
          const y = mToY(h * 60) + 14;
          return (
            <React.Fragment key={h}>
              <div style={{ position: 'absolute', left: 50, right: 18, top: y, height: 1, background: t.grid }} />
              <div style={{ position: 'absolute', left: 18, top: y - 5, fontSize: 9.5, color: t.faint, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                {String(h).padStart(2,'0')}:00
              </div>
            </React.Fragment>
          );
        })}

        {events.map((e) => {
          const sm = U.parseHM(e.start), em = U.parseHM(e.end);
          if (em < DAY_START || sm > DAY_END) return null;
          const top = mToY(sm) + 14;
          const height = Math.max(18, mToY(em) - mToY(sm) - 2);
          const past = em < nowMin;
          return (
            <div key={e.id} onClick={() => onTap(e)}
              style={{
                position: 'absolute', left: 50, right: 18, top, height,
                background: `${e.color}1f`,
                borderLeft: `3px solid ${e.color}`,
                padding: '3px 8px',
                color: t.fg,
                cursor: 'pointer',
                opacity: past ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
              <span style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
              <span style={{ fontSize: 9.5, color: t.dim, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginLeft: 6 }}>{e.start}–{e.end}</span>
            </div>
          );
        })}

        {nowMin >= DAY_START && nowMin <= DAY_END && (
          <div style={{ position: 'absolute', left: 18, right: 18, top: mToY(nowMin) + 14, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 32, right: 0, height: 1, background: '#ff5252' }} />
            <div style={{ position: 'absolute', left: 28, top: -3, width: 6, height: 6, background: '#ff5252' }} />
            <div style={{ position: 'absolute', right: 0, top: -12, fontSize: 9, color: '#ff5252', letterSpacing: 0.6, fontWeight: 700 }}>
              ▸ NOW {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
            </div>
          </div>
        )}
      </div>
    );
  }

  function WeatherBlock() {
    // Build a tiny temperature sparkline from the week
    const temps = weather.week.map((d) => d.hi);
    const min = Math.min(...temps), max = Math.max(...temps);
    const points = temps.map((tp, i) => {
      const x = (i / (temps.length - 1)) * 100;
      const y = max === min ? 50 : 100 - ((tp - min) / (max - min)) * 80 - 10;
      return [x, y];
    });
    const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    return (
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 9.5, color: t.dim, letterSpacing: 1.5, marginBottom: 6 }}>[ WX ]</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: t.fg, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6 }}>{weather.now.temp}°</span>
          <span style={{ fontSize: 10, color: t.dim, fontVariantNumeric: 'tabular-nums' }}>FEEL {weather.now.feels}°</span>
        </div>
        <div style={{ fontSize: 9.5, color: t.faint, letterSpacing: 0.5, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
          HI {weather.now.hi}° / LO {weather.now.lo}°
        </div>
        <div style={{ marginTop: 8 }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="40">
            <path d={path} stroke={t.mid} strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
            {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.3" fill={t.fg} />)}
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${temps.length}, 1fr)`, fontSize: 8.5, color: t.faint }}>
            {weather.week.map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>{d.d[0]}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function NextBlock({ now }) {
    const nowMin = U.minsOfDay(now);
    const next = U.nextEvent(events, nowMin);
    return (
      <div style={{ padding: '10px 14px', borderLeft: `1px solid ${t.grid}` }}>
        <div style={{ fontSize: 9.5, color: t.dim, letterSpacing: 1.5, marginBottom: 6 }}>[ NEXT ]</div>
        {next ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: next.color, letterSpacing: -0.2, lineHeight: 1.1 }}>{next.title}</div>
            <div style={{ fontSize: 9.5, color: t.dim, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{next.start} · {next.loc}</div>
            <div style={{ marginTop: 8, fontSize: 18, color: t.fg, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>
              T-{String(Math.floor((U.parseHM(next.start) - nowMin) / 60)).padStart(2,'0')}h{String((U.parseHM(next.start) - nowMin) % 60).padStart(2,'0')}m
            </div>
          </>
        ) : <div style={{ fontSize: 11, color: t.dim }}>~ EOD ~</div>}
      </div>
    );
  }

  function TasksBlock() {
    return (
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${t.grid}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 9.5, color: t.dim, letterSpacing: 1.5 }}>[ TODO ]</span>
          <span style={{ fontSize: 9, color: t.faint, fontVariantNumeric: 'tabular-nums' }}>{tasks.filter((tk)=>!tk.done).length}/{tasks.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} style={{ fontSize: 11, color: task.done ? t.faint : t.fg, display: 'flex', gap: 6 }}>
              <span style={{ color: task.done ? t.faint : t.mid }}>[{task.done ? 'x' : ' '}]</span>
              <span style={{ textDecoration: task.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function NotesBlock() {
    return (
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${t.grid}`, borderLeft: `1px solid ${t.grid}` }}>
        <div style={{ fontSize: 9.5, color: t.dim, letterSpacing: 1.5, marginBottom: 6 }}>[ MSG ]</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notes.slice(0, 2).map((n, i) => (
            <div key={i}>
              <div style={{ fontSize: 8.5, color: t.mid, letterSpacing: 0.6 }}>&gt; {n.from.toUpperCase()}</div>
              <div style={{ fontSize: 10.5, color: t.fg, marginTop: 1, lineHeight: 1.3 }}>{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function EventDetail({ event, onClose }) {
    if (!event) return null;
    return (
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,14,12,0.88)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: t.mono }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', border: `1px solid ${event.color}`, background: t.panel, padding: 18 }}>
          <div style={{ fontSize: 10, color: t.dim, letterSpacing: 1.5 }}>[ EVENT :: {event.cat.toUpperCase()} ]</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: event.color, marginTop: 10, letterSpacing: -0.3 }}>{event.title}</div>
          <div style={{ fontSize: 11, color: t.fg, marginTop: 12, fontVariantNumeric: 'tabular-nums', lineHeight: 1.8 }}>
            <div>WHEN  {event.start} → {event.end}</div>
            <div>WHERE {event.loc}</div>
            <div>DUR   {U.parseHM(event.end) - U.parseHM(event.start)}m</div>
          </div>
        </div>
      </div>
    );
  }

  function Terminal() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, fontFamily: t.mono, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <StatusBar now={now} />
        <Header now={now} />
        <DayGraph now={now} />
        <Schedule now={now} onTap={setTapped} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <WeatherBlock />
          <NextBlock now={now} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr' }}>
          <TasksBlock />
          <NotesBlock />
        </div>
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return Terminal;
})();

window.V5Terminal = V5;

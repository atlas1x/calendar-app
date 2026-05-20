// Hybrid — A1 layout (sans-serif display, sidebar, saturated event blocks)
// fused with B1 chrome (monospace data, status bar, 24h day graph,
// [LABEL] section headers, T-minus countdown, sparkline).
//
// Inter for display surfaces (clock, event titles, dates).
// JetBrains Mono for data surfaces (system bar, hour ticks, labels, T-).

const VHybrid = (() => {
  const { allDay, tasks, notes, weather } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#0c1015',
    panel: '#11161d',
    panel2: '#0e131a',
    rule: 'rgba(255,255,255,0.06)',
    grid: 'rgba(255,255,255,0.04)',
    fg: '#eaeef5',
    mid: '#8a98ac',
    dim: 'rgba(234,238,245,0.55)',
    faint: 'rgba(234,238,245,0.28)',
    accent: '#6cc7c0', // teal — the "system" color for monospace chrome
    ok: '#7dd181',
    warn: '#e6b450',
    nowLine: '#ff6b6b',
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    mono: '"JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace',
  };

  // ─── Status bar (B1) ─────────────────────────────
  function StatusBar({ now }) {
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    const iso = now.toISOString().slice(0,10);
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', padding: '7px 16px',
        borderBottom: `1px solid ${t.rule}`, background: t.panel2,
        fontFamily: t.mono, fontSize: 10.5, letterSpacing: 1.2,
      }}>
        <div style={{ color: t.mid }}>
          <span style={{ color: t.ok }}>●</span> calendar.live
        </div>
        <div style={{ color: t.fg, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{iso}  {h}:{m}:{s}</div>
        <div style={{ color: t.mid, textAlign: 'right' }}>SYNC 0:14s</div>
      </div>
    );
  }

  // ─── Hero clock (A1, slightly tightened) ─────────
  function ClockHeader({ now }) {
    const h = now.getHours() % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ap = now.getHours() >= 12 ? 'PM' : 'AM';
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dnum = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const dow = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);
    return (
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: t.sans, fontSize: 76, fontWeight: 200, color: t.fg, letterSpacing: -2.5, lineHeight: 0.92, fontVariantNumeric: 'tabular-nums' }}>
            {h}:{mm}
            <span style={{ fontSize: 22, fontWeight: 400, color: t.dim, marginLeft: 8, letterSpacing: 0 }}>{ap}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: t.sans, fontSize: 18, fontWeight: 600, color: t.fg, letterSpacing: -0.3, lineHeight: 1 }}>{dayName}</div>
            <div style={{ fontFamily: t.sans, fontSize: 13, color: t.dim, marginTop: 4, lineHeight: 1 }}>{month} {dnum}</div>
            <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, marginTop: 6, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>DOY {String(dow).padStart(3,'0')} · WK20</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 24h day-density bar (B1) ────────────────────
  function DayGraph({ now, events }) {
    const nowMin = U.minsOfDay(now);
    return (
      <div style={{ padding: '10px 24px 12px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: t.mono, fontSize: 9, color: t.mid, letterSpacing: 1.6, fontWeight: 600 }}>[ DAY · 24H ]</span>
          <span style={{ fontFamily: t.mono, fontSize: 9, color: t.faint, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>{events.length} EVENTS</span>
        </div>
        <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
          {events.map((e) => {
            const sm = U.parseHM(e.start), em = U.parseHM(e.end);
            return (
              <div key={e.id} style={{
                position: 'absolute',
                left: `${(sm / 1440) * 100}%`,
                width: `${((em - sm) / 1440) * 100}%`,
                top: 0, bottom: 0,
                background: e.color,
                opacity: em < nowMin ? 0.34 : 1,
                borderRadius: 1.5,
              }} />
            );
          })}
          <div style={{ position: 'absolute', left: `${(nowMin / 1440) * 100}%`, top: -3, bottom: -3, width: 2, background: t.nowLine, boxShadow: `0 0 6px ${t.nowLine}` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: t.mono, fontSize: 8.5, color: t.faint, marginTop: 4, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums' }}>
          <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span>
        </div>
      </div>
    );
  }

  // ─── All-day strip (A1) ──────────────────────────
  function AllDayStrip() {
    if (!allDay.length) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 24px', borderBottom: `1px solid ${t.rule}`, background: t.panel2 }}>
        <span style={{ fontFamily: t.mono, fontSize: 9, color: t.mid, letterSpacing: 1.6 }}>[ ALL-DAY ]</span>
        {allDay.map((a) => (
          <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 10, background: `${a.color}22`, color: a.color, fontFamily: t.sans, fontSize: 11, fontWeight: 600 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: a.color }} />
            {a.title}
          </span>
        ))}
      </div>
    );
  }

  // ─── Timeline (A1: saturated blocks + B1: monospace times) ─
  const HOUR_PX = 42;
  const DAY_START = 7 * 60, DAY_END = 22 * 60;
  const mToY = (m) => (m - DAY_START) / 60 * HOUR_PX;

  function Timeline({ now, onTap, events }) {
    const nowMin = U.minsOfDay(now);
    const hours = []; for (let h = 7; h <= 22; h++) hours.push(h);
    const cur = U.currentEvent(events, nowMin);
    return (
      <div style={{ position: 'relative', padding: '12px 8px 12px 48px', overflow: 'hidden' }}>
        {hours.map((h) => {
          const y = mToY(h * 60);
          const major = h % 3 === 0;
          return (
            <React.Fragment key={h}>
              <div style={{ position: 'absolute', left: 48, right: 8, top: y, height: 1, background: major ? t.rule : t.grid }} />
              <div style={{ position: 'absolute', left: 6, top: y - 6, fontFamily: t.mono, fontSize: 9.5, color: major ? t.dim : t.faint, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums', fontWeight: major ? 600 : 400 }}>
                {U.fmt12Short(h * 60).toUpperCase()}
              </div>
            </React.Fragment>
          );
        })}

        {events.map((e) => {
          const sm = U.parseHM(e.start), em = U.parseHM(e.end);
          if (em < DAY_START || sm > DAY_END) return null;
          const top = mToY(sm);
          const height = Math.max(22, mToY(em) - top - 3);
          const isCurrent = cur && cur.id === e.id;
          const past = em < nowMin;
          const dur = em - sm;
          return (
            <div key={e.id} onClick={() => onTap(e)}
              style={{
                position: 'absolute', left: 48, right: 8, top, height,
                background: e.color, color: '#0c0e12',
                borderRadius: 6, padding: '6px 9px',
                fontFamily: t.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: -0.15,
                cursor: 'pointer', overflow: 'hidden',
                boxShadow: isCurrent ? `0 0 0 2px ${e.color}, 0 0 24px ${e.color}80` : 'none',
                opacity: past ? 0.42 : 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                <div style={{ fontFamily: t.mono, fontSize: 9.5, fontWeight: 500, opacity: 0.7, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', letterSpacing: 0.3 }}>
                  {U.fmt12Short(sm).toUpperCase()}
                </div>
              </div>
              {dur >= 45 && (
                <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.65, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.loc}</div>
              )}
            </div>
          );
        })}

        {nowMin >= DAY_START && nowMin <= DAY_END && (
          <div style={{ position: 'absolute', left: 6, right: 8, top: mToY(nowMin), pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 36, right: 0, height: 2, background: t.nowLine, boxShadow: `0 0 10px ${t.nowLine}` }} />
            <div style={{ position: 'absolute', left: 30, top: -4, width: 10, height: 10, borderRadius: 5, background: t.nowLine, boxShadow: `0 0 10px ${t.nowLine}` }} />
            <div style={{ position: 'absolute', right: 0, top: -12, fontFamily: t.mono, fontSize: 9, color: t.nowLine, letterSpacing: 0.6, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              ◀ {U.fmt12Short(nowMin).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Side panel: stacked tiles with [LABEL] headers ──
  function TileHeader({ label, right }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: t.mono, fontSize: 9, color: t.mid, letterSpacing: 1.6, fontWeight: 600 }}>[ {label} ]</span>
        {right && <span style={{ fontFamily: t.mono, fontSize: 9, color: t.faint, letterSpacing: 0.8, fontVariantNumeric: 'tabular-nums' }}>{right}</span>}
      </div>
    );
  }

  function SidePanel({ now, events }) {
    const nowMin = U.minsOfDay(now);
    const cur = U.currentEvent(events, nowMin);
    const next = U.nextEvent(events, nowMin);

    // Sparkline data
    const temps = weather.week.map((d) => d.hi);
    const mn = Math.min(...temps), mx = Math.max(...temps);
    const points = temps.map((tp, i) => {
      const x = (i / (temps.length - 1)) * 100;
      const y = mx === mn ? 50 : 100 - ((tp - mn) / (mx - mn)) * 70 - 15;
      return [x, y];
    });
    const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');

    const undone = tasks.filter((tk) => !tk.done);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: t.rule, borderLeft: `1px solid ${t.rule}` }}>
        {/* Up Next / T-minus */}
        <div style={{ padding: '12px 14px', background: t.bg }}>
          <TileHeader label={cur ? 'LIVE' : 'NEXT'} right={cur ? `${U.parseHM(cur.end) - nowMin}m LEFT` : (next ? U.countdownLabel(U.parseHM(next.start) - nowMin).toUpperCase() : '—')} />
          {cur ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: cur.color, boxShadow: `0 0 8px ${cur.color}`, flexShrink: 0 }} />
                <span style={{ fontFamily: t.sans, fontSize: 14, fontWeight: 600, color: t.fg, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.title}</span>
              </div>
              <div style={{ fontFamily: t.mono, fontSize: 10, color: t.dim, marginTop: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3 }}>{U.fmt12Short(U.parseHM(cur.start)).toUpperCase()}–{U.fmt12Short(U.parseHM(cur.end)).toUpperCase()}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: t.dim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.loc}</div>
              {next && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${t.rule}` }}>
                  <div style={{ fontFamily: t.mono, fontSize: 8.5, color: t.faint, letterSpacing: 1.4 }}>UP NEXT</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ width: 4, height: 12, borderRadius: 2, background: next.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: t.sans, fontSize: 11.5, color: t.fg, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</span>
                  </div>
                </div>
              )}
            </>
          ) : next ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: next.color, flexShrink: 0 }} />
                <span style={{ fontFamily: t.sans, fontSize: 14, fontWeight: 600, color: t.fg, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</span>
              </div>
              <div style={{ fontFamily: t.mono, fontSize: 18, color: next.color, fontWeight: 700, letterSpacing: -0.4, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                T-{String(Math.floor((U.parseHM(next.start) - nowMin) / 60)).padStart(2,'0')}h{String((U.parseHM(next.start) - nowMin) % 60).padStart(2,'0')}m
              </div>
              <div style={{ fontFamily: t.mono, fontSize: 10, color: t.dim, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>@ {U.fmt12Short(U.parseHM(next.start)).toUpperCase()}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: t.dim, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.loc}</div>
            </>
          ) : (
            <div style={{ fontFamily: t.sans, fontSize: 12, color: t.dim }}>~ end of day ~</div>
          )}
        </div>

        {/* Weather */}
        <div style={{ padding: '12px 14px', background: t.bg }}>
          <TileHeader label="WX" right="SF" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <window.WeatherGlyph kind={weather.now.icon} size={20} color={t.fg} />
            <span style={{ fontFamily: t.sans, fontSize: 26, fontWeight: 300, color: t.fg, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</span>
            <span style={{ fontFamily: t.mono, fontSize: 9.5, color: t.dim, fontVariantNumeric: 'tabular-nums', marginLeft: 2 }}>↑{weather.now.hi} ↓{weather.now.lo}</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="32">
              <path d={`${path} L100,100 L0,100 Z`} fill={`${t.accent}1f`} />
              <path d={path} stroke={t.accent} strokeWidth="1.3" fill="none" vectorEffect="non-scaling-stroke" />
              {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.3" fill={t.accent} />)}
            </svg>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${temps.length}, 1fr)`, fontFamily: t.mono, fontSize: 8.5, color: t.faint, letterSpacing: 0.5, marginTop: 1 }}>
              {weather.week.map((d, i) => <div key={i} style={{ textAlign: 'center' }}>{d.d[0]}</div>)}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div style={{ padding: '12px 14px', background: t.bg }}>
          <TileHeader label="TASKS" right={`${undone.length}/${tasks.length}`} />
          <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
            {tasks.map((tk) => (
              <div key={tk.id} style={{ flex: 1, height: 3, background: tk.done ? t.ok : 'rgba(255,255,255,0.08)', borderRadius: 1 }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {undone.slice(0, 4).map((task) => (
              <div key={task.id} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ fontFamily: t.mono, fontSize: 10.5, color: task.due === 'today' ? t.warn : t.mid, flexShrink: 0 }}>[ ]</span>
                <span style={{ fontFamily: t.sans, fontSize: 11.5, color: t.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: '12px 14px', background: t.bg, flex: 1 }}>
          <TileHeader label="MSG" right={`${notes.length}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notes.slice(0, 3).map((n, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${t.accent}`, paddingLeft: 7 }}>
                <div style={{ fontFamily: t.mono, fontSize: 8.5, color: t.mid, letterSpacing: 1, textTransform: 'uppercase' }}>{n.from}</div>
                <div style={{ fontFamily: t.sans, fontSize: 11, color: t.fg, marginTop: 1, lineHeight: 1.32 }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Event detail overlay ────────────────────────
  function EventDetail({ event, onClose }) {
    if (!event) return null;
    const sm = U.parseHM(event.start), em = U.parseHM(event.end);
    return (
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: t.panel, borderRadius: 8, padding: 22, border: `1px solid ${event.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: t.mono, fontSize: 10, color: event.color, letterSpacing: 1.6, fontWeight: 600 }}>[ {event.cat.toUpperCase()} ]</span>
            <span style={{ fontFamily: t.mono, fontSize: 10, color: t.faint, fontVariantNumeric: 'tabular-nums' }}>{U.fmt12Short(sm).toUpperCase()}–{U.fmt12Short(em).toUpperCase()}</span>
          </div>
          <div style={{ fontFamily: t.sans, fontSize: 22, fontWeight: 700, color: t.fg, letterSpacing: -0.5, marginTop: 10, lineHeight: 1.1 }}>{event.title}</div>
          <div style={{ marginTop: 14, fontFamily: t.mono, fontSize: 11, color: t.dim, lineHeight: 1.9 }}>
            <div><span style={{ color: t.mid }}>WHEN  </span>{U.fmt12(sm)} – {U.fmt12(em)}</div>
            <div><span style={{ color: t.mid }}>WHERE </span>{event.loc}</div>
            <div><span style={{ color: t.mid }}>DUR   </span>{em - sm}m</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Compose ─────────────────────────────────────
  function Hybrid() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const events = window.useCalEvents();
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <StatusBar now={now} />
        <ClockHeader now={now} />
        <DayGraph now={now} events={events} />
        <AllDayStrip />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 200px', minHeight: 0 }}>
          <Timeline now={now} onTap={setTapped} events={events} />
          <SidePanel now={now} events={events} />
        </div>
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return Hybrid;
})();

window.VHybrid = VHybrid;

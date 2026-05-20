// V1 — Classic Agenda
// Big clock + date at top. Hour-by-hour timeline as the main column with
// color-blocked events. Right-side compact panel: weather + tasks + notes.
// Now-line glows; tapping an event reveals a detail overlay.

const V1 = (() => {
  const { events, allDay, tasks, notes, weather } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  // ── theme ──────────────────────────────────────────────
  const t = {
    bg: '#0e1014',
    panel: '#161a21',
    rule: 'rgba(255,255,255,0.06)',
    fg: '#e9edf3',
    dim: 'rgba(233,237,243,0.55)',
    faint: 'rgba(233,237,243,0.32)',
    accent: '#5b8df7',
    font: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  };

  // Timeline spans 7am → 10pm = 15h. Each hour = 56px.
  const HOUR_PX = 56;
  const DAY_START = 7 * 60;
  const DAY_END = 22 * 60;
  const mToY = (m) => (m - DAY_START) / 60 * HOUR_PX;

  function ClockHeader({ now }) {
    const h = now.getHours() % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, '0');
    const ap = now.getHours() >= 12 ? 'PM' : 'AM';
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return (
      <div style={{ padding: '24px 28px 18px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 72, fontWeight: 200, letterSpacing: -2, lineHeight: 0.95, color: t.fg, fontVariantNumeric: 'tabular-nums' }}>
            {h}:{m}
            <span style={{ fontSize: 22, fontWeight: 400, color: t.dim, marginLeft: 8, letterSpacing: 0 }}>{ap}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: t.fg, letterSpacing: -0.3 }}>{dayName}</div>
            <div style={{ fontSize: 13, color: t.dim, marginTop: 2 }}>{dateStr}</div>
          </div>
        </div>
      </div>
    );
  }

  function Timeline({ now, onEventTap }) {
    const nowMin = U.minsOfDay(now);
    const hours = [];
    for (let h = 7; h <= 22; h++) hours.push(h);
    const cur = U.currentEvent(events, nowMin);
    return (
      <div style={{ position: 'relative', padding: '12px 18px 12px 60px', flex: 1, overflow: 'hidden' }}>
        {/* hour rules */}
        {hours.map((h) => {
          const y = mToY(h * 60);
          return (
            <React.Fragment key={h}>
              <div style={{ position: 'absolute', left: 60, right: 18, top: y, height: 1, background: t.rule }} />
              <div style={{ position: 'absolute', left: 18, top: y - 7, fontSize: 10.5, color: t.faint, fontFamily: t.mono, letterSpacing: 0.5 }}>
                {h % 12 || 12}{h < 12 ? 'a' : 'p'}
              </div>
            </React.Fragment>
          );
        })}

        {/* event blocks */}
        {events.map((e) => {
          const sm = U.parseHM(e.start), em = U.parseHM(e.end);
          if (em < DAY_START || sm > DAY_END) return null;
          const top = mToY(sm);
          const height = mToY(em) - top - 3;
          const isCurrent = cur && cur.id === e.id;
          const dur = em - sm;
          return (
            <div key={e.id}
              onClick={() => onEventTap(e)}
              style={{
                position: 'absolute', left: 60, right: 18, top, height,
                background: e.color, color: '#0c0e12',
                borderRadius: 6, padding: '7px 10px',
                fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
                cursor: 'pointer', overflow: 'hidden',
                boxShadow: isCurrent ? `0 0 0 2px ${e.color}, 0 0 24px ${e.color}99` : 'none',
                opacity: em < nowMin ? 0.42 : 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.7, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {U.fmt12Short(sm)}
                </div>
              </div>
              {dur >= 45 && (
                <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.65, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.loc}
                </div>
              )}
            </div>
          );
        })}

        {/* now line */}
        {nowMin >= DAY_START && nowMin <= DAY_END && (
          <div style={{ position: 'absolute', left: 18, right: 18, top: mToY(nowMin), pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 36, right: 0, height: 2, background: '#ff6b6b', boxShadow: '0 0 10px #ff6b6b' }} />
            <div style={{ position: 'absolute', left: 30, top: -4, width: 10, height: 10, borderRadius: 5, background: '#ff6b6b', boxShadow: '0 0 10px #ff6b6b' }} />
            <div style={{ position: 'absolute', right: 0, top: -16, fontSize: 9.5, color: '#ff6b6b', fontFamily: t.mono, letterSpacing: 0.4, fontWeight: 600 }}>
              {U.fmt12(nowMin).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    );
  }

  function SidePanel({ next, countdownMin }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: t.rule }}>
        {/* countdown to next */}
        <div style={{ padding: '14px 20px', background: t.bg }}>
          <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>Up next</div>
          {next ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: next.color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: t.fg, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 300, color: t.fg, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{U.countdownLabel(countdownMin)}</span>
              </div>
              <div style={{ fontSize: 11, color: t.dim, marginTop: 2 }}>{U.fmt12(U.parseHM(next.start))} · {next.loc}</div>
            </>
          ) : <div style={{ fontSize: 14, color: t.dim, marginTop: 8 }}>Nothing left today.</div>}
        </div>

        {/* weather */}
        <div style={{ padding: '14px 20px', background: t.bg }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <window.WeatherGlyph kind={weather.now.icon} size={36} color={t.fg} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 300, color: t.fg, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</span>
                <span style={{ fontSize: 11, color: t.dim, fontVariantNumeric: 'tabular-nums' }}>↑{weather.now.hi} ↓{weather.now.lo}</span>
              </div>
              <div style={{ fontSize: 10.5, color: t.faint, fontFamily: t.mono, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 1 }}>San Francisco</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 12 }}>
            {weather.week.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 9, color: t.faint, fontFamily: t.mono, letterSpacing: 0.5 }}>{d.d.toUpperCase()}</span>
                <window.WeatherGlyph kind={d.icon} size={16} color={t.dim} />
                <span style={{ fontSize: 10, color: t.fg, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{d.hi}</span>
                <span style={{ fontSize: 9, color: t.faint, fontVariantNumeric: 'tabular-nums' }}>{d.lo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* tasks */}
        <div style={{ padding: '14px 20px', background: t.bg }}>
          <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Tasks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.map((task) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, border: `1.5px solid ${task.done ? t.faint : t.dim}`, background: task.done ? t.faint : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {task.done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5" stroke={t.bg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: 12, color: task.done ? t.faint : t.fg, textDecoration: task.done ? 'line-through' : 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* notes */}
        <div style={{ padding: '14px 20px', background: t.bg, flex: 1 }}>
          <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Notes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notes.map((n, i) => (
              <div key={i}>
                <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>{n.from}</div>
                <div style={{ fontSize: 11.5, color: t.fg, marginTop: 1, lineHeight: 1.35 }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function EventDetail({ event, onClose }) {
    if (!event) return null;
    const sm = U.parseHM(event.start), em = U.parseHM(event.end);
    return (
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: t.panel, borderRadius: 12, padding: 22, border: `1px solid ${t.rule}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: event.color, marginTop: 4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: t.faint, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>{event.cat}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: t.fg, letterSpacing: -0.4, marginTop: 4 }}>{event.title}</div>
              <div style={{ fontSize: 14, color: t.dim, marginTop: 8 }}>{U.fmt12(sm)} – {U.fmt12(em)} · {em - sm} min</div>
              <div style={{ fontSize: 14, color: t.dim, marginTop: 4 }}>{event.loc}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ClassicAgenda() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const nowMin = U.minsOfDay(now);
    const next = U.nextEvent(events, nowMin);
    const countdownMin = next ? U.parseHM(next.start) - nowMin : 0;
    const [tapped, setTapped] = React.useState(null);

    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, fontFamily: t.font, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <ClockHeader now={now} />
        {/* all-day strip */}
        {allDay.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 28px', borderBottom: `1px solid ${t.rule}`, background: '#11141a' }}>
            <span style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>All day</span>
            {allDay.map((a) => (
              <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 10, background: `${a.color}22`, color: a.color, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: a.color }} />
                {a.title}
              </span>
            ))}
          </div>
        )}
        {/* main: timeline | sidepanel */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 200px', minHeight: 0 }}>
          <Timeline now={now} onEventTap={setTapped} />
          <SidePanel next={next} countdownMin={countdownMin} />
        </div>
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return ClassicAgenda;
})();

window.V1ClassicAgenda = V1;

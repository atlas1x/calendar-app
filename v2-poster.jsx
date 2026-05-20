// V2 — Now & Next
// Poster-style. Massive "what's happening right now" hero panel that takes
// the top half, tinted by the current event's color. Big countdown to the
// next event. Below: compact horizontal rail of remaining events + a small
// weather/tasks strip.

const V2 = (() => {
  const { events, tasks, weather, allDay } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#08090b',
    fg: '#f6f7f9',
    dim: 'rgba(246,247,249,0.55)',
    faint: 'rgba(246,247,249,0.28)',
    rule: 'rgba(255,255,255,0.07)',
    font: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    display: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  };

  // mix-darken a hex toward black by amount (0..1)
  const tint = (hex, alpha) => {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  function Hero({ now }) {
    const nowMin = U.minsOfDay(now);
    const cur = U.currentEvent(events, nowMin);
    const next = U.nextEvent(events, nowMin);
    const ap = now.getHours() >= 12 ? 'PM' : 'AM';
    const h12 = now.getHours() % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2,'0');

    if (cur) {
      const sm = U.parseHM(cur.start), em = U.parseHM(cur.end);
      const pct = Math.min(100, Math.max(0, (nowMin - sm) / (em - sm) * 100));
      const minsLeft = em - nowMin;
      return (
        <div style={{ position: 'relative', padding: '28px 30px 24px', background: `linear-gradient(165deg, ${tint(cur.color, 0.32)} 0%, ${tint(cur.color, 0.06)} 100%)`, borderBottom: `1px solid ${t.rule}` }}>
          {/* status row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: cur.color, boxShadow: `0 0 12px ${cur.color}` }} />
              <span style={{ fontSize: 10.5, color: cur.color, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>HAPPENING NOW</span>
            </div>
            <div style={{ fontSize: 12, color: t.fg, fontVariantNumeric: 'tabular-nums', fontFamily: t.mono, letterSpacing: 0.6 }}>
              {h12}:{mm} <span style={{ color: t.dim }}>{ap}</span>
            </div>
          </div>

          <div style={{ marginTop: 32, fontSize: 44, fontWeight: 700, color: t.fg, letterSpacing: -1.6, lineHeight: 0.95, textWrap: 'balance' }}>
            {cur.title}
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: t.dim, letterSpacing: -0.1 }}>{cur.loc}</div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: t.dim, fontVariantNumeric: 'tabular-nums', fontFamily: t.mono }}>
              {U.fmt12(sm)} — {U.fmt12(em)}
            </div>
            <div style={{ fontSize: 13, color: cur.color, fontFamily: t.mono, fontWeight: 600 }}>
              {minsLeft} min left
            </div>
          </div>
          {/* progress bar */}
          <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: cur.color, boxShadow: `0 0 8px ${cur.color}` }} />
          </div>

          {next && (
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px dashed ${t.rule}` }}>
              <div style={{ fontSize: 10.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5 }}>UP NEXT · {U.countdownLabel(U.parseHM(next.start) - nowMin).toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <span style={{ width: 6, height: 22, borderRadius: 3, background: next.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: t.fg, letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</div>
                  <div style={{ fontSize: 11, color: t.dim, fontFamily: t.mono }}>{U.fmt12(U.parseHM(next.start))} · {next.loc}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // gap state — nothing right now, count down to next
    return (
      <div style={{ padding: '28px 30px 28px', borderBottom: `1px solid ${t.rule}`, background: 'linear-gradient(165deg, #14171c 0%, #08090b 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10.5, color: t.faint, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>FREE TIME</div>
          <div style={{ fontSize: 12, color: t.fg, fontVariantNumeric: 'tabular-nums', fontFamily: t.mono }}>{h12}:{mm} <span style={{ color: t.dim }}>{ap}</span></div>
        </div>
        {next ? (
          <>
            <div style={{ marginTop: 28, fontSize: 13, color: t.dim, fontFamily: t.mono, letterSpacing: 1, textTransform: 'uppercase' }}>Next up</div>
            <div style={{ marginTop: 8, fontSize: 40, fontWeight: 700, color: t.fg, letterSpacing: -1.4, lineHeight: 1 }}>{next.title}</div>
            <div style={{ marginTop: 8, fontSize: 14, color: t.dim }}>{next.loc}</div>
            <div style={{ marginTop: 28, fontSize: 64, fontWeight: 200, color: next.color, letterSpacing: -2, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {U.countdownLabel(U.parseHM(next.start) - nowMin)}
            </div>
            <div style={{ fontSize: 13, color: t.dim, fontFamily: t.mono, marginTop: 4 }}>at {U.fmt12(U.parseHM(next.start))}</div>
          </>
        ) : (
          <div style={{ marginTop: 60, textAlign: 'center', color: t.dim, fontSize: 18 }}>That's a wrap on today.</div>
        )}
      </div>
    );
  }

  function Rail({ now, onTap }) {
    const nowMin = U.minsOfDay(now);
    const upcoming = events.filter((e) => U.parseHM(e.end) > nowMin && !(U.currentEvent(events, nowMin) && U.currentEvent(events, nowMin).id === e.id));
    return (
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5, padding: '0 14px 10px' }}>REST OF TODAY</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 14px 6px', scrollbarWidth: 'none' }}>
          {upcoming.map((e) => (
            <div key={e.id} onClick={() => onTap(e)}
              style={{ flex: '0 0 auto', minWidth: 130, padding: '10px 12px', borderRadius: 8, background: tint(e.color, 0.12), border: `1px solid ${tint(e.color, 0.25)}`, cursor: 'pointer' }}>
              <div style={{ fontSize: 10.5, color: e.color, fontFamily: t.mono, letterSpacing: 0.6, fontWeight: 600 }}>{U.fmt12Short(U.parseHM(e.start)).toUpperCase()}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.fg, marginTop: 4, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
              <div style={{ fontSize: 10, color: t.dim, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.loc}</div>
            </div>
          ))}
          {upcoming.length === 0 && <div style={{ fontSize: 13, color: t.dim, padding: '6px 0' }}>Clear.</div>}
        </div>
      </div>
    );
  }

  function Footer() {
    const undone = tasks.filter((t) => !t.done);
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: t.rule }}>
        <div style={{ padding: '18px 22px', background: t.bg, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5 }}>WEATHER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <window.WeatherGlyph kind={weather.now.icon} size={44} color={t.fg} />
            <div>
              <div style={{ fontSize: 30, fontWeight: 200, color: t.fg, letterSpacing: -1, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</div>
              <div style={{ fontSize: 10.5, color: t.dim, fontFamily: t.mono, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>↑{weather.now.hi}° ↓{weather.now.lo}°</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
            {weather.week.slice(1,6).map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 8.5, color: t.faint, fontFamily: t.mono, letterSpacing: 0.5 }}>{d.d.toUpperCase()}</div>
                <window.WeatherGlyph kind={d.icon} size={14} color={t.dim} />
                <div style={{ fontSize: 10, color: t.fg, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{d.hi}°</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '18px 22px', background: t.bg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5 }}>TODO</div>
            <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{undone.length} OPEN</div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {undone.slice(0, 4).map((task) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, border: `1.5px solid ${t.faint}`, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: t.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.text}</span>
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
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: tint(event.color, 0.18), border: `1px solid ${tint(event.color, 0.4)}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, color: event.color, fontFamily: t.mono, letterSpacing: 1.5, fontWeight: 600 }}>{event.cat.toUpperCase()}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: t.fg, marginTop: 6, letterSpacing: -0.6 }}>{event.title}</div>
          <div style={{ fontSize: 14, color: t.dim, marginTop: 10 }}>{U.fmt12(sm)} – {U.fmt12(em)} · {em - sm} min</div>
          <div style={{ fontSize: 14, color: t.dim, marginTop: 2 }}>{event.loc}</div>
        </div>
      </div>
    );
  }

  function NowNext() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, fontFamily: t.font, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Hero now={now} />
        <Rail now={now} onTap={setTapped} />
        <Footer />
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return NowNext;
})();

window.V2NowNext = V2;

// V1.2 — Classic / Calm
// Single column. Massive clock, a hero "Now / Next" card directly under it,
// then the hour timeline takes the full width. Minimal weather ribbon at the
// foot. No side panel — quieter, glanceable from across a room.

const V1Calm = (() => {
  const { events, weather } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#0d1015',
    rule: 'rgba(255,255,255,0.06)',
    fg: '#eef1f6',
    dim: 'rgba(238,241,246,0.55)',
    faint: 'rgba(238,241,246,0.30)',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  };

  const HOUR_PX = 44;
  const DAY_START = 7 * 60, DAY_END = 22 * 60;
  const mToY = (m) => (m - DAY_START) / 60 * HOUR_PX;

  const tint = (hex, a) => {
    const h = hex.replace('#',''); const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  function ClockBlock({ now }) {
    const h = now.getHours() % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ap = now.getHours() >= 12 ? 'PM' : 'AM';
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return (
      <div style={{ padding: '34px 32px 22px', textAlign: 'center', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ fontSize: 11, color: t.faint, fontFamily: t.mono, letterSpacing: 3, textTransform: 'uppercase' }}>{dayName} · {dateStr}</div>
        <div style={{ fontSize: 124, fontWeight: 200, color: t.fg, letterSpacing: -5, lineHeight: 0.9, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
          {h}:{mm}
          <span style={{ fontSize: 26, color: t.dim, marginLeft: 10, letterSpacing: 0, verticalAlign: '0.8em' }}>{ap}</span>
        </div>
      </div>
    );
  }

  function NowNextCard({ now }) {
    const nowMin = U.minsOfDay(now);
    const cur = U.currentEvent(events, nowMin);
    const next = U.nextEvent(events, nowMin);

    if (cur) {
      const sm = U.parseHM(cur.start), em = U.parseHM(cur.end);
      const pct = Math.min(100, Math.max(0, (nowMin - sm) / (em - sm) * 100));
      const minsLeft = em - nowMin;
      return (
        <div style={{ padding: '20px 32px', borderBottom: `1px solid ${t.rule}`, background: `linear-gradient(180deg, ${tint(cur.color, 0.20)} 0%, ${tint(cur.color, 0.03)} 100%)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: cur.color, boxShadow: `0 0 10px ${cur.color}` }} />
            <span style={{ fontSize: 10.5, color: cur.color, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>NOW</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{minsLeft}m LEFT</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 28, fontWeight: 600, color: t.fg, letterSpacing: -0.7, lineHeight: 1.05 }}>{cur.title}</div>
          <div style={{ fontSize: 13, color: t.dim, marginTop: 4 }}>{cur.loc} · {U.fmt12(sm)} – {U.fmt12(em)}</div>
          <div style={{ marginTop: 12, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: cur.color }} />
          </div>
          {next && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 1.6 }}>NEXT</span>
              <span style={{ width: 4, height: 14, background: next.color, borderRadius: 2 }} />
              <span style={{ fontSize: 13, color: t.fg, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</span>
              <span style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{U.countdownLabel(U.parseHM(next.start) - nowMin)}</span>
            </div>
          )}
        </div>
      );
    }
    if (next) {
      const cm = U.parseHM(next.start) - nowMin;
      return (
        <div style={{ padding: '20px 32px', borderBottom: `1px solid ${t.rule}` }}>
          <div style={{ fontSize: 10.5, color: t.faint, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>NEXT UP · {U.countdownLabel(cm).toUpperCase()}</div>
          <div style={{ marginTop: 6, fontSize: 28, fontWeight: 600, color: t.fg, letterSpacing: -0.7, lineHeight: 1.05 }}>{next.title}</div>
          <div style={{ fontSize: 13, color: t.dim, marginTop: 4 }}>{U.fmt12(U.parseHM(next.start))} · {next.loc}</div>
        </div>
      );
    }
    return <div style={{ padding: '20px 32px', borderBottom: `1px solid ${t.rule}`, fontSize: 14, color: t.dim }}>That's a wrap on today.</div>;
  }

  function Timeline({ now, onTap }) {
    const nowMin = U.minsOfDay(now);
    const hours = []; for (let h = 7; h <= 22; h++) hours.push(h);
    const cur = U.currentEvent(events, nowMin);
    return (
      <div style={{ position: 'relative', padding: '14px 24px 14px 60px', flex: 1, overflow: 'hidden' }}>
        {hours.map((h) => {
          const y = mToY(h * 60);
          const major = h % 3 === 0;
          return (
            <React.Fragment key={h}>
              <div style={{ position: 'absolute', left: 60, right: 24, top: y, height: 1, background: major ? t.rule : 'transparent' }} />
              {major && <div style={{ position: 'absolute', left: 20, top: y - 6, fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 0.6 }}>
                {h % 12 || 12}{h < 12 ? 'a' : 'p'}
              </div>}
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
          return (
            <div key={e.id} onClick={() => onTap(e)}
              style={{
                position: 'absolute', left: 60, right: 24, top, height,
                background: e.color, color: '#0c0e12',
                borderRadius: 7, padding: '7px 11px',
                fontSize: 13, fontWeight: 600, letterSpacing: -0.2,
                cursor: 'pointer', overflow: 'hidden',
                boxShadow: isCurrent ? `0 0 0 2px ${e.color}, 0 6px 24px ${e.color}66` : 'none',
                opacity: past ? 0.38 : 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.7, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {U.fmt12Short(sm)}
                </div>
              </div>
              {(em - sm) >= 45 && (
                <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.6, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.loc}</div>
              )}
            </div>
          );
        })}

        {nowMin >= DAY_START && nowMin <= DAY_END && (
          <div style={{ position: 'absolute', left: 20, right: 24, top: mToY(nowMin), pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 38, right: 0, height: 2, background: '#ff6b6b', boxShadow: '0 0 10px #ff6b6b' }} />
            <div style={{ position: 'absolute', left: 32, top: -4, width: 10, height: 10, borderRadius: 5, background: '#ff6b6b', boxShadow: '0 0 10px #ff6b6b' }} />
          </div>
        )}
      </div>
    );
  }

  function WeatherStrip() {
    return (
      <div style={{ padding: '12px 32px 18px', borderTop: `1px solid ${t.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <window.WeatherGlyph kind={weather.now.icon} size={26} color={t.fg} />
          <div style={{ fontSize: 22, fontWeight: 300, color: t.fg, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</div>
          <div style={{ fontSize: 10.5, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>↑{weather.now.hi}° ↓{weather.now.lo}°</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            {weather.week.slice(1, 5).map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: t.faint, fontFamily: t.mono, letterSpacing: 0.6 }}>{d.d.toUpperCase()}</div>
                <window.WeatherGlyph kind={d.icon} size={13} color={t.dim} />
                <div style={{ fontSize: 10.5, color: t.fg, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{d.hi}°</div>
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
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: '#171b22', borderRadius: 14, padding: 22, border: `1px solid ${t.rule}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: event.color, marginTop: 4 }} />
            <div>
              <div style={{ fontSize: 11, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5, textTransform: 'uppercase' }}>{event.cat}</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: t.fg, letterSpacing: -0.5, marginTop: 4 }}>{event.title}</div>
              <div style={{ fontSize: 14, color: t.dim, marginTop: 8 }}>{U.fmt12(sm)} – {U.fmt12(em)}</div>
              <div style={{ fontSize: 14, color: t.dim, marginTop: 2 }}>{event.loc}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ClassicCalm() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, fontFamily: t.font, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <ClockBlock now={now} />
        <NowNextCard now={now} />
        <Timeline now={now} onTap={setTapped} />
        <WeatherStrip />
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return ClassicCalm;
})();

window.V1Calm = V1Calm;

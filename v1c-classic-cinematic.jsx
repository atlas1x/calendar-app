// V1.3 — Classic / Cinematic
// Same agenda skeleton, but a moodier treatment: events render as soft
// gradient tints (not flat saturated blocks), the current event glows and
// floats, past events drop to thin ghost rules, and an accent gold runs
// through the chrome. Headline date set in a tight display weight.

const V1Cinematic = (() => {
  const { events, weather, tasks } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#0a0b0e',
    rule: 'rgba(255,255,255,0.05)',
    fg: '#f1ece1',
    dim: 'rgba(241,236,225,0.55)',
    faint: 'rgba(241,236,225,0.28)',
    gold: '#d4a554',
    font: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  };

  const HOUR_PX = 52;
  const DAY_START = 7 * 60, DAY_END = 22 * 60;
  const mToY = (m) => (m - DAY_START) / 60 * HOUR_PX;

  const tint = (hex, a) => {
    const h = hex.replace('#',''); const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  function Header({ now }) {
    const h12 = now.getHours() % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ap = now.getHours() >= 12 ? 'PM' : 'AM';
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dnum = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    return (
      <div style={{ position: 'relative', padding: '24px 30px 18px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ position: 'absolute', top: 24, left: 0, width: 4, height: 28, background: t.gold }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: t.gold, fontFamily: t.mono, letterSpacing: 3, fontWeight: 600 }}>{day}</div>
            <div style={{ fontSize: 64, fontWeight: 700, color: t.fg, letterSpacing: -2.4, lineHeight: 0.92, marginTop: 4 }}>
              {month} <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 200 }}>{dnum}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 30, fontWeight: 300, color: t.fg, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{h12}:{mm}</div>
            <div style={{ fontSize: 10.5, color: t.dim, fontFamily: t.mono, letterSpacing: 1.5, marginTop: 4 }}>{ap}</div>
          </div>
        </div>
      </div>
    );
  }

  function HeroBar({ now }) {
    const nowMin = U.minsOfDay(now);
    const cur = U.currentEvent(events, nowMin);
    const next = U.nextEvent(events, nowMin);
    if (!cur && !next) return null;
    if (cur) {
      const em = U.parseHM(cur.end);
      const minsLeft = em - nowMin;
      return (
        <div style={{ padding: '12px 30px', background: tint(cur.color, 0.12), borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: cur.color, boxShadow: `0 0 10px ${cur.color}` }} />
          <span style={{ fontSize: 10, color: cur.color, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>HAPPENING</span>
          <span style={{ flex: 1, fontSize: 14, color: t.fg, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.title}</span>
          <span style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{minsLeft}m left</span>
        </div>
      );
    }
    const cm = U.parseHM(next.start) - nowMin;
    return (
      <div style={{ padding: '12px 30px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: t.gold }} />
        <span style={{ fontSize: 10, color: t.gold, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>NEXT</span>
        <span style={{ flex: 1, fontSize: 14, color: t.fg, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</span>
        <span style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{U.countdownLabel(cm)}</span>
      </div>
    );
  }

  function Timeline({ now, onTap }) {
    const nowMin = U.minsOfDay(now);
    const hours = []; for (let h = 7; h <= 22; h++) hours.push(h);
    const cur = U.currentEvent(events, nowMin);
    return (
      <div style={{ position: 'relative', padding: '14px 24px 14px 64px', flex: 1, overflow: 'hidden' }}>
        {hours.map((h) => {
          const y = mToY(h * 60);
          const major = h % 3 === 0;
          return (
            <React.Fragment key={h}>
              <div style={{ position: 'absolute', left: 64, right: 24, top: y, height: 1, background: major ? t.rule : 'rgba(255,255,255,0.02)' }} />
              <div style={{ position: 'absolute', left: 20, top: y - 7, fontSize: 11, color: major ? t.dim : t.faint, fontFamily: t.mono, letterSpacing: 0.5, fontWeight: major ? 600 : 400 }}>
                {h % 12 || 12}{h < 12 ? 'a' : 'p'}
              </div>
            </React.Fragment>
          );
        })}

        {events.map((e) => {
          const sm = U.parseHM(e.start), em = U.parseHM(e.end);
          if (em < DAY_START || sm > DAY_END) return null;
          const top = mToY(sm);
          const height = Math.max(28, mToY(em) - top - 4);
          const isCurrent = cur && cur.id === e.id;
          const past = em < nowMin;

          if (past) {
            // ghost — single hairline + small label
            return (
              <div key={e.id} onClick={() => onTap(e)} style={{
                position: 'absolute', left: 64, right: 24, top: top + height / 2 - 8, height: 16,
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.45,
              }}>
                <span style={{ width: 16, height: 1, background: e.color }} />
                <span style={{ fontSize: 12, color: t.dim, textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
              </div>
            );
          }

          if (isCurrent) {
            const pct = Math.min(100, Math.max(0, (nowMin - sm) / (em - sm) * 100));
            return (
              <div key={e.id} onClick={() => onTap(e)} style={{
                position: 'absolute', left: 64, right: 24, top, height,
                background: `linear-gradient(135deg, ${tint(e.color, 0.42)} 0%, ${tint(e.color, 0.18)} 100%)`,
                borderRadius: 10, padding: '10px 14px',
                border: `1px solid ${tint(e.color, 0.6)}`,
                boxShadow: `0 0 0 1px ${tint(e.color, 0.2)}, 0 8px 28px ${tint(e.color, 0.3)}`,
                cursor: 'pointer', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: e.color, fontFamily: t.mono, letterSpacing: 1.6, fontWeight: 700 }}>● LIVE</span>
                  <span style={{ fontSize: 10, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{U.fmt12Short(sm)}–{U.fmt12Short(em)}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.fg, marginTop: 4, letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                {height > 60 && <div style={{ fontSize: 11, color: t.dim, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.loc}</div>}
                <div style={{ position: 'absolute', left: 14, right: 14, bottom: 8, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: e.color }} />
                </div>
              </div>
            );
          }

          // upcoming — soft tinted block, left color rail
          return (
            <div key={e.id} onClick={() => onTap(e)} style={{
              position: 'absolute', left: 64, right: 24, top, height,
              background: `linear-gradient(90deg, ${tint(e.color, 0.18)} 0%, ${tint(e.color, 0.04)} 80%)`,
              borderLeft: `3px solid ${e.color}`,
              borderRadius: '0 8px 8px 0',
              padding: '7px 12px',
              cursor: 'pointer', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.fg, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                <span style={{ fontSize: 10, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{U.fmt12Short(sm)}</span>
              </div>
              {height > 44 && <div style={{ fontSize: 10.5, color: t.dim, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.loc}</div>}
            </div>
          );
        })}

        {nowMin >= DAY_START && nowMin <= DAY_END && (
          <div style={{ position: 'absolute', left: 20, right: 24, top: mToY(nowMin), pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 44, right: 0, height: 1, background: t.gold, boxShadow: `0 0 8px ${t.gold}` }} />
            <div style={{ position: 'absolute', left: 38, top: -3, width: 8, height: 8, transform: 'rotate(45deg)', background: t.gold, boxShadow: `0 0 8px ${t.gold}` }} />
          </div>
        )}
      </div>
    );
  }

  function Foot() {
    const undone = tasks.filter((tk) => !tk.done);
    return (
      <div style={{ borderTop: `1px solid ${t.rule}`, padding: '14px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5, marginBottom: 6 }}>OUTSIDE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <window.WeatherGlyph kind={weather.now.icon} size={20} color={t.gold} />
            <span style={{ fontSize: 22, fontWeight: 300, color: t.fg, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</span>
            <span style={{ fontSize: 10.5, color: t.dim, fontFamily: t.mono, fontVariantNumeric: 'tabular-nums' }}>{weather.now.hi}/{weather.now.lo}</span>
          </div>
          <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 1, marginTop: 4 }}>SUNSET {weather.now.sunset.toUpperCase()}</div>
        </div>
        <div>
          <div style={{ fontSize: 9.5, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5, marginBottom: 6 }}>OPEN — {undone.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {undone.slice(0, 3).map((task) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: t.gold }} />
                <span style={{ fontSize: 11.5, color: t.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.text}</span>
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
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: `linear-gradient(140deg, ${tint(event.color, 0.20)} 0%, #14151a 100%)`, border: `1px solid ${tint(event.color, 0.4)}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 10.5, color: event.color, fontFamily: t.mono, letterSpacing: 2, fontWeight: 600 }}>{event.cat.toUpperCase()}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: t.fg, marginTop: 8, letterSpacing: -0.6, lineHeight: 1.05 }}>{event.title}</div>
          <div style={{ marginTop: 14, fontSize: 14, color: t.dim }}>{U.fmt12(sm)} – {U.fmt12(em)} · {em - sm} min</div>
          <div style={{ fontSize: 14, color: t.dim, marginTop: 2 }}>{event.loc}</div>
        </div>
      </div>
    );
  }

  function ClassicCinematic() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.fg, fontFamily: t.font, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Header now={now} />
        <HeroBar now={now} />
        <Timeline now={now} onTap={setTapped} />
        <Foot />
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return ClassicCinematic;
})();

window.V1Cinematic = V1Cinematic;

// V3 — Editorial
// Magazine cover treatment: oversized serif date as headline. A clean list
// of today's events with hairline rules — no colored blocks, just a thin
// vertical color bar per item. Weather, tasks, notes sit as small "columns"
// at the bottom like a magazine masthead.

const V3 = (() => {
  const { events, tasks, weather, notes, allDay } = window.CAL_DATA;
  const U = window.CAL_UTIL;

  const t = {
    bg: '#13110f',
    ink: '#efe8df',
    dim: 'rgba(239,232,223,0.55)',
    faint: 'rgba(239,232,223,0.28)',
    rule: 'rgba(239,232,223,0.13)',
    accent: '#d4a574',
    serif: '"Cormorant Garamond", "EB Garamond", Georgia, "Times New Roman", serif',
    sans: '"Inter", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  };

  function Masthead({ now }) {
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const dnum = now.getDate();
    const year = now.getFullYear();
    const h12 = now.getHours() % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ap = now.getHours() >= 12 ? 'p.m.' : 'a.m.';
    return (
      <div style={{ padding: '30px 32px 22px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 3, textTransform: 'uppercase' }}>Vol. XXVI · No. 139</div>
          <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' }}>{h12}:{mm} {ap}</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 16, color: t.accent, fontFamily: t.mono, letterSpacing: 2.5, textTransform: 'uppercase' }}>{day}</div>
        <div style={{ marginTop: 6, fontFamily: t.serif, fontSize: 90, fontWeight: 500, color: t.ink, letterSpacing: -3, lineHeight: 0.88, fontStyle: 'italic' }}>
          {month}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: -6 }}>
          <div style={{ fontFamily: t.serif, fontSize: 130, fontWeight: 500, color: t.ink, letterSpacing: -4, lineHeight: 0.85, fontVariantNumeric: 'tabular-nums' }}>{dnum}</div>
          <div style={{ fontFamily: t.serif, fontSize: 22, color: t.dim, letterSpacing: -0.4, fontStyle: 'italic' }}>{year}</div>
        </div>
      </div>
    );
  }

  function Agenda({ now, onTap }) {
    const nowMin = U.minsOfDay(now);
    return (
      <div style={{ padding: '24px 32px 20px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: t.rule }} />
          <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 3, textTransform: 'uppercase' }}>The Day Ahead</div>
          <div style={{ flex: 1, height: 1, background: t.rule }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {events.map((e, i) => {
            const sm = U.parseHM(e.start), em = U.parseHM(e.end);
            const past = em < nowMin;
            const live = nowMin >= sm && nowMin < em;
            return (
              <div key={e.id} onClick={() => onTap(e)}
                style={{ display: 'grid', gridTemplateColumns: '64px 6px 1fr auto', alignItems: 'baseline', gap: 12, padding: '10px 0', borderTop: i > 0 ? `1px solid ${t.rule}` : 'none', cursor: 'pointer', opacity: past ? 0.42 : 1 }}>
                <div style={{ fontFamily: t.mono, fontSize: 11, color: live ? t.accent : t.dim, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {U.fmt12Short(sm).toUpperCase()}
                </div>
                <div style={{ width: 3, height: 28, background: e.color, justifySelf: 'center' }} />
                <div>
                  <div style={{ fontFamily: t.serif, fontSize: 19, fontWeight: 500, color: t.ink, letterSpacing: -0.3, lineHeight: 1.1, fontStyle: live ? 'italic' : 'normal' }}>{e.title}</div>
                  <div style={{ fontSize: 10.5, color: t.dim, fontFamily: t.sans, marginTop: 3, letterSpacing: 0.2 }}>{e.loc}</div>
                </div>
                <div style={{ fontFamily: t.mono, fontSize: 9.5, color: t.faint, letterSpacing: 0.6 }}>{em - sm}m</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function Columns() {
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>
        {/* weather column */}
        <div style={{ padding: '20px 26px 20px 32px', borderRight: `1px solid ${t.rule}` }}>
          <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>Weather</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ fontFamily: t.serif, fontSize: 56, fontWeight: 400, color: t.ink, letterSpacing: -1.8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{weather.now.temp}°</div>
            <window.WeatherGlyph kind={weather.now.icon} size={28} color={t.dim} />
          </div>
          <div style={{ fontFamily: t.serif, fontSize: 13, color: t.dim, fontStyle: 'italic', marginTop: 4 }}>partly cloudy · sunset at {weather.now.sunset}</div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {weather.week.slice(0, 5).map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 20px 1fr auto', alignItems: 'center', gap: 8, fontFamily: t.mono, fontSize: 10.5, color: t.dim }}>
                <span style={{ letterSpacing: 0.5 }}>{d.d.toUpperCase()}</span>
                <window.WeatherGlyph kind={d.icon} size={14} color={t.faint} />
                <span style={{ borderBottom: `1px dotted ${t.rule}`, height: 1 }} />
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{d.hi}° / {d.lo}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* tasks + notes column */}
        <div style={{ padding: '20px 32px 20px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>To Do</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: t.serif, fontSize: 14, color: task.done ? t.faint : t.accent, fontStyle: 'italic' }}>{task.done ? '✓' : '·'}</span>
                  <span style={{ fontFamily: t.serif, fontSize: 14, color: task.done ? t.faint : t.ink, textDecoration: task.done ? 'line-through' : 'none', fontStyle: 'italic', lineHeight: 1.25 }}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: t.faint, fontFamily: t.mono, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>Notes</div>
            {notes.slice(0, 2).map((n, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: t.serif, fontSize: 13, color: t.ink, fontStyle: 'italic', lineHeight: 1.35 }}>
                  &ldquo;{n.text}&rdquo;
                </div>
                <div style={{ fontFamily: t.mono, fontSize: 9, color: t.faint, marginTop: 3, letterSpacing: 1.5 }}>— {n.from.toUpperCase()}</div>
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
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(19,17,15,0.85)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', borderTop: `2px solid ${t.ink}`, borderBottom: `2px solid ${t.ink}`, padding: '24px 4px' }}>
          <div style={{ fontFamily: t.mono, fontSize: 10, color: event.color, letterSpacing: 2.5, textTransform: 'uppercase' }}>{event.cat}</div>
          <div style={{ fontFamily: t.serif, fontSize: 36, color: t.ink, marginTop: 12, letterSpacing: -0.8, fontStyle: 'italic', lineHeight: 1.05 }}>{event.title}</div>
          <div style={{ fontFamily: t.serif, fontSize: 16, color: t.dim, marginTop: 14, fontStyle: 'italic' }}>{U.fmt12(sm)} – {U.fmt12(em)}</div>
          <div style={{ fontFamily: t.mono, fontSize: 11, color: t.dim, marginTop: 6, letterSpacing: 1 }}>{event.loc.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  function Editorial() {
    const now = window.useLiveNow(window.CAL_DATA.today);
    const [tapped, setTapped] = React.useState(null);
    return (
      <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: t.sans, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Masthead now={now} />
        <Agenda now={now} onTap={setTapped} />
        <Columns />
        <EventDetail event={tapped} onClose={() => setTapped(null)} />
      </div>
    );
  }

  return Editorial;
})();

window.V3Editorial = V3;

// Shared sample data + tiny utilities for all calendar variations.
// Pretends "now" is somewhere in the middle of the day so timelines feel alive.

window.CAL_DATA = (() => {
  // Tuesday, May 19 2026 — synthetic "today" that the wall display would show.
  const today = new Date(2026, 4, 19, 14, 32); // 2:32 PM

  // Google-Calendar-ish saturated category palette (dark-mode friendly).
  const C = {
    blue:    '#5b8df7',
    sage:    '#5fb88f',
    coral:   '#f08a6c',
    plum:    '#a07cd1',
    rose:    '#e36b8d',
    amber:   '#e6b450',
    teal:    '#4cb6c0',
    graphite:'#7a8290',
  };

  // Hour, minute in 24h; durations in minutes.
  const events = [
    { id: 'e1', title: 'Standup',              loc: 'Zoom · #design',          start: '08:30', end: '09:00', color: C.blue,   cat: 'Work' },
    { id: 'e2', title: 'Product review',       loc: 'Conf room · Atlas',       start: '10:00', end: '11:30', color: C.sage,   cat: 'Work' },
    { id: 'e3', title: 'Lunch w/ Sarah',       loc: 'Tartine · Valencia',      start: '12:15', end: '13:15', color: C.coral,  cat: 'Personal' },
    { id: 'e4', title: '1:1 — Maya',           loc: 'Walk · Dolores Park',     start: '14:00', end: '14:45', color: C.plum,   cat: 'Work' },
    { id: 'e5', title: 'Design crit',          loc: 'Studio',                  start: '15:30', end: '16:30', color: C.rose,   cat: 'Work' },
    { id: 'e6', title: 'Pick up Theo',         loc: 'School',                  start: '17:30', end: '18:00', color: C.amber,  cat: 'Family' },
    { id: 'e7', title: 'Dinner @ Mom\u2019s',  loc: '440 Liberty',             start: '19:00', end: '20:30', color: C.teal,   cat: 'Family' },
  ];

  const allDay = [
    { id: 'a1', title: 'Anna\u2019s birthday', color: C.rose },
  ];

  const tasks = [
    { id: 't1', text: 'Reply to landlord', done: false, due: 'today' },
    { id: 't2', text: 'Renew passport',    done: false, due: 'this week' },
    { id: 't3', text: 'Book flights — June', done: true,  due: 'today' },
    { id: 't4', text: 'Pick up dry cleaning', done: false, due: 'today' },
    { id: 't5', text: 'Order Theo\u2019s soccer cleats', done: false, due: 'tomorrow' },
  ];

  const notes = [
    { from: 'Theo',  text: 'mom can u sign the field-trip slip its in my backpack' },
    { from: 'Sam',   text: 'trash night — recycling this week' },
    { from: 'You',   text: 'Anna\u2019s gift in hall closet, top shelf' },
  ];

  // Today + 6-day outlook. Icons are abstract names; each variation
  // renders them however fits its style.
  const weather = {
    now:  { temp: 63, feels: 61, cond: 'partly-cloudy', icon: 'partly-cloudy', hi: 68, lo: 54, sunset: '8:14 PM' },
    week: [
      { d: 'Tue', icon: 'partly-cloudy', hi: 68, lo: 54 },
      { d: 'Wed', icon: 'sun',           hi: 72, lo: 55 },
      { d: 'Thu', icon: 'sun',           hi: 74, lo: 56 },
      { d: 'Fri', icon: 'cloud',         hi: 67, lo: 58 },
      { d: 'Sat', icon: 'rain',          hi: 61, lo: 55 },
      { d: 'Sun', icon: 'rain',          hi: 60, lo: 53 },
      { d: 'Mon', icon: 'partly-cloudy', hi: 65, lo: 54 },
    ],
  };

  return { today, events, allDay, tasks, notes, weather, C };
})();

// ---------- tiny helpers ----------

window.CAL_UTIL = (() => {
  const parseHM = (s) => { const [h,m] = s.split(':').map(Number); return h*60 + m; };
  const fmt12 = (mins) => {
    let h = Math.floor(mins/60), m = mins%60;
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return m === 0 ? `${h} ${ap}` : `${h}:${String(m).padStart(2,'0')} ${ap}`;
  };
  const fmt12Short = (mins) => { // 9:30a / 2p
    let h = Math.floor(mins/60), m = mins%60;
    const ap = h >= 12 ? 'p' : 'a';
    h = h % 12 || 12;
    return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2,'0')}${ap}`;
  };
  const minsOfDay = (d) => d.getHours()*60 + d.getMinutes();
  // Find the next event start strictly after `nowMins`. Falls back to first event tomorrow.
  const nextEvent = (events, nowMins) => events.find((e) => parseHM(e.start) > nowMins);
  const currentEvent = (events, nowMins) => events.find((e) => {
    const s = parseHM(e.start), en = parseHM(e.end);
    return nowMins >= s && nowMins < en;
  });
  const countdownLabel = (mins) => {
    if (mins < 1)    return 'now';
    if (mins < 60)   return `in ${mins} min`;
    const h = Math.floor(mins/60), m = mins%60;
    if (h < 24)      return m ? `in ${h}h ${m}m` : `in ${h}h`;
    return `in ${Math.round(h/24)}d`;
  };
  return { parseHM, fmt12, fmt12Short, minsOfDay, nextEvent, currentEvent, countdownLabel };
})();

// ---------- live clock hook (1s tick) ----------
// All variations share this so the "now" indicator stays consistent.
window.useLiveNow = function useLiveNow(simulated) {
  const [now, setNow] = React.useState(simulated || new Date());
  React.useEffect(() => {
    // For the artboards we simulate a fixed "today" so the design always
    // shows mid-day. Bump only the seconds so the clock visibly ticks.
    if (simulated) {
      const t = setInterval(() => {
        setNow((n) => new Date(n.getTime() + 1000));
      }, 1000);
      return () => clearInterval(t);
    }
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

// ---------- weather glyph (single small SVG) ----------
window.WeatherGlyph = function WeatherGlyph({ kind, size = 24, color = 'currentColor' }) {
  const s = size;
  const stroke = { stroke: color, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'sun') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" {...stroke} />
        {[0,45,90,135,180,225,270,315].map((a) => {
          const r1 = 7, r2 = 9;
          const x1 = 12 + Math.cos(a*Math.PI/180)*r1, y1 = 12 + Math.sin(a*Math.PI/180)*r1;
          const x2 = 12 + Math.cos(a*Math.PI/180)*r2, y2 = 12 + Math.sin(a*Math.PI/180)*r2;
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />;
        })}
      </svg>
    );
  }
  if (kind === 'cloud') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M6 17h12a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6-1.4A3.5 3.5 0 0 0 6 17z" {...stroke} />
      </svg>
    );
  }
  if (kind === 'partly-cloudy') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <circle cx="9" cy="9" r="3" {...stroke} />
        <line x1="9" y1="3" x2="9" y2="4.5" {...stroke} />
        <line x1="9" y1="13.5" x2="9" y2="15" {...stroke} />
        <line x1="3" y1="9" x2="4.5" y2="9" {...stroke} />
        <line x1="13.5" y1="9" x2="15" y2="9" {...stroke} />
        <path d="M8 19h10a3 3 0 0 0 0-6 4 4 0 0 0-7-.8" {...stroke} />
      </svg>
    );
  }
  if (kind === 'rain') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M6 14h12a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6-1.4A3.5 3.5 0 0 0 6 14z" {...stroke} />
        <line x1="8" y1="17" x2="7" y2="20" {...stroke} />
        <line x1="12" y1="17" x2="11" y2="20" {...stroke} />
        <line x1="16" y1="17" x2="15" y2="20" {...stroke} />
      </svg>
    );
  }
  return null;
};

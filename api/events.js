const ical = require('node-ical');

module.exports = async function handler(req, res) {
  const icsUrl = process.env.GCAL_ICS_URL;

  if (!icsUrl) {
    return res.status(500).json({ error: 'GCAL_ICS_URL environment variable not set' });
  }

  try {
    const rawEvents = await ical.async.fromURL(icsUrl);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const events = [];
    const allDay = [];

    for (const key of Object.keys(rawEvents)) {
      const ev = rawEvents[key];
      if (ev.type !== 'VEVENT') continue;

      const start = new Date(ev.start);
      const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);
      const isAllDay = ev.start.dateOnly === true;

      if (isAllDay) {
        if (start <= todayStart && end > todayStart) {
          allDay.push({ id: key, title: ev.summary || 'Untitled', color: '#5b8df7' });
        }
      } else {
        if (start < todayEnd && end > todayStart) {
          const fmt = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
          events.push({
            id: key,
            title: ev.summary || 'Untitled',
            loc: ev.location || '',
            start: fmt(start),
            end: fmt(end),
            color: '#5b8df7',
            cat: 'Calendar',
          });
        }
      }
    }

    events.sort((a, b) => a.start.localeCompare(b.start));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({ today: now.toISOString(), events, allDay });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

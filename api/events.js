const ical = require('node-ical');

module.exports = async function handler(req, res) {
  const icsUrl = process.env.GCAL_ICS_URL;

  if (!icsUrl) {
    return res.status(500).json({ error: 'GCAL_ICS_URL environment variable not set' });
  }

  try {
    const rawEvents = await ical.async.fromURL(icsUrl);

    // Send a wide window (±36h around server UTC "now") so the client can
    // filter to its own local "today" without missing edge cases caused by
    // the server running in UTC.
    const now = new Date();
    const windowStart = new Date(now.getTime() - 36 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000);

    const events = [];
    const allDay = [];

    for (const key of Object.keys(rawEvents)) {
      const ev = rawEvents[key];
      if (ev.type !== 'VEVENT') continue;

      const start = new Date(ev.start);
      const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);
      const isAllDay = ev.start.dateOnly === true;

      if (start >= windowEnd || end <= windowStart) continue;

      if (isAllDay) {
        // All-day events: send the date components so the client can match
        // them against its local date.
        allDay.push({
          id: key,
          title: ev.summary || 'Untitled',
          color: '#5b8df7',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        });
      } else {
        events.push({
          id: key,
          title: ev.summary || 'Untitled',
          loc: ev.location || '',
          startISO: start.toISOString(),
          endISO: end.toISOString(),
          color: '#5b8df7',
          cat: 'Calendar',
        });
      }
    }

    events.sort((a, b) => a.startISO.localeCompare(b.startISO));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({ today: now.toISOString(), events, allDay });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

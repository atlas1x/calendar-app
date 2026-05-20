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

    const todayEvents = [];

    for (const key of Object.keys(rawEvents)) {
      const ev = rawEvents[key];
      if (ev.type !== 'VEVENT') continue;

      const start = new Date(ev.start);
      const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);

      if (start < todayEnd && end > todayStart) {
        const fmt = (d) => {
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          return `${h}:${m}`;
        };

        todayEvents.push({
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

    todayEvents.sort((a, b) => a.start.localeCompare(b.start));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({
      today: now.toISOString(),
      events: todayEvents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

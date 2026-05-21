module.exports = async function handler(req, res) {
  // Defaults: Winston-Salem, NC. Override per-deploy with WEATHER_LAT/WEATHER_LNG.
  const lat = process.env.WEATHER_LAT || '36.0999';
  const lng = process.env.WEATHER_LNG || '-80.2442';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,apparent_temperature,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset` +
    `&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    const wmoIcon = (code) => {
      if (code <= 1) return 'sun';
      if (code <= 3) return 'partly-cloudy';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rain';
      return 'cloud';
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const week = data.daily.time.map((dateStr, i) => ({
      d: dayNames[new Date(dateStr + 'T12:00:00').getDay()],
      icon: wmoIcon(data.daily.weather_code[i]),
      hi: Math.round(data.daily.temperature_2m_max[i]),
      lo: Math.round(data.daily.temperature_2m_min[i]),
    }));

    const sunsetDate = new Date(data.daily.sunset[0]);
    const sh = sunsetDate.getHours() % 12 || 12;
    const sm = String(sunsetDate.getMinutes()).padStart(2, '0');
    const sap = sunsetDate.getHours() >= 12 ? 'PM' : 'AM';

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json({
      now: {
        temp: Math.round(data.current.temperature_2m),
        feels: Math.round(data.current.apparent_temperature),
        icon: wmoIcon(data.current.weather_code),
        hi: Math.round(data.daily.temperature_2m_max[0]),
        lo: Math.round(data.daily.temperature_2m_min[0]),
        sunset: `${sh}:${sm} ${sap}`,
      },
      week,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
};

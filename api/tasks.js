// api/tasks.js — fetch Google Tasks using an OAuth refresh token.
// Env vars required:
//   GOOGLE_CLIENT_ID        — OAuth 2.0 client ID
//   GOOGLE_CLIENT_SECRET    — OAuth 2.0 client secret
//   GOOGLE_REFRESH_TOKEN    — long-lived refresh token (one-time mint, see Setup Guide)
//   GOOGLE_TASKS_LIST_ID    — optional, defaults to "@default" (your primary list)

module.exports = async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const listId = process.env.GOOGLE_TASKS_LIST_ID || '@default';

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({
      error: 'Google OAuth env vars not set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)',
    });
  }

  try {
    // 1) Refresh-token → short-lived access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      console.error('Token exchange failed:', tokenJson);
      return res.status(500).json({ error: 'Google token exchange failed', detail: tokenJson });
    }

    // 2) Pull tasks
    const tasksUrl = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks` +
      `?showCompleted=true&showHidden=false&maxResults=50`;
    const tasksRes = await fetch(tasksUrl, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const tasksJson = await tasksRes.json();
    if (!Array.isArray(tasksJson.items)) {
      return res.status(200).json({ tasks: [] });
    }

    // 3) Bucket due dates into the "today / tomorrow / this week / later" labels
    //    the design already speaks. Google Tasks returns `due` as a date-only
    //    RFC3339 timestamp at 00:00 UTC; parse the date part directly.
    const now = new Date();
    const todayY = now.getFullYear(), todayM = now.getMonth(), todayD = now.getDate();
    const todayStart = new Date(todayY, todayM, todayD);
    const dayMs = 24 * 60 * 60 * 1000;

    const dueLabel = (dueStr) => {
      if (!dueStr) return null;
      // dueStr looks like "2026-05-22T00:00:00.000Z" — keep only the YYYY-MM-DD
      const [y, m, d] = dueStr.slice(0, 10).split('-').map(Number);
      const due = new Date(y, m - 1, d);
      const diff = Math.round((due - todayStart) / dayMs);
      if (diff <= 0) return 'today';
      if (diff === 1) return 'tomorrow';
      if (diff <= 7) return 'this week';
      return 'later';
    };

    const tasks = tasksJson.items
      // Hide tasks that have a parent (subtasks) for now — flat list looks cleaner
      .filter((t) => !t.parent)
      .map((t) => ({
        id: t.id,
        text: t.title || '(untitled)',
        done: t.status === 'completed',
        due: dueLabel(t.due),
      }))
      // Open tasks first, then completed. Inside each group, today → tomorrow → week → later → undated.
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const order = { today: 0, tomorrow: 1, 'this week': 2, later: 3 };
        const ao = a.due ? order[a.due] : 4;
        const bo = b.due ? order[b.due] : 4;
        return ao - bo;
      });

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const { GEMINI_API_KEY, GEMINI_MODEL = 'gemini-3.5-flash-lite', ALLOWED_ORIGINS = 'https://edith-quest.vercel.app', PORT = 3000 } = process.env;
const origins = ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);

const app = express();
app.set('trust proxy', 1);
app.use(cors({
  origin: (o, cb) => cb(null, !o || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o) || origins.includes(o)),
}));
app.use(express.json({ limit: '50kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas solicitudes, espera un minuto.' } }));

app.get('/api/health', (_req, res) => res.json({ ok: true, model: GEMINI_MODEL, key: !!GEMINI_API_KEY }));

app.post('/api/gemini', async (req, res) => {
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Falta GEMINI_API_KEY en el servidor' });
  const { system = '', messages } = req.body || {};
  if (typeof system !== 'string' || system.length > 6000 || !Array.isArray(messages) || !messages.length || messages.length > 14)
    return res.status(400).json({ error: 'Solicitud inválida' });
  const contents = [];
  for (const m of messages) {
    if (!['user', 'model'].includes(m?.r) || typeof m.t !== 'string' || m.t.length > 4000)
      return res.status(400).json({ error: 'Mensaje inválido' });
    contents.push({ role: m.r, parts: [{ text: m.t }] });
  }
  if (contents.at(-1).role !== 'user') return res.status(400).json({ error: 'El último mensaje debe ser del usuario' });
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.6, maxOutputTokens: 2048 } }),
      signal: AbortSignal.timeout(30_000),
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: d?.error?.message || `Gemini respondió ${r.status}` });
    const text = (d.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('').trim();
    if (!text) return res.status(502).json({ error: 'Gemini devolvió una respuesta vacía' });
    res.json({ text });
  } catch {
    res.status(504).json({ error: 'Gemini no respondió a tiempo' });
  }
});

app.listen(PORT, () => console.log(`Calculus Quest server en :${PORT} (${GEMINI_MODEL})`));

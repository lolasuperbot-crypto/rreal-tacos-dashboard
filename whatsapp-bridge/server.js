/**
 * WhatsApp Bridge — Rreal Tacos Dashboard
 * Connects to WhatsApp Web, monitors location group chats,
 * stores last 5 messages per group, and serves them via HTTP API.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = 3099;
const DATA_FILE = path.join(__dirname, 'messages.json');

// Alert keywords
const ALERT_KEYWORDS = ['emergency', 'health', 'sick', 'broken', 'complaint', 'urgent', 'help', 'fire', 'hurt', 'injured', 'police'];

// Location group name mappings (partial match, case-insensitive)
const LOCATION_MAP = [
  { key: 'midtown',       label: 'Midtown' },
  { key: 'west midtown',  label: 'West Midtown' },
  { key: 'chamblee',      label: 'Chamblee' },
  { key: 'sandy springs', label: 'Sandy Springs' },
  { key: 'cumming',       label: 'Cumming' },
  { key: 'sugar hill',    label: 'Sugar Hill' },
  { key: 'buckhead',      label: 'Buckhead' },
  { key: 'decatur',       label: 'Decatur' },
  { key: 'lawrenceville', label: 'Lawrenceville' },
  { key: 'beltline',      label: 'Beltline' },
  { key: 'duluth',        label: 'Duluth' },
];

// In-memory store: { locationKey: { label, groupId, groupName, members, messages: [], alerts: [] } }
let store = {};

// Load persisted data
if (fs.existsSync(DATA_FILE)) {
  try { store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e) {}
}

function saveStore() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function matchLocation(groupName) {
  const lower = groupName.toLowerCase();
  // Prefer longer matches first
  const sorted = [...LOCATION_MAP].sort((a, b) => b.key.length - a.key.length);
  return sorted.find(l => lower.includes(l.key)) || null;
}

function checkAlerts(text) {
  const lower = text.toLowerCase();
  return ALERT_KEYWORDS.filter(kw => lower.includes(kw));
}

// ── WhatsApp Client ──
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

let bridgeStatus = 'starting'; // starting | qr | ready | disconnected
let lastQR = null;
let connectedAt = null;
let phoneInfo = null;

client.on('qr', (qr) => {
  require('fs').writeFileSync(require('path').join(__dirname, 'qr.txt'), qr);
  bridgeStatus = 'qr';
  lastQR = qr;
  console.log('\n📱 SCAN THIS QR CODE WITH YOUR WHATSAPP:\n');
  qrcode.generate(qr, { small: true });
  console.log('\nOr open http://localhost:' + PORT + '/qr in your browser\n');
});

client.on('ready', async () => {
  bridgeStatus = 'ready';
  lastQR = null;
  connectedAt = new Date().toISOString();
  const info = client.info;
  phoneInfo = info?.wid?.user || 'unknown';
  console.log('✅ WhatsApp connected! Phone:', phoneInfo);

  // Discover all group chats and map them to locations
  try {
    const chats = await client.getChats();
    const groups = chats.filter(c => c.isGroup);
    console.log(`Found ${groups.length} group chats`);
    for (const g of groups) {
      const loc = matchLocation(g.name);
      if (loc) {
        if (!store[loc.key]) store[loc.key] = { label: loc.label, groupId: g.id._serialized, groupName: g.name, members: 0, messages: [], alerts: [] };
        else { store[loc.key].groupId = g.id._serialized; store[loc.key].groupName = g.name; }
        try {
          const participants = g.participants || [];
          store[loc.key].members = participants.length;
        } catch(e) {}
        console.log(`  ✅ Mapped: "${g.name}" → ${loc.label}`);
      }
    }
    saveStore();
  } catch(e) {
    console.error('Error loading groups:', e.message);
  }
});

client.on('message', async (msg) => {
  if (!msg.from.endsWith('@g.us')) return; // groups only
  const chat = await msg.getChat();
  const loc = matchLocation(chat.name);
  if (!loc) return;

  const contact = await msg.getContact();
  const sender = contact.pushname || contact.number || 'Unknown';
  const text = msg.body || '';
  const ts = new Date(msg.timestamp * 1000).toISOString();
  const alerts = checkAlerts(text);

  if (!store[loc.key]) store[loc.key] = { label: loc.label, groupId: msg.from, groupName: chat.name, members: 0, messages: [], alerts: [] };

  const entry = { sender, text, ts, hasAlert: alerts.length > 0, alertKeywords: alerts };
  store[loc.key].messages.unshift(entry);
  store[loc.key].messages = store[loc.key].messages.slice(0, 5); // keep last 5
  store[loc.key].lastActivity = ts;

  if (alerts.length > 0) {
    store[loc.key].alerts.unshift({ sender, text, ts, keywords: alerts });
    store[loc.key].alerts = store[loc.key].alerts.slice(0, 10);
    console.log(`🚨 ALERT in ${loc.label}: [${alerts.join(', ')}] "${text.slice(0, 80)}"`);
  } else {
    console.log(`💬 ${loc.label} | ${sender}: ${text.slice(0, 60)}`);
  }

  saveStore();
});

client.on('disconnected', (reason) => {
  bridgeStatus = 'disconnected';
  console.log('❌ WhatsApp disconnected:', reason);
});

client.initialize();

// ── Express API ──
const app = express();
app.use(cors());
app.use(express.json());

// Status
app.get('/status', (req, res) => {
  res.json({
    status: bridgeStatus,
    phone: phoneInfo,
    connectedAt,
    trackedGroups: Object.keys(store).length,
    locations: Object.fromEntries(
      Object.entries(store).map(([k, v]) => [k, {
        label: v.label,
        groupName: v.groupName,
        members: v.members,
        messageCount: v.messages?.length || 0,
        alertCount: v.alerts?.length || 0,
        lastActivity: v.lastActivity || null
      }])
    )
  });
});

// All messages for dashboard
app.get('/messages', (req, res) => {
  res.json(store);
});

// Messages for one location
app.get('/messages/:location', (req, res) => {
  const loc = store[req.params.location];
  if (!loc) return res.status(404).json({ error: 'Location not found' });
  res.json(loc);
});

// QR code page (for browser scanning)
app.get('/qr', (req, res) => {
  if (bridgeStatus === 'ready') return res.send('<h2 style="font-family:sans-serif;color:green">✅ WhatsApp Connected!</h2>');
  if (!lastQR) return res.send('<h2 style="font-family:sans-serif">⏳ Waiting for QR code... refresh in 5 seconds</h2><script>setTimeout(()=>location.reload(),5000)</script>');
  // Return QR as image using Google Charts API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(lastQR)}`;
  res.send(`
    <html><head><title>WhatsApp QR</title></head>
    <body style="font-family:sans-serif;text-align:center;padding:40px;background:#111;">
      <h2 style="color:#25D366">📱 Scan with WhatsApp</h2>
      <p style="color:#aaa">Open WhatsApp → Settings → Linked Devices → Link a Device</p>
      <img src="${qrUrl}" style="border:4px solid #25D366;border-radius:12px;margin:20px auto;display:block;">
      <p style="color:#666;font-size:12px">QR expires in ~60s — <a href="/qr" style="color:#25D366">Refresh</a></p>
      <script>setTimeout(()=>location.reload(), 30000)</script>
    </body></html>
  `);
});

// QR as PNG image
app.get('/qr.png', async (req, res) => {
  const qrPkg = require('qrcode');
  const qrFile = require('path').join(__dirname, 'qr.txt');
  if (!require('fs').existsSync(qrFile)) return res.status(404).send('No QR yet');
  const qrData = require('fs').readFileSync(qrFile, 'utf8').trim();
  const png = await qrPkg.toBuffer(qrData, { width: 400, margin: 2 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});

app.listen(PORT, () => {
  console.log(`\n🌮 Rreal Tacos WhatsApp Bridge running on http://localhost:${PORT}`);
  console.log(`   Status: http://localhost:${PORT}/status`);
  console.log(`   QR:     http://localhost:${PORT}/qr`);
  console.log(`   Data:   http://localhost:${PORT}/messages\n`);
});

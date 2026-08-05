const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

function readLinks() {
  return JSON.parse(fs.readFileSync('./data/links.json', 'utf8'));
}

function writeLinks(links) {
  fs.writeFileSync('./data/links.json', JSON.stringify(links, null, 2));
}

function requireAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.redirect('/admin/login');
}

// Public NFC page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Public API — only active links
app.get('/api/links', (req, res) => {
  const links = readLinks()
    .filter(l => l.active)
    .sort((a, b) => a.order - b.order);
  res.json(links);
});

// Admin login page
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.post('/admin/login', (req, res) => {
  if (req.body.password === config.adminPassword) {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Admin panel
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin API — all links
app.get('/admin/api/links', requireAdmin, (req, res) => {
  res.json(readLinks().sort((a, b) => a.order - b.order));
});

app.post('/admin/api/links', requireAdmin, (req, res) => {
  const links = readLinks();
  const maxId = links.reduce((m, l) => Math.max(m, l.id), 0);
  const maxOrder = links.reduce((m, l) => Math.max(m, l.order), 0);
  const newLink = {
    id: maxId + 1,
    label: req.body.label || 'New Link',
    sublabel: req.body.sublabel || '',
    url: req.body.url || '#',
    icon: req.body.icon || 'link',
    active: true,
    order: maxOrder + 1
  };
  links.push(newLink);
  writeLinks(links);
  res.json(newLink);
});

app.put('/admin/api/links/:id', requireAdmin, (req, res) => {
  const links = readLinks();
  const idx = links.findIndex(l => l.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  links[idx] = { ...links[idx], ...req.body, id: links[idx].id };
  writeLinks(links);
  res.json(links[idx]);
});

app.delete('/admin/api/links/:id', requireAdmin, (req, res) => {
  let links = readLinks();
  links = links.filter(l => l.id !== parseInt(req.params.id));
  writeLinks(links);
  res.json({ ok: true });
});

app.put('/admin/api/reorder', requireAdmin, (req, res) => {
  const links = readLinks();
  const order = req.body.order; // array of ids
  order.forEach((id, i) => {
    const link = links.find(l => l.id === id);
    if (link) link.order = i + 1;
  });
  writeLinks(links);
  res.json({ ok: true });
});

app.listen(config.port, () => {
  console.log(`CerberusMaker running at http://localhost:${config.port}`);
  console.log(`Admin panel: http://localhost:${config.port}/admin`);
});

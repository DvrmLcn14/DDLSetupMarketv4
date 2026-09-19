import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { handleEngineerChat } from './src/server/geminiEngineer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for base64 images and large config payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure persistent data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const bannerConfigFile = path.join(dataDir, 'banner-config.json');
  const setupsFile = path.join(dataDir, 'setups.json');
  const usersFile = path.join(dataDir, 'users.json');
  const commentsFile = path.join(dataDir, 'comments.json');

  // Load existing comments from file or initialize with empty list
  let globalCommentsList: any[] = [];
  try {
    if (fs.existsSync(commentsFile)) {
      const raw = fs.readFileSync(commentsFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalCommentsList = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading comments file:', err);
  }

  // Default initial users list
  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123',
      badge: 'Admin / Founder',
      role: 'admin',
      isAdmin: true,
      bio: 'Sistem Yöneticisi & Kurucu',
      createdAt: '2026-01-01',
    },
    {
      username: 'ApexRacer',
      password: 'password123',
      badge: 'Pro',
      role: 'user',
      isAdmin: false,
      bio: 'Formula and GT3 time trial specialist.',
      createdAt: '2026-01-15',
    },
    {
      username: 'VerstappenSim',
      password: 'password123',
      badge: 'Esports',
      role: 'user',
      isAdmin: false,
      bio: 'Virtual endurance and qualifying engineer.',
      createdAt: '2026-02-01',
    },
    {
      username: 'TrackMaster99',
      password: 'password123',
      badge: 'Community',
      role: 'user',
      isAdmin: false,
      bio: 'Passionate sim racer sharing custom balanced setups.',
      createdAt: '2026-03-10',
    },
  ];

  // Load existing users from file or initialize with defaults
  let globalUsersList: any[] = defaultUsers;
  try {
    if (fs.existsSync(usersFile)) {
      const raw = fs.readFileSync(usersFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalUsersList = parsed;
        // Ensure default admin user always exists
        if (!globalUsersList.some((u) => u.username.toLowerCase() === 'admin')) {
          globalUsersList.unshift(defaultUsers[0]);
        }
      } else {
        fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2), 'utf-8');
      }
    } else {
      fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading global users file:', err);
  }

  // Default initial banner configuration
  const defaultBannerConfig = {
    enabled: true,
    autoRotate: true,
    intervalSeconds: 3,
    items: [
      {
        id: 'prl-league-ad',
        title: 'Join PRL League',
        highlightText: 'Official League',
        description: 'Access exclusive PRL League setups, live race telemetry, championship standings, and connect with fellow F1 drivers.',
        buttonText: 'Join PRL League',
        buttonUrl: 'https://discord.gg/aFzAhfBy3',
        badgeText: 'OFFICIAL LEAGUE',
        onlineCount: 428,
        iconType: 'discord',
        accentColor: 'indigo',
      },
      {
        id: 'horizon-racing-series',
        title: 'Horizon Racing Series',
        highlightText: 'Partner League',
        description: 'Join Horizon Racing Series for competitive weekly championship lobbies, clean racing, and community events.',
        buttonText: 'Join Horizon Racing',
        buttonUrl: 'https://discord.gg/bKHrsNJ5a',
        badgeText: 'HORIZON RACING',
        onlineCount: 385,
        iconType: 'discord',
        accentColor: 'amber',
      },
      {
        id: 'sfl-league',
        title: 'SFL League',
        highlightText: 'Partner League',
        description: 'Compete in the SFL League with dedicated tier divisions, live race stewarding, and championship leaderboard tracking.',
        buttonText: 'Join SFL League',
        buttonUrl: 'https://discord.gg/9Gmwt2Wh5Eurs',
        badgeText: 'SFL LEAGUE',
        onlineCount: 490,
        iconType: 'trophy',
        accentColor: 'emerald',
      },
      {
        id: 'f1-26-league',
        title: 'F1 26 League',
        highlightText: 'Next-Gen F1',
        description: 'Prepare for the next era in the F1 26 League with custom car setups, telemetry coaching, and weekly tier racing.',
        buttonText: 'Join F1 26 League',
        buttonUrl: 'https://discord.gg/zffspwSwM',
        badgeText: 'F1 26 LEAGUE',
        onlineCount: 310,
        iconType: 'zap',
        accentColor: 'cyan',
      },
      {
        id: 'paradise-racing-league',
        title: 'Paradise Racing League',
        highlightText: 'Esports League',
        description: 'Equal Performance off and the economy works. High-intensity wheel-to-wheel action and weekly championship races.',
        buttonText: 'Join Paradise League',
        buttonUrl: 'https://discord.gg/PVG5P4PUW',
        badgeText: 'PARADISE RACING',
        onlineCount: 560,
        iconType: 'discord',
        accentColor: 'purple',
      },
    ],
  };

  // Load existing global banner config from file or initialize with default
  let globalBannerConfig = defaultBannerConfig;
  try {
    if (fs.existsSync(bannerConfigFile)) {
      const raw = fs.readFileSync(bannerConfigFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        globalBannerConfig = parsed;
      }
    } else {
      fs.writeFileSync(bannerConfigFile, JSON.stringify(defaultBannerConfig, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading global banner config file:', err);
  }

  // Load existing custom setups from file
  let globalCustomSetups: any[] = [];
  try {
    if (fs.existsSync(setupsFile)) {
      const raw = fs.readFileSync(setupsFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalCustomSetups = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading global setups file:', err);
  }

  // ==========================================
  // REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
  // ==========================================
  const sseClients = new Set<express.Response>();

  function broadcastRealtimeEvent(type: string, payload: any) {
    const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    for (const client of sseClients) {
      try {
        client.write(`data: ${data}\n\n`);
      } catch (err) {
        sseClients.delete(client);
      }
    }
  }

  // GET /api/events - Real-time SSE channel for instantaneous setup & user updates
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);

    // Send initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // ==========================================
  // PUBLIC GLOBAL API ROUTES
  // ==========================================

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET /api/banner-config - Fetch globally active banner & advertisement slots for all visitors
  app.get('/api/banner-config', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      config: globalBannerConfig,
      updatedAt: new Date().toISOString(),
    });
  });

  // POST /api/banner-config - Save global banner & advertisement slots so all visitors see updates
  app.post('/api/banner-config', (req, res) => {
    try {
      const newConfig = req.body;
      if (!newConfig || typeof newConfig !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid config payload' });
      }

      globalBannerConfig = newConfig;
      fs.writeFileSync(bannerConfigFile, JSON.stringify(newConfig, null, 2), 'utf-8');
      console.log('✅ Global advertisement banner config updated by admin. Visible to all users.');

      broadcastRealtimeEvent('BANNER_UPDATED', globalBannerConfig);

      res.json({
        success: true,
        message: 'Advertisement banner saved globally for all visitors.',
        config: globalBannerConfig,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error saving global banner config:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to save banner config' });
    }
  });

  // GET /api/setups - Fetch globally persisted community setups
  app.get('/api/setups', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      setups: globalCustomSetups,
    });
  });

  // POST /api/setups - Upsert / sync user submitted setups globally
  app.post('/api/setups', (req, res) => {
    try {
      const setupsList = req.body;
      if (Array.isArray(setupsList)) {
        // Merge with existing setups by ID to avoid wiping other users' setups
        const setupMap = new Map<string, any>();
        globalCustomSetups.forEach((s) => setupMap.set(s.id, s));
        setupsList.forEach((s) => setupMap.set(s.id, s));

        globalCustomSetups = Array.from(setupMap.values());
        fs.writeFileSync(setupsFile, JSON.stringify(globalCustomSetups, null, 2), 'utf-8');

        broadcastRealtimeEvent('SETUPS_UPDATED', globalCustomSetups);

        res.json({ success: true, message: 'Setups saved globally', count: globalCustomSetups.length });
      } else {
        res.status(400).json({ success: false, error: 'Expected array of setups' });
      }
    } catch (err: any) {
      console.error('Error saving setups:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/setups/add - Add single new setup or update existing setup
  app.post('/api/setups/add', (req, res) => {
    try {
      const newSetup = req.body;
      if (!newSetup || !newSetup.id) {
        return res.status(400).json({ success: false, error: 'Valid setup object with ID is required' });
      }

      const existingIndex = globalCustomSetups.findIndex((s) => s.id === newSetup.id);
      if (existingIndex !== -1) {
        globalCustomSetups[existingIndex] = { ...globalCustomSetups[existingIndex], ...newSetup };
      } else {
        globalCustomSetups.unshift(newSetup);
      }

      fs.writeFileSync(setupsFile, JSON.stringify(globalCustomSetups, null, 2), 'utf-8');

      broadcastRealtimeEvent('SETUPS_UPDATED', globalCustomSetups);

      res.json({ success: true, message: 'Setup added/updated globally', setup: newSetup });
    } catch (err: any) {
      console.error('Error adding setup:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/setups/:id - Delete setup globally across all accounts
  app.delete('/api/setups/:id', (req, res) => {
    try {
      const setupId = req.params.id;
      globalCustomSetups = globalCustomSetups.filter((s) => s.id !== setupId);
      fs.writeFileSync(setupsFile, JSON.stringify(globalCustomSetups, null, 2), 'utf-8');

      broadcastRealtimeEvent('SETUPS_UPDATED', globalCustomSetups);

      res.json({ success: true, message: 'Setup deleted globally', setupId });
    } catch (err: any) {
      console.error('Error deleting setup:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // SETUP COMMENTS API ROUTES (REALTIME DISCUSSIONS)
  // ==========================================

  // GET /api/comments - Fetch globally stored discussion comments
  app.get('/api/comments', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      comments: globalCommentsList,
    });
  });

  // POST /api/comments - Save / sync discussion comments globally and broadcast instantly
  app.post('/api/comments', (req, res) => {
    try {
      const commentsData = req.body;
      if (Array.isArray(commentsData)) {
        globalCommentsList = commentsData;
        fs.writeFileSync(commentsFile, JSON.stringify(globalCommentsList, null, 2), 'utf-8');

        broadcastRealtimeEvent('COMMENTS_UPDATED', globalCommentsList);

        res.json({ success: true, message: 'Comments updated globally', count: globalCommentsList.length });
      } else {
        res.status(400).json({ success: false, error: 'Expected array of comments' });
      }
    } catch (err: any) {
      console.error('Error saving comments:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // USER ACCOUNT & ADMIN MANAGEMENT API ROUTES
  // ==========================================

  // GET /api/users - Fetch all registered users
  app.get('/api/users', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      users: globalUsersList.map((u) => ({
        username: u.username,
        badge: u.badge || 'Community',
        role: u.role || (u.isAdmin ? 'admin' : 'user'),
        isAdmin: Boolean(u.isAdmin || u.role === 'admin' || u.username.toLowerCase() === 'admin'),
        bio: u.bio || '',
        createdAt: u.createdAt || '2026-01-01',
      })),
    });
  });

  // POST /api/auth/login - Authenticate user credentials
  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password required' });
      }

      const found = globalUsersList.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!found) {
        return res.status(401).json({ success: false, error: 'Kullanıcı bulunamadı.' });
      }

      if (found.password && found.password !== password) {
        return res.status(401).json({ success: false, error: 'Hatalı şifre.' });
      }

      const isAdmin = Boolean(found.isAdmin || found.role === 'admin' || found.username.toLowerCase() === 'admin');

      const userSession = {
        username: found.username,
        badge: found.badge || 'Community',
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin,
        bio: found.bio || '',
        createdAt: found.createdAt || new Date().toISOString().split('T')[0],
      };

      res.json({
        success: true,
        user: userSession,
      });
    } catch (err: any) {
      console.error('Error logging in:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/auth/register - Register new user account
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, password, badge, bio, isAdmin, role } = req.body;
      const cleanUsername = username?.trim();

      if (!cleanUsername || !password) {
        return res.status(400).json({ success: false, error: 'Kullanıcı adı ve şifre zorunludur.' });
      }

      const exists = globalUsersList.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (exists) {
        return res.status(400).json({ success: false, error: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }

      const isUserAdmin = Boolean(isAdmin || role === 'admin' || cleanUsername.toLowerCase() === 'admin');

      const newUser = {
        username: cleanUsername,
        password: password,
        badge: badge || 'Community',
        role: isUserAdmin ? 'admin' : (role || 'user'),
        isAdmin: isUserAdmin,
        bio: bio || '',
        createdAt: new Date().toISOString().split('T')[0],
      };

      globalUsersList.push(newUser);
      fs.writeFileSync(usersFile, JSON.stringify(globalUsersList, null, 2), 'utf-8');

      broadcastRealtimeEvent('USERS_UPDATED', globalUsersList);

      res.json({
        success: true,
        user: {
          username: newUser.username,
          badge: newUser.badge,
          role: newUser.role,
          isAdmin: newUser.isAdmin,
          bio: newUser.bio,
          createdAt: newUser.createdAt,
        },
      });
    } catch (err: any) {
      console.error('Error registering user:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/admin/users - Admin creates new user account
  app.post('/api/admin/users', (req, res) => {
    try {
      const { username, password, badge, role, isAdmin, bio } = req.body;
      const cleanUsername = username?.trim();

      if (!cleanUsername || !password) {
        return res.status(400).json({ success: false, error: 'Kullanıcı adı ve şifre gereklidir.' });
      }

      const exists = globalUsersList.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (exists) {
        return res.status(400).json({ success: false, error: 'Bu kullanıcı adı zaten mevcut.' });
      }

      const isUserAdmin = Boolean(isAdmin || role === 'admin');

      const newUser = {
        username: cleanUsername,
        password: password,
        badge: badge || (isUserAdmin ? 'Admin / Founder' : 'Community'),
        role: isUserAdmin ? 'admin' : 'user',
        isAdmin: isUserAdmin,
        bio: bio || '',
        createdAt: new Date().toISOString().split('T')[0],
      };

      globalUsersList.push(newUser);
      fs.writeFileSync(usersFile, JSON.stringify(globalUsersList, null, 2), 'utf-8');

      broadcastRealtimeEvent('USERS_UPDATED', globalUsersList);

      res.json({
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu.',
        users: globalUsersList,
      });
    } catch (err: any) {
      console.error('Error creating user via admin:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /api/admin/users/:username - Admin updates user account (role, isAdmin, badge, password)
  app.put('/api/admin/users/:username', (req, res) => {
    try {
      const targetUsername = req.params.username;
      const { isAdmin, role, badge, password, bio } = req.body;

      const userIndex = globalUsersList.findIndex(
        (u) => u.username.toLowerCase() === targetUsername.toLowerCase()
      );

      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
      }

      const currentUser = globalUsersList[userIndex];
      const newIsAdmin = isAdmin !== undefined ? Boolean(isAdmin) : (role === 'admin' ? true : currentUser.isAdmin);

      globalUsersList[userIndex] = {
        ...currentUser,
        badge: badge || currentUser.badge,
        role: newIsAdmin ? 'admin' : 'user',
        isAdmin: newIsAdmin,
        password: password || currentUser.password,
        bio: bio !== undefined ? bio : currentUser.bio,
      };

      fs.writeFileSync(usersFile, JSON.stringify(globalUsersList, null, 2), 'utf-8');

      broadcastRealtimeEvent('USERS_UPDATED', globalUsersList);

      res.json({
        success: true,
        message: 'Kullanıcı bilgileri güncellendi.',
        users: globalUsersList,
      });
    } catch (err: any) {
      console.error('Error updating user:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/admin/users/:username - Admin deletes user account
  app.delete('/api/admin/users/:username', (req, res) => {
    try {
      const targetUsername = req.params.username;

      if (targetUsername.toLowerCase() === 'admin') {
        return res.status(403).json({ success: false, error: 'Ana admin hesabı silinemez.' });
      }

      const initialCount = globalUsersList.length;
      globalUsersList = globalUsersList.filter(
        (u) => u.username.toLowerCase() !== targetUsername.toLowerCase()
      );

      if (globalUsersList.length === initialCount) {
        return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
      }

      fs.writeFileSync(usersFile, JSON.stringify(globalUsersList, null, 2), 'utf-8');

      broadcastRealtimeEvent('USERS_UPDATED', globalUsersList);

      res.json({
        success: true,
        message: 'Kullanıcı hesabı silindi.',
        users: globalUsersList,
      });
    } catch (err: any) {
      console.error('Error deleting user:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/engineer/chat - Dynamic conversational AI Race Engineer powered by Gemini & Telemetry Physics
  app.post('/api/engineer/chat', handleEngineerChat);

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏎️ DDLSetupMarket Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

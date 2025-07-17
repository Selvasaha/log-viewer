# ⚡ Dev Log Viewer

A lightweight, no-dependency HTML-based log viewer — fully offline, dark/light theme switcher, multi-log file tabbing, live donut chart for log levels, filter buttons, timestamp highlighting, and smooth scrolling. Powered by pure JavaScript, SCSS, and ✨vibes✨.

## 🚀 Features

- 📁 Upload multiple `.txt` log files at once
- 🧭 Tab-based navigation for switching between files
- 🍩 Dynamic donut chart for visual log level distribution
- 🎯 Filter logs by type: Info, Warn, Error, Debug
- 🌗 Dark / Light theme toggle (custom CSS variables)
- 🧻 Wrap toggle for better readability of long log lines
- 🔍 Keyword search with instant filtering
- ⏱️ Timestamp highlighting for better parsing
- ⬆⬇ Smooth scroll to top/bottom of logs
- ❌ Clear files with one click

## 📦 Tech Stack

- Vanilla JS (no frameworks)
- Chart.js (donut chart)
- Pure SCSS/CSS
- No dependencies, no build tools, zero fuss

## 🌩️ Live Preview

> [🔗 Hosted on GitHub Pages](https://selvasaha.github.io/log-viewer/)

_(Replace with your actual deployed link)_

## 🧠 How it Works

Logs are parsed line by line in the browser after upload — no server, no storage. Tabs are dynamically created per file, and log levels are extracted using keywords like `INFO`, `WARN`, `ERROR`, `DEBUG`.

Donut chart updates live based on what's filtered and visible. Everything runs in memory — lightweight and fast.

## 🖼️ Screenshot

![Dev Log Viewer Screenshot](screenshot.png)

_(Add your screenshot file in the repo)_



## 🚧 Dev Tips

- Use modern browsers for best SVG + Chart.js support
- SVG favicon may need correct MIME type when served locally
- Run via local server if needed: `npx serve .` or open directly

## 🧙 Author

Made with 💻 and ⚡ by [YourName](https://github.com/your-username)

## 🪪 License

MIT — free to fork, modify, remix.

---



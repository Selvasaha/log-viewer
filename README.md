# ⚡ Dev Log Viewer

**A sleek, fully offline, multi-log file inspector built using plain HTML, CSS, and JavaScript — zero dependencies, maximum clarity.**  
View multiple log files, filter by level, search instantly, and explore clean visual summaries using a donut chart.

---

## 🧩 Core Features

| Feature | Description |
|--------|-------------|
| 📁 **Multi File Upload** | Drag/drop or select multiple `.txt` log files |
| 🧙‍♂️ **Dynamic Tabs** | Instantly switch between logs via generated tab interface |
| 🍩 **Log Donut Chart** | Chart.js-powered donut shows log level distribution |
| 🎯 **Filter Buttons** | Toggle filters for `INFO`, `WARN`, `ERROR`, `DEBUG` |
| 🔍 **Live Search** | Search and highlight matching log lines in real-time |
| 🧻 **Wrap Toggle** | Toggle wrap for long lines or multiline logs |
| ⏱️ **Timestamp Detection** | Timestamps automatically highlighted and styled |
| 🌗 **Theme Toggle** | Switch between light/dark using custom CSS variables |
| ⬆⬇ **Scroll Jumpers** | Smooth scroll to head or tail of logs |
| ❌ **Clear Logs** | One-click reset to remove all files and chart

---

## 🛠 Implementation Highlights

- **Vanilla JavaScript (ES6+)** — no frameworks, no build tools
- **Chart.js (Doughnut Chart)** for visualizing log levels
- **Dynamic DOM Rendering** — tabs, logs, filters, and chart are fully JS-controlled
- **State-Synced Filters** — toggle buttons and legend stay in sync
- **Semantic HTML + Custom CSS Variables** — themed and responsive
- **Fully Offline** — all logs are read locally via FileReader, no network used

---

## 🖼 Screenshot

![Dev Log Viewer Screenshot](screenshot.png)

---

## 🔍 Try It Live

> **🔗 View App:** [https://selvasaha.github.io/log-viewer](https://selvasaha.github.io/log-viewer)

> Open the page, drop any `.txt` log files, and explore.

---

## 🧪 Sample Log File

Need a test log?  
<a href="example-log.txt" download>📄 Download example-log.txt</a>  
Includes a mix of `INFO`, `WARN`, `ERROR`, and `DEBUG` entries with timestamps.

---

## 📚 Tech Stack

- ✅ HTML5 + CSS3 (custom properties for theming)
- ✅ Vanilla JavaScript
- ✅ Chart.js (via CDN)
- ❌ No SCSS, no frameworks, no build tools

---

## 🪛 Developer Tips

- Use `npx serve .` or a local server for full experience (favicon, chart)
- Works best in Chrome/Edge/Firefox
- View source to see clearly structured regions:
  - `#region State`, `#region Filters`, `#region Chart`, etc.

---

![MIT License](https://img.shields.io/badge/license-MIT-blue)
![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)

const fileInput = document.getElementById('fileInput');
const logTable = document.getElementById('logTable');
const searchInput = document.getElementById('searchInput');
const body = document.body;
const toggleButtons = document.querySelectorAll('.toggle-btn');
const allBtn = document.getElementById('btn-all');
const logChartCtx = document.getElementById('logChart').getContext('2d');
const donutSection = document.getElementById('donutSection');
const donutCenter = document.getElementById('donutCenter');
const tabBar = document.getElementById('fileTabs');

let wrapEnabled = false;
let logChart;
let filesMap = {}; // id -> { name, content }
let currentFileId = null;

donutSection.style.display = 'none';
donutCenter.style.display = 'none';

fileInput.addEventListener('change', () => {
  Array.from(fileInput.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const id = `${file.name}-${Date.now()}`;
      filesMap[id] = {
        name: file.name,
        content: e.target.result.split('\n')
      };
      createTab(id, file.name);
      switchToFile(id);
    };
    reader.readAsText(file);
  });
  fileInput.value = '';
});

function createTab(fileId, fileName) {
  const tab = document.createElement('div');
  tab.classList.add('tab');
  tab.dataset.id = fileId;
  tab.textContent = fileName;

  // 📌 Click to switch
  tab.addEventListener('click', () => {
    switchToFile(fileId);
  });

  // ❌ Close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Don't trigger tab switch
  const wasActive = tab.classList.contains('active');
  const tabBar = document.getElementById('fileTabs');

  // 👀 Get all tabs BEFORE removing
  const allTabs = Array.from(tabBar.querySelectorAll('.tab'));
  const index = allTabs.findIndex(t => t.dataset.id === fileId);

  // Remove tab
  tabBar.removeChild(tab);

  if (!wasActive) return;

  // 👇 Logic for selecting nearest tab
  const nextTab = allTabs[index + 1];
  const prevTab = allTabs[index - 1];

  const fallbackTab = nextTab || prevTab;
  if (fallbackTab) {
    switchToFile(fallbackTab.dataset.id);
  } else {
    // No tabs left — reset
    currentFile = null;
    currentLines = [];
    logTable.innerHTML = '';
    donutCenter.textContent = '';
    donutSection.style.display = 'none';
    donutCenter.style.display = 'none';
    document.getElementById('clearBtn').style.display = 'none';
    if (logChart) {
      logChart.destroy();
      logChart = null;
    }
    document.getElementById('logLegend').innerHTML = '';
  }
});


  tab.appendChild(closeBtn);
  document.getElementById('fileTabs').appendChild(tab);
}

function switchToFile(id) {
  if (!filesMap[id]) return;
  currentFileId = id;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.id === id);
  });

  const data = filesMap[id];
  renderLogs(data.content);
  donutSection.style.display = 'block';
  donutCenter.style.display = 'block';
  document.getElementById('clearBtn').style.display = 'inline-block';
}

document.getElementById('clearBtn').addEventListener('click', () => {
  filesMap = {};
  currentFileId = null;
  tabBar.innerHTML = '';
  logTable.innerHTML = '';
  donutCenter.textContent = '';
  donutSection.style.display = 'none';
  donutCenter.style.display = 'none';
  document.getElementById('clearBtn').style.display = 'none';
  if (logChart) {
    logChart.destroy();
    logChart = null;
  }
  document.getElementById('logLegend').innerHTML = '';
});

toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.type === 'all') {
      const activating = !btn.classList.contains('active');
      toggleButtons.forEach(b => {
        if (b !== btn) b.classList.toggle('active', activating);
      });
      btn.classList.toggle('active', activating);
    } else {
      btn.classList.toggle('active');
      const individualBtns = [...toggleButtons].filter(b => b.dataset.type !== 'all');
      const allActive = individualBtns.every(b => b.classList.contains('active'));
      allBtn.classList.toggle('active', allActive);
    }
    const data = filesMap[currentFileId];
    if (data) renderLogs(data.content);
  });
});

searchInput.addEventListener('input', () => {
  const data = filesMap[currentFileId];
  if (data) renderLogs(data.content);
});

function renderLogs(lines) {
  const activeTypes = [...toggleButtons]
    .filter(btn => btn.classList.contains('active') && btn.dataset.type !== 'all')
    .map(btn => btn.dataset.type);

  const keyword = searchInput.value.toLowerCase();
  logTable.innerHTML = '';
  let counts = { info: 0, warn: 0, error: 0, debug: 0 };

  lines.forEach((line, index) => {
    const level = getLevel(line);
    if (level && counts[level] !== undefined) counts[level]++;
    if ((activeTypes.includes(level)) && (!keyword || line.toLowerCase().includes(keyword))) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td class="log-cell ${level} ${wrapEnabled ? 'wrapped' : ''}">${highlightTimestamp(line)}</td>
      `;
      logTable.appendChild(row);
    }
  });

  updateChart(counts);
}

function getLevel(line) {
  if (line.includes(' ERROR ')) return 'error';
  if (line.includes(' WARN ') || line.includes(' WARNING ')) return 'warn';
  if (line.includes(' INFO ')) return 'info';
  if (line.includes(' DEBUG ')) return 'debug';
  return '';
}

function highlightTimestamp(line) {
  const escaped = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/^(\d{4}-\d{2}-\d{2}@\d{2}:\d{2}:\d{2}\.\d{3})/, '<span class="timestamp">$1</span>');
}

function updateChart(counts) {
  const labels = ['Info', 'Warn', 'Error', 'Debug'];
  const levels = ['info', 'warn', 'error', 'debug'];
  const colors = levels.map(l => getComputedStyle(body).getPropertyValue(`--${l}`).trim());
  const values = levels.map(l => counts[l]);
  donutCenter.textContent = values.filter(v => v > 0).length;

  const legend = document.getElementById('logLegend');
  legend.innerHTML = '';
  levels.forEach((level, i) => {
    if (counts[level] > 0) {
      legend.innerHTML += `
        <div class="legend-item">
          <span class="legend-color" style="background:${colors[i]}"></span>
          <span>${labels[i]}: ${counts[level]}</span>
        </div>
      `;
    }
  });

  if (logChart) {
    logChart.data.datasets[0].data = values;
    logChart.update();
  } else {
    logChart = new Chart(logChartCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  }
}

function goToTail() {
  smoothScrollTo(document.body.scrollHeight, 600);
}

function goToHead() {
  smoothScrollTo(0, 600);
}

function smoothScrollTo(target, duration) {
  const start = window.scrollY;
  const startTime = performance.now();

  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    window.scrollTo(0, start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(scroll);
  }

  requestAnimationFrame(scroll);
}

function toggleTheme() {
  const theme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', theme);
}

function toggleWrap() {
  wrapEnabled = !wrapEnabled;
  document.getElementById('wrapToggleBtn').textContent = wrapEnabled ? '📏 No Wrap' : '🧻 Wrap';
  const data = filesMap[currentFileId];
  if (data) renderLogs(data.content);
}



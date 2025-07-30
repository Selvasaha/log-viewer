// #region DOM References
const fileInput = document.getElementById('fileInput');
const logTable = document.getElementById('logTable');
const searchInput = document.getElementById('searchInput');
const body = document.body;
const logChartCtx = document.getElementById('logChart').getContext('2d');
const donutSection = document.getElementById('donutSection');
const donutCenter = document.getElementById('donutCenter');
const tabBar = document.getElementById('fileTabs');
const filterBtnContainer = document.querySelector('.header-left');
// #endregion

// #region State Variables
let wrapEnabled = false;
let logChart;
let filesMap = {};
let currentFileId = null;
let activeFilters = [];
let availableLogLevels = [];
// #endregion

// #region Initial UI Setup
donutSection.style.display = 'none';
donutCenter.style.display = 'none';
// #endregion

// #region File Input Handler
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
// #endregion

// #region Tab Management
function createTab(fileId, fileName) {
  const tab = document.createElement('div');
  tab.classList.add('tab');
  tab.dataset.id = fileId;
  tab.textContent = fileName;

  tab.addEventListener('click', () => switchToFile(fileId));

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasActive = tab.classList.contains('active');
    const allTabs = Array.from(tabBar.querySelectorAll('.tab'));
    const index = allTabs.findIndex(t => t.dataset.id === fileId);
    tabBar.removeChild(tab);

    if (!wasActive) return;

    const nextTab = allTabs[index + 1];
    const prevTab = allTabs[index - 1];
    const fallbackTab = nextTab || prevTab;
    if (fallbackTab) {
      switchToFile(fallbackTab.dataset.id);
    } else {
      currentFileId = null;
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
      removeFilterButtons();
    }
  });

  tab.appendChild(closeBtn);
  tabBar.appendChild(tab);
}

function switchToFile(id) {
  if (!filesMap[id]) return;
  currentFileId = id;

  document.querySelectorAll('.tab').forEach(tab =>
    tab.classList.toggle('active', tab.dataset.id === id)
  );

  donutSection.style.display = 'block';
  donutCenter.style.display = 'block';
  document.getElementById('clearBtn').style.display = 'inline-block';
  analyzeLevelsAndRender(filesMap[id].content);
}
// #endregion

// #region Clear All Button
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
  removeFilterButtons();
});
// #endregion

// #region Search Filter
searchInput.addEventListener('input', () => {
  const data = filesMap[currentFileId];
  if (data) renderLogs(data.content);
});
// #endregion

// #region Render Logs Table
function analyzeLevelsAndRender(lines) {
  const found = new Set();
  lines.forEach(line => {
    const level = getLevel(line);
    if (level) found.add(level);
  });
  availableLogLevels = [...found];
  activeFilters = [...found];

  generateFilterButtons();
  renderLogs(lines);
}

function renderLogs(lines) {
  const keyword = searchInput.value.toLowerCase();
  logTable.innerHTML = '';
  let counts = { info: 0, warn: 0, error: 0, debug: 0 };
  let visibleCount = 0;

  lines.forEach((line, index) => {
    const level = getLevel(line);
    if (level && counts[level] !== undefined) counts[level]++;
    if ((activeFilters.includes(level)) && (!keyword || line.toLowerCase().includes(keyword))) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td class="log-cell ${level} ${wrapEnabled ? 'wrapped' : ''}">${highlightTimestamp(line)}</td>
      `;
      logTable.appendChild(row);
      visibleCount++;
    }
  });

  updateChart(counts, visibleCount);
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
// #endregion

// #region Filter Buttons / Legend Sync
function generateFilterButtons() {
  removeFilterButtons();

  // Add "All" button first (no initial active class!)
  const allBtn = document.createElement('button');
  allBtn.className = 'toggle-btn';
  allBtn.dataset.level = 'all';
  allBtn.dataset.type = 'all';
  allBtn.id = 'btn-all';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => {
    const allActive = activeFilters.length === availableLogLevels.length;
    if (allActive) {
      activeFilters = [];
      availableLogLevels.forEach(l => document.getElementById(`btn-${l}`)?.classList.remove('active'));
      document.querySelectorAll('.legend-item').forEach(el => el.classList.add('striked'));
    } else {
      activeFilters = [...availableLogLevels];
      availableLogLevels.forEach(l => document.getElementById(`btn-${l}`)?.classList.add('active'));
      document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('striked'));
    }
    renderLogs(filesMap[currentFileId].content);
    syncAllButtonState();
  });
  filterBtnContainer.appendChild(allBtn);

  // Then log level buttons
  availableLogLevels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn active';
    btn.dataset.level = level;
    btn.dataset.type = level;
    btn.id = `btn-${level}`;
    btn.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        activeFilters.push(level);
      } else {
        activeFilters = activeFilters.filter(f => f !== level);
      }
      renderLogs(filesMap[currentFileId].content);
      syncAllButtonState();
    });
    filterBtnContainer.appendChild(btn);
  });

  syncAllButtonState();
}

function syncAllButtonState() {
  const allBtn = document.getElementById('btn-all');
  if (!allBtn) return;
  const allActive = activeFilters.length === availableLogLevels.length;
  allBtn.classList.toggle('active', allActive);
}

function removeFilterButtons() {
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.remove());
}
// #endregion

// #region Log Chart + Legend
function updateChart(counts, visibleCount = null) {
  const levels = availableLogLevels;
  const labels = levels.map(l => l.charAt(0).toUpperCase() + l.slice(1));
  const colors = levels.map(l => getComputedStyle(body).getPropertyValue(`--${l}`).trim());
  const values = levels.map(l => counts[l] || 0);
  // donutCenter.textContent = values.filter(v => v > 0).length;
  const total = visibleCount ?? values.reduce((a, b) => a + b, 0);
  donutCenter.textContent = total;

  const legend = document.getElementById('logLegend');
  legend.innerHTML = '';
  levels.forEach((level, i) => {
    if (counts[level] > 0) {
      const item = document.createElement('div');
      item.className = 'legend-item' + (activeFilters.includes(level) ? '' : ' striked');
      item.innerHTML = `
        <span class="legend-color" style="background:${colors[i]}"></span>
        <span>${labels[i]}: ${counts[level]}</span>
      `;
      item.addEventListener('click', () => {
        const index = activeFilters.indexOf(level);
        if (index > -1) {
          activeFilters.splice(index, 1);
          document.getElementById(`btn-${level}`)?.classList.remove('active');
          item.classList.add('striked');
        } else {
          activeFilters.push(level);
          document.getElementById(`btn-${level}`)?.classList.add('active');
          item.classList.remove('striked');
        }
        renderLogs(filesMap[currentFileId].content);
        syncAllButtonState();
      });
      legend.appendChild(item);
    }
  });

  const visibleValues = levels.map((l, i) =>
    activeFilters.includes(l) ? values[i] : 0
  );

  if (logChart) {
    logChart.data.datasets[0].data = visibleValues;
    logChart.data.labels = labels;
    logChart.update();
  } else {
    logChart = new Chart(logChartCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: visibleValues, backgroundColor: colors }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  }
}
// #endregion

// #region Scroll Controls
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
// #endregion

// #region Theme & Wrap Toggle
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
// #endregion

// #region Responsive Offsets (Header, Thead)
window.addEventListener('load', () => {
  const header = document.querySelector('header');
  const thead = document.querySelector('thead');

  const updateOffsets = () => {
    const headerHeight = header.offsetHeight;
    document.body.style.paddingTop = `${headerHeight}px`;
    thead.style.top = `${headerHeight}px`;
  };

  updateOffsets();
  const observer = new MutationObserver(updateOffsets);
  observer.observe(header, { childList: true, subtree: true, attributes: true });
});
// #endregion

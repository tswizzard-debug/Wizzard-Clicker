const wizard = document.getElementById('wizard');
const manaEl = document.getElementById('mana');
const mpsEl = document.getElementById('mps');
const mpcEl = document.getElementById('mpc');
const upgradeList = document.getElementById('upgrade-list');
const floatingContainer = document.getElementById('floating-text-container');
 
const settingsBtn = document.getElementById('settings-btn');
const closeSettingsBtn = document.getElementById('close-settings');
const settingsPanel = document.getElementById('settings-panel');
const sfxVolumeSlider = document.getElementById('sfx-volume');
const musicVolumeSlider = document.getElementById('music-volume');
const muteToggleBtn = document.getElementById('mute-toggle');
const eventsToggleBtn = document.getElementById('events-toggle');
const resetSaveBtn = document.getElementById('reset-save');
 
const confirmModal = document.getElementById('confirm-modal');
const cancelResetBtn = document.getElementById('cancel-reset');
const confirmResetBtn = document.getElementById('confirm-reset');
 
const secretInput = document.getElementById('secret-input');
const secretHint = document.getElementById('secret-hint');
 
const adminPanel = document.getElementById('admin-panel');
const closeAdminBtn = document.getElementById('close-admin');
const adminManaBtn = document.getElementById('admin-mana');
const adminClicksBtn = document.getElementById('admin-clicks');
const adminMaxBtn = document.getElementById('admin-max');
const adminStormBtn = document.getElementById('admin-storm');
const adminDarkBtn = document.getElementById('admin-dark');
const adminTreasureBtn = document.getElementById('admin-treasure');
const adminRandomBtn = document.getElementById('admin-random');
const adminGodBtn = document.getElementById('admin-god');
const adminResetBtn = document.getElementById('admin-reset');
 
const eventToast = document.getElementById('event-toast');
const eventTitle = document.getElementById('event-title');
const eventDesc = document.getElementById('event-desc');
const eventTimer = document.getElementById('event-timer');
 
const ADMIN_CODE = 'TsWizzardIsTuff';
 
let audioCtx = null;
let sfxGain = null;
let musicGain = null;
let musicStarted = false;
let musicInterval = null;
 
let activeEvent = null;
let eventTimeout = null;
let eventEffectTimeout = null;
let eventUpdateInterval = null;
let godMode = false;
 
let settings = {
  sfxVolume: 0.5,
  musicVolume: 0.3,
  muted: false,
  eventsEnabled: true,
};
 
let game = {
  mana: 0,
  totalClicks: 0,
  manaPerClick: 1,
  upgrades: [],
};
 
const upgradeDefs = [
  { id: 'apprentice', name: 'Apprentice Wizzard', icon: '🧙', baseCps: 1, baseCost: 15, desc: 'A fresh student of the arcane' },
  { id: 'wand', name: 'Magic Wand', icon: '✨', baseCps: 3, baseCost: 50, desc: 'Focuses your spell power' },
  { id: 'tome', name: 'Spell Tome', icon: '📜', baseCps: 10, baseCost: 200, desc: 'Ancient recipes for mana' },
  { id: 'crystal', name: 'Crystal Ball', icon: '🔮', baseCps: 25, baseCost: 750, desc: 'Sees and gathers mana' },
  { id: 'potion', name: 'Potion Brew', icon: '🧪', baseCps: 60, baseCost: 2000, desc: 'Bubbles with raw magic' },
  { id: 'staff', name: 'Enchanted Staff', icon: '🦯', baseCps: 150, baseCost: 6000, desc: 'A walking stick of power' },
  { id: 'tower', name: 'Wizard Tower', icon: '🏰', baseCps: 400, baseCost: 15000, desc: 'A tall spire of sorcery' },
  { id: 'dragon', name: 'Dragon Familiar', icon: '🐉', baseCps: 1000, baseCost: 40000, desc: 'Hoards mana, not gold' },
  { id: 'library', name: 'Arcane Library', icon: '📚', baseCps: 2500, baseCost: 100000, desc: 'Knowledge is power' },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥', baseCps: 6000, baseCost: 250000, desc: 'Reborn in pure mana' },
  { id: 'elder', name: 'Elder Wizzard', icon: '🧙‍♂️', baseCps: 15000, baseCost: 600000, desc: 'A master of the weave' },
  { id: 'portal', name: 'Infinite Portal', icon: '🌀', baseCps: 50000, baseCost: 2000000, desc: 'Mana from another realm' },
  { id: 'constellation', name: 'Star Constellation', icon: '⭐', baseCps: 150000, baseCost: 8000000, desc: 'The stars lend their power' },
  { id: 'god', name: 'Arcane Deity', icon: '☄️', baseCps: 500000, baseCost: 30000000, desc: 'A god of magic itself' },
];
 
const events = [
  {
    id: 'mana-storm',
    title: 'Mana Storm',
    desc: 'The arcane winds blow! +50% mana/sec for 20 seconds.',
    duration: 20000,
    type: 'buff',
    apply: () => { if (!activeEvent) activeEvent = { type: 'mpsMultiplier', value: 1.5 }; },
    icon: '⛈️',
  },
  {
    id: 'spell-surge',
    title: 'Spell Surge',
    desc: 'Your clicks crackle with power! Double click mana for 15 seconds.',
    duration: 15000,
    type: 'buff',
    apply: () => { if (!activeEvent) activeEvent = { type: 'clickMultiplier', value: 2 }; },
    icon: '⚡',
  },
  {
    id: 'treasure-horde',
    title: 'Treasure Horde',
    desc: 'A wandering imp dropped a mana pouch!',
    duration: 0,
    type: 'instant',
    apply: () => { game.mana += 200; },
    icon: '💰',
  },
  {
    id: 'time-warp',
    title: 'Time Warp',
    desc: 'You glimpse the future and claim 30 seconds of mana now!',
    duration: 0,
    type: 'instant',
    apply: () => { game.mana += getTotalMps() * 30; },
    icon: '⏳',
  },
  {
    id: 'dark-pact',
    title: 'Dark Pact',
    desc: 'Sacrifice 10% mana for 2x mana/sec for 25 seconds.',
    duration: 25000,
    type: 'danger',
    apply: () => {
      game.mana *= 0.9;
      if (!activeEvent) activeEvent = { type: 'mpsMultiplier', value: 2 };
    },
    icon: '☠️',
  },
  {
    id: 'fairy-blessing',
    title: 'Fairy Blessing',
    desc: 'Upgrade costs are reduced by 20% for 20 seconds.',
    duration: 20000,
    type: 'buff',
    apply: () => { if (!activeEvent) activeEvent = { type: 'discount', value: 0.8 }; },
    icon: '🧚',
  },
  {
    id: 'magical-mutation',
    title: 'Magical Mutation',
    desc: 'A stray spell grants a random upgrade for free!',
    duration: 0,
    type: 'instant',
    apply: () => {
      const owned = game.upgrades.filter(u => u.count > 0);
      if (owned.length === 0) {
        const apprentice = getUpgradeState('apprentice');
        grantUpgrade(apprentice, upgradeDefs.find(d => d.id === 'apprentice'));
      } else {
        const random = owned[Math.floor(Math.random() * owned.length)];
        const def = upgradeDefs.find(d => d.id === random.id);
        grantUpgrade(random, def);
      }
    },
    icon: '🎁',
  },
];
 
function grantUpgrade(u, def) {
  u.count += 1;
  u.cost = Math.floor(def.baseCost * Math.pow(1.2, u.count));
  playBuySound();
}
 
function loadSettings() {
  const saved = localStorage.getItem('wizzardClickerSettings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      settings = { ...settings, ...parsed };
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }
  sfxVolumeSlider.value = Math.round(settings.sfxVolume * 100);
  musicVolumeSlider.value = Math.round(settings.musicVolume * 100);
  updateMuteButton();
  updateEventsButton();
}
 
function saveSettings() {
  localStorage.setItem('wizzardClickerSettings', JSON.stringify(settings));
}
 
function loadGame() {
  const saved = localStorage.getItem('wizzardClickerSave');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      game.mana = parsed.mana || 0;
      game.totalClicks = parsed.totalClicks || 0;
      game.manaPerClick = parsed.manaPerClick || 1;
      game.upgrades = parsed.upgrades || [];
    } catch (e) {
      console.error('Failed to load save', e);
    }
  }
 
  if (game.upgrades.length === 0) {
    game.upgrades = upgradeDefs.map(def => ({
      id: def.id,
      count: 0,
      cost: def.baseCost,
    }));
  } else {
    upgradeDefs.forEach(def => {
      if (!game.upgrades.find(u => u.id === def.id)) {
        game.upgrades.push({ id: def.id, count: 0, cost: def.baseCost });
      }
    });
  }
}
 
function saveGame() {
  localStorage.setItem('wizzardClickerSave', JSON.stringify(game));
}
 
function formatNumber(n) {
  if (n < 1000) return Math.floor(n).toString();
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const i = Math.floor(Math.log10(n) / 3);
  const short = (n / Math.pow(1000, i)).toFixed(2).replace(/\.00$/, '');
  return `${short} ${suffixes[i]}`;
}
 
function getUpgradeState(id) {
  return game.upgrades.find(u => u.id === id);
}
 
function getTotalMps() {
  let base = game.upgrades.reduce((sum, u) => {
    const def = upgradeDefs.find(d => d.id === u.id);
    return sum + (u.count * def.baseCps);
  }, 0);
  if (activeEvent && activeEvent.type === 'mpsMultiplier') {
    base *= activeEvent.value;
  }
  return base;
}
 
function getCurrentCost(baseCost, count) {
  let cost = Math.floor(baseCost * Math.pow(1.2, count));
  if (activeEvent && activeEvent.type === 'discount') {
    cost = Math.floor(cost * activeEvent.value);
  }
  return cost;
}
 
function updateDisplay() {
  const mps = getTotalMps();
  manaEl.textContent = formatNumber(game.mana);
  mpsEl.textContent = formatNumber(mps);
  mpcEl.textContent = formatNumber(game.manaPerClick);
 
  game.upgrades.forEach(u => {
    const btn = document.getElementById(`upgrade-${u.id}`);
    if (!btn) return;
 
    const def = upgradeDefs.find(d => d.id === u.id);
    const actualCost = getCurrentCost(def.baseCost, u.count);
    u.cost = actualCost;
    const affordable = game.mana >= actualCost;
 
    btn.classList.toggle('disabled', !affordable);
    btn.classList.toggle('affordable', affordable);
 
    const costEl = btn.querySelector('.upgrade-cost');
    const countEl = btn.querySelector('.upgrade-count');
    if (costEl) costEl.textContent = `${formatNumber(actualCost)} mana`;
    if (countEl) countEl.textContent = `×${u.count}`;
  });
 
  if (adminGodBtn) {
    adminGodBtn.textContent = godMode ? 'God Mode: ON' : 'Toggle God Mode';
    adminGodBtn.classList.toggle('active', godMode);
  }
}
 
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    sfxGain.connect(audioCtx.destination);
    musicGain.connect(audioCtx.destination);
    updateGains();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (!musicStarted) {
    startMusic();
    musicStarted = true;
  }
}
 
function updateGains() {
  if (!audioCtx) return;
  const muted = settings.muted ? 0 : 1;
  sfxGain.gain.setTargetAtTime(settings.sfxVolume * muted, audioCtx.currentTime, 0.05);
  musicGain.gain.setTargetAtTime(settings.musicVolume * muted, audioCtx.currentTime, 0.05);
}
 
function playTone(freq, duration, type = 'sine', volume = 0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
 
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
 
  osc.connect(gain);
  gain.connect(sfxGain);
 
  osc.start(now);
  osc.stop(now + duration + 0.05);
}
 
function playClickSound() {
  playTone(600, 0.12, 'triangle', 0.08);
  playTone(900, 0.08, 'sine', 0.05);
}
 
function playBuySound() {
  playTone(440, 0.1, 'sine', 0.08);
  playTone(660, 0.15, 'sine', 0.08);
  playTone(880, 0.25, 'triangle', 0.08);
}
 
function playErrorSound() {
  playTone(150, 0.15, 'sawtooth', 0.05);
}
 
function playEventSound(type) {
  if (type === 'danger') {
    playTone(120, 0.3, 'sawtooth', 0.08);
    playTone(100, 0.4, 'sawtooth', 0.08);
  } else {
    playTone(523, 0.15, 'sine', 0.08);
    playTone(659, 0.2, 'sine', 0.08);
    playTone(1047, 0.35, 'triangle', 0.08);
  }
}
 
function playUnlockSound() {
  playTone(440, 0.12, 'sine', 0.08);
  playTone(554, 0.12, 'sine', 0.08);
  playTone(659, 0.15, 'sine', 0.08);
  playTone(880, 0.35, 'triangle', 0.08);
}
 
function startMusic() {
  if (!audioCtx) return;
  const notes = [196, 220, 246.94, 293.66, 329.63, 392];
  const noteDurations = [2, 2, 3, 2, 3, 4];
  let step = 0;
 
  function playNote() {
    if (!audioCtx || settings.muted) return;
    const now = audioCtx.currentTime;
    const freq = notes[step % notes.length];
    const duration = noteDurations[step % noteDurations.length] * 0.6;
 
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
 
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
 
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);
 
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
 
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);
 
    osc.start(now);
    osc.stop(now + duration);
 
    step++;
  }
 
  playNote();
  musicInterval = setInterval(playNote, 1200);
}
 
function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}
 
function createFloatingText(x, y, text, color = 'var(--gold)') {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  floatingContainer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
 
function createParticles(x, y) {
  const colors = ['#9b5de5', '#f0c040', '#00f5d4', '#ffffff', '#ff8fa3'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    p.style.setProperty('--tx', `${tx}px`);
    p.style.setProperty('--ty', `${ty}px`);
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    floatingContainer.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}
 
function spawnClickEffects(x, y) {
  const multiplier = (activeEvent && activeEvent.type === 'clickMultiplier') ? activeEvent.value : 1;
  const value = (godMode ? 1000000 : game.manaPerClick) * multiplier;
  const color = (godMode || multiplier > 1) ? 'var(--success)' : 'var(--gold)';
  createFloatingText(x - 20, y - 40, `+${formatNumber(value)}`, color);
  createParticles(x, y);
}
 
function handleClick(e) {
  initAudio();
  const multiplier = (activeEvent && activeEvent.type === 'clickMultiplier') ? activeEvent.value : 1;
  game.mana += (godMode ? 1000000 : game.manaPerClick) * multiplier;
  game.totalClicks += 1;
 
  if (!godMode && game.totalClicks % 50 === 0) {
    game.manaPerClick += 1;
  }
 
  playClickSound();
 
  const rect = wizard.getBoundingClientRect();
  const x = e.clientX || rect.left + rect.width / 2;
  const y = e.clientY || rect.top + rect.height / 2;
  spawnClickEffects(x, y);
 
  wizard.classList.remove('clicked');
  void wizard.offsetWidth;
  wizard.classList.add('clicked');
  const onAnimEnd = () => {
    wizard.classList.remove('clicked');
    wizard.removeEventListener('animationend', onAnimEnd);
  };
  wizard.addEventListener('animationend', onAnimEnd);
 
  updateDisplay();
  saveGame();
}
 
function buyUpgrade(id) {
  initAudio();
  const u = getUpgradeState(id);
  const def = upgradeDefs.find(d => d.id === id);
 
  const actualCost = getCurrentCost(def.baseCost, u.count);
  if (game.mana >= actualCost) {
    game.mana -= actualCost;
    u.count += 1;
    playBuySound();
    updateDisplay();
    saveGame();
  } else {
    playErrorSound();
  }
}
 
function renderUpgrades() {
  upgradeList.innerHTML = '';
  game.upgrades.forEach(u => {
    const def = upgradeDefs.find(d => d.id === u.id);
    const li = document.createElement('li');
    li.id = `upgrade-${u.id}`;
    li.className = 'upgrade-item';
    li.innerHTML = `
      <div class="upgrade-icon">${def.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">
          <span>${def.name}</span>
          <span class="upgrade-count">×${u.count}</span>
        </div>
        <div class="upgrade-desc">${def.desc} — +${formatNumber(def.baseCost)} mana/sec</div>
      </div>
      <div class="upgrade-cost">${formatNumber(getCurrentCost(def.baseCost, u.count))} mana</div>
    `;
    li.addEventListener('click', () => buyUpgrade(u.id));
    upgradeList.appendChild(li);
  });
}
 
function showEvent(event) {
  activeEvent = null;
  event.apply();
  playEventSound(event.type);
 
  eventTitle.textContent = `${event.icon} ${event.title}`;
  eventDesc.textContent = event.desc;
  eventToast.classList.remove('hidden');
  eventToast.classList.toggle('danger', event.type === 'danger');
 
  if (event.duration > 0) {
    const endTime = Date.now() + event.duration;
    eventTimer.textContent = formatEventTime(event.duration);
 
    if (eventUpdateInterval) clearInterval(eventUpdateInterval);
    eventUpdateInterval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining > 0) {
        eventTimer.textContent = formatEventTime(remaining);
      } else {
        eventTimer.textContent = '';
      }
    }, 250);
 
    if (eventTimeout) clearTimeout(eventTimeout);
    eventTimeout = setTimeout(() => {
      hideEvent();
    }, event.duration);
  } else {
    eventTimer.textContent = '';
    if (eventTimeout) clearTimeout(eventTimeout);
    eventTimeout = setTimeout(() => {
      hideEvent();
    }, 4000);
  }
 
  updateDisplay();
  saveGame();
}
 
function hideEvent() {
  eventToast.classList.add('hidden');
  eventToast.classList.remove('danger');
  if (eventUpdateInterval) {
    clearInterval(eventUpdateInterval);
    eventUpdateInterval = null;
  }
  activeEvent = null;
  updateDisplay();
  saveGame();
}
 
function formatEventTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  return `${seconds}s remaining`;
}
 
function scheduleRandomEvent() {
  if (!settings.eventsEnabled) return;
  const delay = 15000 + Math.random() * 25000;
  eventEffectTimeout = setTimeout(() => {
    const event = events[Math.floor(Math.random() * events.length)];
    showEvent(event);
    if (settings.eventsEnabled) scheduleRandomEvent();
  }, delay);
}
 
function updateMuteButton() {
  muteToggleBtn.textContent = settings.muted ? 'On' : 'Off';
  muteToggleBtn.classList.toggle('active', settings.muted);
  updateGains();
}
 
function updateEventsButton() {
  eventsToggleBtn.textContent = settings.eventsEnabled ? 'On' : 'Off';
  eventsToggleBtn.classList.toggle('active', settings.eventsEnabled);
}
 
function toggleSettings(show) {
  settingsPanel.classList.toggle('hidden', !show);
  if (!show) {
    secretInput.value = '';
    secretHint.classList.remove('visible');
  }
}
 
function toggleAdmin(show) {
  adminPanel.classList.toggle('hidden', !show);
}
 
function showConfirmModal() {
  confirmModal.classList.remove('hidden');
}
 
function hideConfirmModal() {
  confirmModal.classList.add('hidden');
}
 
function performReset() {
  localStorage.removeItem('wizzardClickerSave');
  game = {
    mana: 0,
    totalClicks: 0,
    manaPerClick: 1,
    upgrades: upgradeDefs.map(def => ({ id: def.id, count: 0, cost: def.baseCost })),
  };
  godMode = false;
  hideEvent();
  hideConfirmModal();
  toggleAdmin(false);
  updateDisplay();
  saveGame();
}
 
function resetGame() {
  showConfirmModal();
}
 
function checkSecretCode() {
  const value = secretInput.value.trim();
  if (value === ADMIN_CODE) {
    secretHint.classList.remove('visible');
    playUnlockSound();
    toggleAdmin(true);
    secretInput.value = '';
  } else {
    secretHint.classList.add('visible');
    playErrorSound();
  }
}
 
// Admin actions
function initAdminActions() {
  adminManaBtn.addEventListener('click', () => {
    game.mana += 10000;
    playUnlockSound();
    updateDisplay();
    saveGame();
  });
 
  adminClicksBtn.addEventListener('click', () => {
    game.manaPerClick = 100;
    playUnlockSound();
    updateDisplay();
    saveGame();
  });
 
  adminMaxBtn.addEventListener('click', () => {
    game.upgrades.forEach(u => {
      const def = upgradeDefs.find(d => d.id === u.id);
      u.count = 100;
      u.cost = Math.floor(def.baseCost * Math.pow(1.2, u.count));
    });
    playUnlockSound();
    updateDisplay();
    saveGame();
  });
 
  adminStormBtn.addEventListener('click', () => {
    showEvent(events.find(e => e.id === 'mana-storm'));
  });
 
  adminDarkBtn.addEventListener('click', () => {
    showEvent(events.find(e => e.id === 'dark-pact'));
  });
 
  adminTreasureBtn.addEventListener('click', () => {
    showEvent(events.find(e => e.id === 'treasure-horde'));
  });
 
  adminRandomBtn.addEventListener('click', () => {
    const random = events[Math.floor(Math.random() * events.length)];
    showEvent(random);
  });
 
  adminGodBtn.addEventListener('click', () => {
    godMode = !godMode;
    playUnlockSound();
    updateDisplay();
  });
 
  adminResetBtn.addEventListener('click', () => {
    showConfirmModal();
  });
}
 
// Settings listeners
settingsBtn.addEventListener('click', () => toggleSettings(true));
closeSettingsBtn.addEventListener('click', () => toggleSettings(false));
 
sfxVolumeSlider.addEventListener('input', (e) => {
  initAudio();
  settings.sfxVolume = parseInt(e.target.value, 10) / 100;
  updateGains();
  saveSettings();
});
 
musicVolumeSlider.addEventListener('input', (e) => {
  initAudio();
  settings.musicVolume = parseInt(e.target.value, 10) / 100;
  updateGains();
  saveSettings();
});
 
muteToggleBtn.addEventListener('click', () => {
  initAudio();
  settings.muted = !settings.muted;
  updateMuteButton();
  saveSettings();
});
 
eventsToggleBtn.addEventListener('click', () => {
  settings.eventsEnabled = !settings.eventsEnabled;
  updateEventsButton();
  if (!settings.eventsEnabled) {
    if (eventEffectTimeout) clearTimeout(eventEffectTimeout);
    if (eventTimeout) clearTimeout(eventTimeout);
    hideEvent();
  } else {
    scheduleRandomEvent();
  }
  saveSettings();
});
 
resetSaveBtn.addEventListener('click', resetGame);
 
cancelResetBtn.addEventListener('click', hideConfirmModal);
confirmResetBtn.addEventListener('click', performReset);
 
secretInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkSecretCode();
  }
});
 
closeAdminBtn.addEventListener('click', () => toggleAdmin(false));
 
wizard.addEventListener('click', handleClick);
 
let lastFrame = 0;
function gameLoop(timestamp) {
  if (timestamp - lastFrame >= 1000) {
    const mps = getTotalMps();
    game.mana += mps;
    updateDisplay();
    saveGame();
    lastFrame = timestamp;
  }
  requestAnimationFrame(gameLoop);
}
 
loadSettings();
loadGame();
renderUpgrades();
updateDisplay();
initAdminActions();
requestAnimationFrame(gameLoop);
scheduleRandomEvent();
 
window.addEventListener('beforeunload', saveGame);
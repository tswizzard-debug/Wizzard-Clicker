const wizard = document.getElementById('wizard');
const manaEl = document.getElementById('mana');
const mpsEl = document.getElementById('mps');
const mpcEl = document.getElementById('mpc');
const shardsEl = document.getElementById('shards');
const rebirthsEl = document.getElementById('rebirths');
const shardsStat = document.getElementById('shards-stat');
const rebirthsStat = document.getElementById('rebirths-stat');
const upgradeList = document.getElementById('upgrade-list');
const floatingContainer = document.getElementById('floating-text-container');
const comboBar = document.getElementById('combo-bar');
const comboText = document.getElementById('combo-text');
const comboFill = document.getElementById('combo-fill');

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
const adminShardsBtn = document.getElementById('admin-shards');
const adminStormBtn = document.getElementById('admin-storm');
const adminDarkBtn = document.getElementById('admin-dark');
const adminTreasureBtn = document.getElementById('admin-treasure');
const adminRandomBtn = document.getElementById('admin-random');
const adminGodBtn = document.getElementById('admin-god');
const adminResetBtn = document.getElementById('admin-reset');

const achievementsBtn = document.getElementById('achievements-btn');
const achievementsPanel = document.getElementById('achievements-panel');
const closeAchievementsBtn = document.getElementById('close-achievements');
const achievementsList = document.getElementById('achievements-list');

const skinsBtn = document.getElementById('skins-btn');
const skinsPanel = document.getElementById('skins-panel');
const closeSkinsBtn = document.getElementById('close-skins');
const skinsList = document.getElementById('skins-list');

const savesBtn = document.getElementById('saves-btn');
const savesPanel = document.getElementById('saves-panel');
const closeSavesBtn = document.getElementById('close-saves');
const saveTabs = document.getElementById('save-tabs');
const saveJson = document.getElementById('save-json');
const saveCurrentBtn = document.getElementById('save-current');
const loadSaveBtn = document.getElementById('load-save');
const exportSaveBtn = document.getElementById('export-save');
const importSaveBtn = document.getElementById('import-save');
const deleteSaveBtn = document.getElementById('delete-save');

const leaderboardBtn = document.getElementById('leaderboard-btn');
const leaderboardPanel = document.getElementById('leaderboard-panel');
const closeLeaderboardBtn = document.getElementById('close-leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

const prestigeBtn = document.getElementById('prestige-btn');
const prestigePanel = document.getElementById('prestige-panel');
const closePrestigeBtn = document.getElementById('close-prestige');
const confirmPrestigeBtn = document.getElementById('confirm-prestige');
const prestigeBonusEl = document.getElementById('prestige-bonus');
const prestigeGainEl = document.getElementById('prestige-gain');
const perksList = document.getElementById('perks-list');

const eventToast = document.getElementById('event-toast');
const eventTitle = document.getElementById('event-title');
const eventDesc = document.getElementById('event-desc');
const eventTimer = document.getElementById('event-timer');

const achievementToast = document.getElementById('achievement-toast');
const achievementIcon = document.getElementById('achievement-icon');
const achievementTitle = document.getElementById('achievement-title');
const achievementDesc = document.getElementById('achievement-desc');

const loginScreen = document.getElementById('login-screen');
const profileList = document.getElementById('profile-list');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const loginError = document.getElementById('login-error');
const userBadge = document.getElementById('user-badge');
const currentUsernameEl = document.getElementById('current-username');
const switchUserBtn = document.getElementById('switch-user-btn');

const ADMIN_CODE = 'TsWizzardIsTuff';
const PROFILES_KEY = 'wizzardClickerProfiles';

let storage = null;
try {
  const testKey = '__storage_test__';
  localStorage.setItem(testKey, testKey);
  localStorage.removeItem(testKey);
  storage = localStorage;
} catch (e) {
  console.warn('localStorage unavailable; progress will not persist.');
}

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

let activePanel = null;
let selectedSaveSlot = 0;
let achievementToastTimeout = null;
let currentUser = null;

let settings = {
  sfxVolume: 0.5,
  musicVolume: 0.3,
  muted: false,
  eventsEnabled: true,
};

let game = {
  mana: 0,
  totalMana: 0,
  totalClicks: 0,
  manaPerClick: 1,
  upgrades: [],
  rebirths: 0,
  shards: 0,
  totalRebirthMana: 0,
  skin: 'default',
  unlockedSkins: ['default'],
  achievements: [],
  perks: {},
  combo: { count: 0, timer: 0, multiplier: 1 },
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
  { id: 'cauldron', name: 'Arcane Cauldron', icon: '⚗️', baseCps: 1500000, baseCost: 100000000, desc: 'Brews endless mana' },
  { id: 'grimoire', name: 'Forbidden Grimoire', icon: '📖', baseCps: 5000000, baseCost: 400000000, desc: 'Spells beyond comprehension' },
  { id: 'nexus', name: 'Mana Nexus', icon: '💠', baseCps: 20000000, baseCost: 2000000000, desc: 'All magic converges here' },
];

const events = [
  {
    id: 'mana-storm',
    title: 'Mana Storm',
    desc: 'The arcane winds blow! +50% mana/sec for 20 seconds.',
    duration: 20000,
    type: 'buff',
    apply: () => { activeEvent = { type: 'mpsMultiplier', value: 1.5 }; },
    icon: '⛈️',
  },
  {
    id: 'spell-surge',
    title: 'Spell Surge',
    desc: 'Your clicks crackle with power! Double click mana for 15 seconds.',
    duration: 15000,
    type: 'buff',
    apply: () => { activeEvent = { type: 'clickMultiplier', value: 2 }; },
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
      activeEvent = { type: 'mpsMultiplier', value: 2 };
    },
    icon: '☠️',
  },
  {
    id: 'fairy-blessing',
    title: 'Fairy Blessing',
    desc: 'Upgrade costs are reduced by 20% for 20 seconds.',
    duration: 20000,
    type: 'buff',
    apply: () => { activeEvent = { type: 'discount', value: 0.8 }; },
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
        const def = upgradeDefs.find(d => d.id === 'apprentice');
        grantUpgrade(apprentice, def);
      } else {
        const random = owned[Math.floor(Math.random() * owned.length)];
        const def = upgradeDefs.find(d => d.id === random.id);
        grantUpgrade(random, def);
      }
    },
    icon: '🎁',
  },
  {
    id: 'combo-winds',
    title: 'Combo Winds',
    desc: 'Your combos last twice as long for 15 seconds.',
    duration: 15000,
    type: 'buff',
    apply: () => { activeEvent = { type: 'comboDuration', value: 2 }; },
    icon: '🌪️',
  },
];

const ACHIEVEMENTS = [
  { id: 'first-blood', name: 'First Blood', desc: 'Click the wizard once', icon: '👆', condition: (g) => g.totalClicks >= 1 },
  { id: 'apprentice', name: 'Apprentice', desc: 'Buy 5 upgrades', icon: '🎓', condition: (g) => totalUpgrades() >= 5 },
  { id: 'novice', name: 'Novice Wizzard', desc: 'Reach 100 mana', icon: '✨', condition: (g) => g.totalMana >= 100 },
  { id: 'master', name: 'Master', desc: 'Reach 10,000 mana', icon: '🔮', condition: (g) => g.totalMana >= 10000 },
  { id: 'archmage', name: 'Archmage', desc: 'Reach 1,000,000 mana', icon: '👑', condition: (g) => g.totalMana >= 1000000 },
  { id: 'clicker', name: 'Rapid Clicker', desc: 'Click 100 times', icon: '⚡', condition: (g) => g.totalClicks >= 100 },
  { id: 'combo', name: 'Combo Master', desc: 'Reach a x10 combo', icon: '🔥', condition: (g) => g.combo.max >= 10 },
  { id: 'critical', name: 'Critical Strike', desc: 'Get a critical click', icon: '💥', condition: (g) => g.criticalHits >= 1 },
  { id: 'rebirth', name: 'Reborn', desc: 'Rebirth once', icon: '✨', condition: (g) => g.rebirths >= 1 },
  { id: 'hoarder', name: 'Hoarder', desc: 'Own 100 total upgrades', icon: '🏰', condition: (g) => totalUpgrades() >= 100 },
  { id: 'skin', name: 'Fashionable', desc: 'Unlock a new skin', icon: '🎨', condition: (g) => g.unlockedSkins.length >= 2 },
  { id: 'shard', name: 'Shard Collector', desc: 'Earn 10 Arcane Shards', icon: '💎', condition: (g) => g.shards >= 10 },
];

const skins = [
  { id: 'default', name: 'Classic', class: '', condition: 'Default' },
  { id: 'fire', name: 'Fireborn', class: 'skin-fire', condition: 'Rebirth 1 time' },
  { id: 'ice', name: 'Frostweaver', class: 'skin-ice', condition: 'Own 50 upgrades' },
  { id: 'gold', name: 'Golden', class: 'skin-gold', condition: 'Reach 1M mana' },
  { id: 'dark', name: 'Shadowmancer', class: 'skin-dark', condition: 'Rebirth 3 times' },
  { id: 'rainbow', name: 'Prismatic', class: 'skin-rainbow', condition: 'Reach 10M mana' },
];

const PERKS = [
  { id: 'click-power', name: 'Click Power', desc: '+1 mana per click per level', baseCost: 1, maxLevel: 100 },
  { id: 'mps-boost', name: 'Arcane Flow', desc: '+10% mana/sec per level', baseCost: 2, maxLevel: 50 },
  { id: 'discount', name: 'Bargain Magic', desc: '-2% upgrade costs per level', baseCost: 3, maxLevel: 25 },
  { id: 'combo-time', name: 'Combo Flow', desc: '+10% combo duration per level', baseCost: 2, maxLevel: 20 },
  { id: 'critical', name: 'Critical Eye', desc: '+1% critical chance per level', baseCost: 5, maxLevel: 20 },
  { id: 'shard-boost', name: 'Shard Magnet', desc: '+10% shards on rebirth per level', baseCost: 5, maxLevel: 20 },
];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getProfiles() {
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem(PROFILES_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveProfiles(list) {
  if (!storage) return;
  storage.setItem(PROFILES_KEY, JSON.stringify(list));
}

function sanitizeUsername(raw) {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 20);
}

function isValidUsername(name) {
  return /^[A-Za-z0-9 _-]{2,20}$/.test(name);
}

function findProfile(username) {
  return getProfiles().find(p => p.toLowerCase() === username.toLowerCase());
}

function getUserSaveKey(username) {
  return `wizzardClickerSave_user_${username.toLowerCase()}`;
}

function renderProfileList() {
  const profiles = getProfiles();
  profileList.innerHTML = '';
  if (profiles.length === 0) {
    profileList.innerHTML = '<p class="no-profiles">No wizards yet — create one below!</p>';
    return;
  }
  profiles.forEach(name => {
    const row = document.createElement('div');
    row.className = 'profile-item';
    row.innerHTML = `
      <button type="button" class="profile-name">🧙 ${escapeHtml(name)}</button>
      <button type="button" class="profile-delete" aria-label="Delete profile">✕</button>
    `;
    row.querySelector('.profile-name').addEventListener('click', () => loginAs(name));
    row.querySelector('.profile-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProfile(name);
    });
    profileList.appendChild(row);
  });
}

function deleteProfile(name) {
  if (!storage) return;
  if (!confirm(`Delete profile "${name}" and all its progress? This cannot be undone.`)) return;
  const profiles = getProfiles().filter(p => p.toLowerCase() !== name.toLowerCase());
  saveProfiles(profiles);
  storage.removeItem(getUserSaveKey(name));
  for (let i = 0; i < 3; i++) {
    storage.removeItem(`wizzardClickerSave_slot_${i}_user_${name.toLowerCase()}`);
  }
  renderProfileList();
  playErrorSound();
}

function loginAs(name) {
  loginError.textContent = '';
  startSessionForUser(name);
}

function startSessionForUser(username) {
  // Stop any timers/UI left over from a previous session on this device
  if (eventTimeout) clearTimeout(eventTimeout);
  if (eventEffectTimeout) clearTimeout(eventEffectTimeout);
  if (eventUpdateInterval) clearInterval(eventUpdateInterval);
  hideEvent();
  closeActivePanel();
  toggleAdmin(false);
  godMode = false;

  currentUser = username;
  currentUsernameEl.textContent = username;
  loginScreen.classList.add('hidden');

  loadGame();
  renderUpgrades();
  updateDisplay();
  checkAchievements();
  checkSkinUnlocks();
  applySkin();
  scheduleRandomEvent();
}

function switchUser() {
  saveGame();
  currentUser = null;
  loginError.textContent = '';
  usernameInput.value = '';
  renderProfileList();
  loginScreen.classList.remove('hidden');
  closeActivePanel();
}

function initLogin() {
  renderProfileList();

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = sanitizeUsername(usernameInput.value);
    if (!isValidUsername(name)) {
      loginError.textContent = 'Use 2-20 letters, numbers, spaces, - or _.';
      playErrorSound();
      return;
    }
    const existing = findProfile(name);
    if (existing) {
      usernameInput.value = '';
      loginAs(existing);
      return;
    }
    const profiles = getProfiles();
    profiles.unshift(name);
    saveProfiles(profiles);
    usernameInput.value = '';
    playUnlockSound();
    loginAs(name);
  });

  userBadge.addEventListener('click', switchUser);
  switchUserBtn.addEventListener('click', switchUser);
}

function totalUpgrades() {
  return game.upgrades.reduce((s, u) => s + u.count, 0);
}

function grantUpgrade(u, def) {
  u.count += 1;
  u.cost = Math.floor(def.baseCost * Math.pow(1.2, u.count));
  playBuySound();
}

function loadSettings() {
  if (!storage) return;
  const saved = storage.getItem('wizzardClickerSettings');
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
  if (!storage) return;
  storage.setItem('wizzardClickerSettings', JSON.stringify(settings));
}

function loadGame() {
  // Always start from clean defaults so a new user never inherits
  // whatever was left in memory from a previous profile.
  resetGameState(true);

  if (!storage || !currentUser) {
    return;
  }

  const saved = storage.getItem(getUserSaveKey(currentUser));
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      game.mana = parsed.mana || 0;
      game.totalMana = parsed.totalMana || 0;
      game.totalClicks = parsed.totalClicks || 0;
      game.manaPerClick = parsed.manaPerClick || 1;
      game.upgrades = parsed.upgrades || [];
      game.rebirths = parsed.rebirths || 0;
      game.shards = parsed.shards || 0;
      game.totalRebirthMana = parsed.totalRebirthMana || 0;
      game.skin = parsed.skin || 'default';
      game.unlockedSkins = parsed.unlockedSkins || ['default'];
      game.achievements = parsed.achievements || [];
      game.perks = parsed.perks || {};
      game.combo = parsed.combo || { count: 0, timer: 0, multiplier: 1, max: 0 };
      game.criticalHits = parsed.criticalHits || 0;
    } catch (e) {
      console.error('Failed to load save', e);
    }
  }

  resetGameState(false);
}

function saveGame() {
  if (!storage || !currentUser) return;
  storage.setItem(getUserSaveKey(currentUser), JSON.stringify(game));
}

function clearSave() {
  if (!storage || !currentUser) return;
  storage.removeItem(getUserSaveKey(currentUser));
}

function resetGameState(fullReset) {
  if (fullReset) {
    game.mana = 0;
    game.totalMana = 0;
    game.totalClicks = 0;
    game.manaPerClick = 1;
    game.rebirths = 0;
    game.shards = 0;
    game.totalRebirthMana = 0;
    game.skin = 'default';
    game.unlockedSkins = ['default'];
    game.achievements = [];
    game.perks = {};
    game.combo = { count: 0, timer: 0, multiplier: 1, max: 0 };
    game.criticalHits = 0;
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

function formatNumber(n) {
  if (!isFinite(n) || n < 0) return '0';
  if (n < 1000) return Math.floor(n).toString();
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const i = Math.min(Math.floor(Math.log10(n) / 3), suffixes.length - 1);
  const short = (n / Math.pow(1000, i)).toFixed(2).replace(/\.00$/, '');
  return `${short} ${suffixes[i]}`;
}

function getUpgradeState(id) {
  return game.upgrades.find(u => u.id === id);
}

function getPerkLevel(id) {
  return game.perks[id] || 0;
}

function getBaseMps() {
  return game.upgrades.reduce((sum, u) => {
    const def = upgradeDefs.find(d => d.id === u.id);
    return sum + (u.count * def.baseCps);
  }, 0);
}

function getTotalMps() {
  let base = getBaseMps();
  const mpsBoost = getPerkLevel('mps-boost');
  base *= (1 + mpsBoost * 0.1);
  const rebirthBonus = 1 + game.rebirths * 0.1;
  base *= rebirthBonus;
  if (activeEvent && activeEvent.type === 'mpsMultiplier') {
    base *= activeEvent.value;
  }
  return base;
}

function getCurrentCost(baseCost, count) {
  let cost = Math.floor(baseCost * Math.pow(1.2, count));
  const discountLevel = getPerkLevel('discount');
  cost *= Math.pow(0.98, discountLevel);
  if (activeEvent && activeEvent.type === 'discount') {
    cost *= activeEvent.value;
  }
  return Math.max(1, Math.floor(cost));
}

function getManaPerClick() {
  let base = godMode ? 1000000 : game.manaPerClick;
  base += getPerkLevel('click-power');
  let comboMult = game.combo.multiplier;
  if (activeEvent && activeEvent.type === 'clickMultiplier') {
    comboMult *= activeEvent.value;
  }
  return base * comboMult;
}

function updateDisplay() {
  const mps = getTotalMps();
  manaEl.textContent = formatNumber(game.mana);
  mpsEl.textContent = formatNumber(mps);
  mpcEl.textContent = formatNumber(getManaPerClick());
  shardsEl.textContent = formatNumber(game.shards);
  rebirthsEl.textContent = game.rebirths;

  const hasPrestige = game.rebirths > 0 || game.shards > 0;
  shardsStat.classList.toggle('hidden', !hasPrestige);
  rebirthsStat.classList.toggle('hidden', !hasPrestige);

  prestigeBtn.classList.toggle('hidden', !canPrestige());

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

  applySkin();
  updateComboBar();
}

function applySkin() {
  if (!game.skin) return;
  wizard.className = 'wizard';
  const skin = skins.find(s => s.id === game.skin);
  if (skin && skin.class) {
    wizard.classList.add(skin.class);
  }
}

function updateComboBar() {
  if (game.combo.count > 1) {
    comboBar.classList.remove('hidden');
    comboText.textContent = `Combo x${game.combo.count} (${formatNumber(game.combo.multiplier)}x)`;
    const decay = getComboDecayMs();
    const pct = Math.max(0, Math.min(100, (game.combo.timer / decay) * 100));
    comboFill.style.width = `${pct}%`;
  } else {
    comboBar.classList.add('hidden');
  }
}

function getComboDecayMs() {
  const base = 800;
  const comboTime = getPerkLevel('combo-time');
  const eventMult = (activeEvent && activeEvent.type === 'comboDuration') ? activeEvent.value : 1;
  return base * (1 + comboTime * 0.1) * eventMult;
}

function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!musicStarted) {
      startMusic();
      musicStarted = true;
    }
    return;
  }
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();
    sfxGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    sfxGain.connect(audioCtx.destination);
    musicGain.connect(audioCtx.destination);
    updateGains();
    if (!musicStarted) {
      startMusic();
      musicStarted = true;
    }
  } catch (e) {
    console.warn('Audio not available:', e);
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

function createFloatingText(x, y, text, color = 'var(--gold)', critical = false) {
  const el = document.createElement('div');
  el.className = 'floating-text';
  if (critical) el.classList.add('critical');
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  floatingContainer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function createParticles(x, y, critical = false) {
  const colors = ['#9b5de5', '#f0c040', '#00f5d4', '#ffffff', '#ff8fa3'];
  if (critical) colors.push('#ff0000', '#00ff00', '#0000ff');
  const count = critical ? 15 : 8;
  for (let i = 0; i < count; i++) {
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

function spawnClickEffects(x, y, value, critical) {
  const text = critical ? `CRIT +${formatNumber(value)}` : `+${formatNumber(value)}`;
  const color = critical ? 'var(--success)' : 'var(--gold)';
  createFloatingText(x - 20, y - 40, text, color, critical);
  createParticles(x, y, critical);
}

function handleClick(e) {
  initAudio();
  e.preventDefault();

  const criticalChance = 0.05 + getPerkLevel('critical') * 0.01;
  const isCritical = Math.random() < criticalChance;
  if (isCritical) game.criticalHits = (game.criticalHits || 0) + 1;

  const baseValue = getManaPerClick();
  const value = isCritical ? baseValue * 5 : baseValue;

  game.mana += value;
  game.totalMana += value;
  game.totalClicks += 1;

  if (!godMode && game.totalClicks % 50 === 0) {
    game.manaPerClick += 1;
  }

  updateCombo();

  playClickSound();

  const rect = wizard.getBoundingClientRect();
  const x = e.clientX || rect.left + rect.width / 2;
  const y = e.clientY || rect.top + rect.height / 2;
  spawnClickEffects(x, y, value, isCritical);

  wizard.classList.remove('clicked');
  void wizard.offsetWidth;
  wizard.classList.add('clicked');
  const onAnimEnd = () => {
    wizard.classList.remove('clicked');
    wizard.removeEventListener('animationend', onAnimEnd);
  };
  wizard.addEventListener('animationend', onAnimEnd);

  checkAchievements();
  updateDisplay();
  saveGame();
}

function updateCombo() {
  const now = Date.now();
  const decay = getComboDecayMs();
  if (now - game.combo.lastClick < decay) {
    game.combo.count += 1;
  } else {
    game.combo.count = 1;
  }
  game.combo.lastClick = now;
  game.combo.timer = decay;
  game.combo.multiplier = Math.min(1 + (game.combo.count - 1) * 0.1, 5);
  game.combo.max = Math.max(game.combo.max || 0, game.combo.count);
}

function processCombo(dt) {
  if (game.combo.count > 1) {
    game.combo.timer -= dt;
    if (game.combo.timer <= 0) {
      game.combo.count = 0;
      game.combo.multiplier = 1;
      game.combo.timer = 0;
    }
  }
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
    checkAchievements();
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
        <div class="upgrade-desc">${def.desc} — +${formatNumber(def.baseCps)} mana/sec</div>
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
  if (!settings.eventsEnabled || !currentUser) return;
  const delay = 15000 + Math.random() * 25000;
  eventEffectTimeout = setTimeout(() => {
    if (!currentUser) return;
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

function openPanel(panel) {
  if (activePanel) activePanel.classList.add('hidden');
  panel.classList.remove('hidden');
  activePanel = panel;
}

function closeActivePanel() {
  if (activePanel) activePanel.classList.add('hidden');
  activePanel = null;
}

function showConfirmModal() {
  confirmModal.classList.remove('hidden');
}

function hideConfirmModal() {
  confirmModal.classList.add('hidden');
}

function performReset() {
  clearSave();
  godMode = false;
  hideEvent();
  hideConfirmModal();
  toggleAdmin(false);
  resetGameState(true);
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

function toggleAdmin(show) {
  adminPanel.classList.toggle('hidden', !show);
}

function isEnterKey(e) {
  return e.key === 'Enter' || e.keyCode === 13 || e.code === 'Enter';
}

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

  adminShardsBtn.addEventListener('click', () => {
    game.shards += 100;
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

function checkSkinUnlocks() {
  skins.forEach(skin => {
    if (game.unlockedSkins.includes(skin.id)) return;
    let unlocked = false;
    switch (skin.id) {
      case 'fire': unlocked = game.rebirths >= 1; break;
      case 'ice': unlocked = totalUpgrades() >= 50; break;
      case 'gold': unlocked = game.totalMana >= 1000000; break;
      case 'dark': unlocked = game.rebirths >= 3; break;
      case 'rainbow': unlocked = game.totalMana >= 10000000; break;
    }
    if (unlocked) {
      game.unlockedSkins.push(skin.id);
      showAchievementToast('Skin Unlocked', `You unlocked the ${skin.name} skin!`, '🎨');
    }
  });
}

function applySkin() {
  wizard.className = 'wizard';
  const skin = skins.find(s => s.id === game.skin);
  if (skin && skin.class) {
    wizard.classList.add(skin.class);
  }
}

function renderSkins() {
  skinsList.innerHTML = '';
  skins.forEach(skin => {
    const unlocked = game.unlockedSkins.includes(skin.id);
    const selected = game.skin === skin.id;
    const card = document.createElement('div');
    card.className = 'skin-card';
    card.dataset.skin = skin.id;
    if (!unlocked) card.classList.add('locked');
    if (selected) card.classList.add('selected');
    card.innerHTML = `
      <div class="skin-preview"></div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-condition">${skin.condition}</div>
    `;
    card.addEventListener('click', () => {
      if (unlocked) {
        game.skin = skin.id;
        applySkin();
        renderSkins();
        saveGame();
        playUnlockSound();
      } else {
        playErrorSound();
      }
    });
    skinsList.appendChild(card);
  });
}

function checkAchievements() {
  let newUnlock = false;
  ACHIEVEMENTS.forEach(ach => {
    if (game.achievements.includes(ach.id)) return;
    if (ach.condition(game)) {
      game.achievements.push(ach.id);
      showAchievementToast('Achievement Unlocked', ach.name, ach.icon);
      newUnlock = true;
    }
  });
  if (newUnlock) {
    checkSkinUnlocks();
    updateDisplay();
    saveGame();
  }
}

function showAchievementToast(title, desc, icon) {
  achievementIcon.textContent = icon;
  achievementTitle.textContent = title;
  achievementDesc.textContent = desc;
  achievementToast.classList.remove('hidden');
  if (achievementToastTimeout) clearTimeout(achievementToastTimeout);
  achievementToastTimeout = setTimeout(() => {
    achievementToast.classList.add('hidden');
  }, 3500);
}

function renderAchievements() {
  achievementsList.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = game.achievements.includes(ach.id);
    const item = document.createElement('div');
    item.className = 'achievement-item';
    if (unlocked) item.classList.add('unlocked');
    item.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <div class="achievement-title">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
      </div>
    `;
    achievementsList.appendChild(item);
  });
}

function canPrestige() {
  return game.mana >= 100000;
}

function getPrestigeGain() {
  const base = Math.floor(Math.sqrt(game.mana / 100000));
  const shardBoost = getPerkLevel('shard-boost');
  return Math.floor(base * (1 + shardBoost * 0.1));
}

function getPrestigeBonus() {
  return game.rebirths * 10;
}

function renderPrestige() {
  prestigeBonusEl.textContent = `+${getPrestigeBonus()}% mana/sec`;
  prestigeGainEl.textContent = formatNumber(getPrestigeGain());
  confirmPrestigeBtn.disabled = !canPrestige();
  confirmPrestigeBtn.textContent = canPrestige() ? 'Rebirth Now' : 'Need 100K mana';

  perksList.innerHTML = '';
  PERKS.forEach(perk => {
    const level = getPerkLevel(perk.id);
    const cost = getPerkCost(perk.id);
    const canAfford = game.shards >= cost && level < perk.maxLevel;
    const item = document.createElement('div');
    item.className = 'perk-item';
    item.innerHTML = `
      <div class="perk-info">
        <div class="perk-name">${perk.name} (Lv ${level}/${perk.maxLevel})</div>
        <div class="perk-desc">${perk.desc} — Cost: ${cost} shards</div>
      </div>
      <button class="admin-btn ${canAfford ? '' : 'disabled'}" data-perk="${perk.id}">Upgrade</button>
    `;
    const btn = item.querySelector('button');
    btn.disabled = !canAfford;
    btn.addEventListener('click', () => {
      const currentLevel = getPerkLevel(perk.id);
      const currentCost = getPerkCost(perk.id);
      if (game.shards >= currentCost && currentLevel < perk.maxLevel) {
        game.shards -= currentCost;
        game.perks[perk.id] = currentLevel + 1;
        playUnlockSound();
        renderPrestige();
        updateDisplay();
        saveGame();
      } else {
        playErrorSound();
      }
    });
    perksList.appendChild(item);
  });
}

function getPerkCost(perkId) {
  const perk = PERKS.find(p => p.id === perkId);
  const level = getPerkLevel(perkId);
  return Math.floor(perk.baseCost * Math.pow(1.5, level));
}

function performPrestige() {
  if (!canPrestige()) return;
  const gain = getPrestigeGain();
  game.shards += gain;
  game.rebirths += 1;
  game.totalRebirthMana += game.mana;
  game.mana = 0;
  game.manaPerClick = 1;
  game.upgrades = upgradeDefs.map(def => ({ id: def.id, count: 0, cost: def.baseCost }));
  game.totalMana = 0;
  game.totalClicks = 0;
  game.criticalHits = 0;
  game.combo = { count: 0, timer: 0, multiplier: 1, max: 0 };
  godMode = false;
  hideEvent();
  playUnlockSound();
  showAchievementToast('Rebirth!', `Gained ${formatNumber(gain)} Arcane Shards`, '✨');
  checkAchievements();
  updateDisplay();
  saveGame();
}

function initSaveSlots() {
  saveTabs.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const btn = document.createElement('button');
    btn.className = 'save-tab';
    btn.textContent = `Slot ${i + 1}`;
    if (i === selectedSaveSlot) btn.classList.add('active');
    btn.addEventListener('click', () => {
      selectedSaveSlot = i;
      initSaveSlots();
      updateSaveJson();
    });
    saveTabs.appendChild(btn);
  }
  updateSaveJson();
}

function getSlotKey(slot) {
  const who = currentUser ? currentUser.toLowerCase() : 'guest';
  return `wizzardClickerSave_slot_${slot}_user_${who}`;
}

function updateSaveJson() {
  if (!storage) {
    saveJson.value = 'Storage not available in this environment.';
    return;
  }
  const data = storage.getItem(getSlotKey(selectedSaveSlot));
  saveJson.value = data || '';
  saveJson.readOnly = true;
}

function saveCurrentToSlot() {
  if (!storage) return;
  const save = JSON.stringify(game);
  storage.setItem(getSlotKey(selectedSaveSlot), save);
  updateSaveJson();
  playUnlockSound();
}

function loadSlot() {
  if (!storage) return;
  const data = storage.getItem(getSlotKey(selectedSaveSlot));
  if (!data) {
    playErrorSound();
    return;
  }
  try {
    storage.setItem(getUserSaveKey(currentUser), data);
    loadGame();
    renderUpgrades();
    updateDisplay();
    playUnlockSound();
  } catch (e) {
    console.error(e);
    playErrorSound();
  }
}

function exportSlot() {
  if (!storage) return;
  const data = storage.getItem(getSlotKey(selectedSaveSlot));
  if (!data) {
    playErrorSound();
    return;
  }
  saveJson.value = data;
  saveJson.readOnly = false;
  saveJson.select();
  document.execCommand('copy');
  saveJson.readOnly = true;
  showAchievementToast('Exported', 'Save data copied to clipboard', '💾');
}

function importSlot() {
  if (!storage) return;
  try {
    const data = saveJson.value.trim();
    if (!data) return;
    JSON.parse(data);
    storage.setItem(getSlotKey(selectedSaveSlot), data);
    updateSaveJson();
    playUnlockSound();
    showAchievementToast('Imported', 'Save data imported to slot', '💾');
  } catch (e) {
    console.error(e);
    playErrorSound();
  }
}

function deleteSlot() {
  if (!storage) return;
  storage.removeItem(getSlotKey(selectedSaveSlot));
  updateSaveJson();
  playErrorSound();
}

function renderLeaderboard() {
  leaderboardList.innerHTML = '';
  let scores = [];
  if (storage) {
    const data = storage.getItem('wizzardClickerLeaderboard');
    if (data) {
      try { scores = JSON.parse(data); } catch (e) {}
    }
  }
  if (scores.length === 0) {
    leaderboardList.innerHTML = '<p style="text-align:center;color:var(--muted)">No scores yet. Reach milestones to be added!</p>';
    return;
  }
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-entry';
    row.innerHTML = `
      <span class="rank">#${i + 1}</span>
      <span>${entry.name}</span>
      <span class="score">${formatNumber(entry.score)}</span>
    `;
    leaderboardList.appendChild(row);
  });
}

function updateLeaderboard() {
  if (!storage || !currentUser) return;
  const score = game.totalMana + game.totalRebirthMana + (game.rebirths * 1000000);
  let scores = [];
  const data = storage.getItem('wizzardClickerLeaderboard');
  if (data) {
    try { scores = JSON.parse(data); } catch (e) {}
  }
  const name = currentUser;
  const existing = scores.find(s => s.name === name);
  if (existing) {
    existing.score = Math.max(existing.score, score);
  } else {
    scores.push({ name, score });
  }
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  storage.setItem('wizzardClickerLeaderboard', JSON.stringify(scores));
}

function initPanels() {
  achievementsBtn.addEventListener('click', () => {
    renderAchievements();
    openPanel(achievementsPanel);
  });
  closeAchievementsBtn.addEventListener('click', closeActivePanel);

  skinsBtn.addEventListener('click', () => {
    renderSkins();
    openPanel(skinsPanel);
  });
  closeSkinsBtn.addEventListener('click', closeActivePanel);

  savesBtn.addEventListener('click', () => {
    initSaveSlots();
    openPanel(savesPanel);
  });
  closeSavesBtn.addEventListener('click', closeActivePanel);
  saveCurrentBtn.addEventListener('click', saveCurrentToSlot);
  loadSaveBtn.addEventListener('click', loadSlot);
  exportSaveBtn.addEventListener('click', exportSlot);
  importSaveBtn.addEventListener('click', importSlot);
  deleteSaveBtn.addEventListener('click', deleteSlot);

  leaderboardBtn.addEventListener('click', () => {
    renderLeaderboard();
    openPanel(leaderboardPanel);
  });
  closeLeaderboardBtn.addEventListener('click', closeActivePanel);

  prestigeBtn.addEventListener('click', () => {
    renderPrestige();
    openPanel(prestigePanel);
  });
  closePrestigeBtn.addEventListener('click', closeActivePanel);
  confirmPrestigeBtn.addEventListener('click', () => {
    performPrestige();
    closeActivePanel();
  });
}

// Settings listeners
settingsBtn.addEventListener('click', () => openPanel(settingsPanel));
closeSettingsBtn.addEventListener('click', closeActivePanel);

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
  if (isEnterKey(e)) checkSecretCode();
});

secretInput.addEventListener('keyup', (e) => {
  if (isEnterKey(e)) checkSecretCode();
});

closeAdminBtn.addEventListener('click', () => toggleAdmin(false));

wizard.addEventListener('click', handleClick);
wizard.addEventListener('touchend', (e) => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const fakeEvent = {
    clientX: touch.clientX,
    clientY: touch.clientY,
    preventDefault: () => {},
  };
  handleClick(fakeEvent);
});

let lastFrame = 0;
let lastLoopTime = Date.now();
function gameLoop(timestamp) {
  const now = Date.now();
  const dt = now - lastLoopTime;
  lastLoopTime = now;

  if (currentUser) {
    processCombo(dt);

    if (timestamp - lastFrame >= 1000) {
      const mps = getTotalMps();
      game.mana += mps;
      game.totalMana += mps;

      updateDisplay();
      saveGame();
      updateLeaderboard();
      lastFrame = timestamp;
    }
  }
  requestAnimationFrame(gameLoop);
}

loadSettings();
initAdminActions();
initPanels();
initLogin();
requestAnimationFrame(gameLoop);

window.addEventListener('beforeunload', () => {
  if (currentUser) saveGame();
});
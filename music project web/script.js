const launchBtn = document.getElementById('launchDemo');
const statusText = document.getElementById('statusText');
const subscribeBtn = document.getElementById('subscribeBtn');
const studioTabBtn = document.getElementById('studioTabBtn');
const proTabBtn = document.getElementById('proTabBtn');
const proPreviewSection = document.getElementById('proPreviewSection');
const demoStatusLabel = document.getElementById('demoStatusLabel');
const accessMessage = document.getElementById('accessMessage');
const collaboratorCountEl = document.getElementById('collaboratorCount');
const progressFill = document.getElementById('progressFill');
const audioFileInput = document.getElementById('audioFile');
const dropZone = document.getElementById('dropZone');
const browseBtn = document.getElementById('browseBtn');
const discardBtn = document.getElementById('discardBtn');
const audioPlayer = document.getElementById('audioPlayer');
const audioStatus = document.getElementById('audioStatus');
const dropTitle = document.getElementById('dropTitle');
const dropText = document.getElementById('dropText');
const proAudioFileInput = document.getElementById('proAudioFile');
const proVideoFileInput = document.getElementById('proVideoFile');
const proAudioDropZone = document.getElementById('proAudioDropZone');
const proVideoDropZone = document.getElementById('proVideoDropZone');
const proAudioBrowseBtn = document.getElementById('proAudioBrowseBtn');
const proVideoBrowseBtn = document.getElementById('proVideoBrowseBtn');
const proDownloadBtn = document.getElementById('proDownloadBtn');
const aiSyncBtn = document.getElementById('aiSyncBtn');
const multiEditBtn = document.getElementById('multiEditBtn');
const editorStatus = document.getElementById('editorStatus');
const editorTabs = document.querySelectorAll('.editor-tab');
const proAudioPlayer = document.getElementById('proAudioPlayer');
const proVideoPlayer = document.getElementById('proVideoPlayer');
const proSyncSection = document.getElementById('proSyncSection');
const proChillSection = document.getElementById('proChillSection');
const partnerEmailInput = document.getElementById('partnerEmailInput');
const connectPartnerBtn = document.getElementById('connectPartnerBtn');
const syncConnectionStatus = document.getElementById('syncConnectionStatus');
const collabAudioFileInput = document.getElementById('collabAudioFile');
const collabAudioDropZone = document.getElementById('collabAudioDropZone');
const collabAudioBrowseBtn = document.getElementById('collabAudioBrowseBtn');
const collabUserAudioPlayer = document.getElementById('collabUserAudioPlayer');
const partnerAudioFileInput = document.getElementById('partnerAudioFile');
const partnerAudioDropZone = document.getElementById('partnerAudioDropZone');
const partnerAudioBrowseBtn = document.getElementById('partnerAudioBrowseBtn');
const partnerAudioPlayer = document.getElementById('partnerAudioPlayer');
const startSyncSessionBtn = document.getElementById('startSyncSessionBtn');
const syncRoomTitle = document.getElementById('syncRoomTitle');
const syncRoomText = document.getElementById('syncRoomText');
const syncRoomList = document.getElementById('syncRoomList');
const payList = document.getElementById('payList');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const moodButtons = document.querySelectorAll('.mood-pill');
const controlButtons = document.querySelectorAll('.control-btn');
const authShell = document.getElementById('authShell');
const topbar = document.getElementById('topbar');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const showLoginBtn = document.getElementById('showLoginBtn');
const showSignupBtn = document.getElementById('showSignupBtn');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const resetForm = document.getElementById('resetForm');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const purchaseModal = document.getElementById('purchaseModal');
const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn');
const cancelPurchaseBtn = document.getElementById('cancelPurchaseBtn');
const purchaseCloseBtn = document.getElementById('purchaseCloseBtn');

let collaboratorCount = 4;
let progress = 0;
let audioUrl = '';
let proMediaUrl = '';
let proMediaName = '';
let proMode = 'audio';
let isMultiEditing = false;
let currentUser = null;
let users = [];
let currentResetOtp = '';
let isDemoAccess = false;
let isProAccess = false;
let activeView = 'studio';

const STORAGE_KEY = 'jaiakStudioUsers';
const CURRENT_USER_KEY = 'jaiakStudioCurrentUser';
const API_USERS_URL = '/api/users';

const setStatus = (message) => {
  if (statusText) {
    statusText.textContent = message;
  }
};

async function loadUsers() {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }

    const response = await fetch(API_USERS_URL);
    if (!response.ok) {
      return [];
    }

    const serverUsers = await response.json();
    const normalizedUsers = serverUsers.map((user) => ({
      ...user,
      name: user.name || user.username || '',
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUsers));
    return normalizedUsers;
  } catch (error) {
    console.error('Unable to load users', error);
    return [];
  }
}

async function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function loadCurrentUser() {
  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Unable to load current user', error);
    return null;
  }
}

function persistCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function setAuthMessage(message, isError = false) {
  if (authMessage) {
    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
  }
}

function setAccessMessage(message, isError = false) {
  if (accessMessage) {
    accessMessage.textContent = message;
    accessMessage.classList.toggle('error', isError);
  }
}

function setEditorStatus(message) {
  if (editorStatus) {
    editorStatus.textContent = message;
  }
}

function updateProPlayerVisibility() {
  if (!proAudioPlayer || !proVideoPlayer) return;
  proAudioPlayer.hidden = proMode !== 'audio';
  proVideoPlayer.hidden = proMode !== 'video';
  proAudioPlayer.style.display = proMode === 'audio' ? 'block' : 'none';
  proVideoPlayer.style.display = proMode === 'video' ? 'block' : 'none';
}

function setEditorMode(mode) {
  if (mode !== 'audio' && mode !== 'video') return;
  proMode = mode;
  editorTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.media === mode);
  });
  updateProPlayerVisibility();
  setEditorStatus(`Ready in ${mode === 'audio' ? 'music' : 'video'} mode. Load a file to begin.`);
}

function setAccessMessage(message, isError = false) {
  if (accessMessage) {
    accessMessage.textContent = message;
    accessMessage.classList.toggle('error', isError);
  }
}

function updateProHeaderState() {
  if (studioTabBtn) studioTabBtn.hidden = isProAccess;

  if (subscribeBtn) {
    if (isProAccess) {
      subscribeBtn.hidden = false;
      subscribeBtn.textContent = 'Subscribed';
      subscribeBtn.classList.remove('btn-secondary');
      subscribeBtn.classList.remove('btn');
      subscribeBtn.classList.add('subscribed-text');
      subscribeBtn.disabled = true;
      subscribeBtn.setAttribute('aria-pressed', 'true');
      subscribeBtn.setAttribute('aria-label', 'Subscribed');
    } else {
      subscribeBtn.hidden = false;
      subscribeBtn.textContent = 'Subscribe';
      subscribeBtn.classList.add('btn', 'btn-secondary');
      subscribeBtn.classList.remove('subscribed-text');
      subscribeBtn.disabled = false;
      subscribeBtn.removeAttribute('aria-pressed');
      subscribeBtn.removeAttribute('aria-label');
    }
  }
}

function showPurchaseModal() {
  if (purchaseModal) {
    purchaseModal.classList.add('active');
    purchaseModal.setAttribute('aria-hidden', 'false');
  }
}

function closePurchaseModal() {
  if (purchaseModal) {
    purchaseModal.classList.remove('active');
    purchaseModal.setAttribute('aria-hidden', 'true');
  }
}

function setDemoLabelVisible(visible) {
  if (demoStatusLabel) {
    demoStatusLabel.hidden = !visible;
  }
}

function completePurchase() {
  isProAccess = true;
  isDemoAccess = false;
  setDemoLabelVisible(false);
  setAccessMessage('Purchase complete. Redirecting to Pro studio.', false);
  updateProHeaderState();
  setActiveView('pro');
  closePurchaseModal();
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function showResetMessage(message, isError = false) {
  if (authMessage) {
    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
  }
}

function resetPasswordFlow() {
  const email = document.getElementById('resetEmail')?.value.trim().toLowerCase();
  if (!email) {
    showResetMessage('Enter your registered email to receive the OTP.', true);
    return;
  }

  const user = users.find((userItem) => userItem.email === email);
  if (!user) {
    showResetMessage('No account found for that email.', true);
    return;
  }

  currentResetOtp = generateOtp();
  const otpInput = document.getElementById('resetOtp');
  const newPasswordInput = document.getElementById('resetNewPassword');
  const resetButton = document.getElementById('resetPasswordBtn');

  if (otpInput && newPasswordInput && resetButton) {
    otpInput.hidden = false;
    newPasswordInput.hidden = false;
    resetButton.hidden = false;
  }

  showResetMessage(`OTP sent to ${email}. Enter it below to reset your password. (OTP: ${currentResetOtp})`, false);
}

function completePasswordReset() {
  const email = document.getElementById('resetEmail')?.value.trim().toLowerCase();
  const otp = document.getElementById('resetOtp')?.value.trim();
  const newPassword = document.getElementById('resetNewPassword')?.value;

  if (!email || !otp || !newPassword) {
    showResetMessage('Enter email, OTP, and a new password.', true);
    return;
  }

  if (otp !== currentResetOtp) {
    showResetMessage('Invalid OTP. Please try again.', true);
    return;
  }

  const userIndex = users.findIndex((userItem) => userItem.email === email);
  if (userIndex === -1) {
    showResetMessage('No account found for that email.', true);
    return;
  }

  users[userIndex].password = newPassword;
  saveUsers();
  currentResetOtp = '';
  const otpInput = document.getElementById('resetOtp');
  const newPasswordInput = document.getElementById('resetNewPassword');
  const resetButton = document.getElementById('resetPasswordBtn');

  if (otpInput && newPasswordInput && resetButton) {
    otpInput.hidden = true;
    newPasswordInput.hidden = true;
    resetButton.hidden = true;
  }

  showResetMessage('Password updated. Use your new password to log in.', false);
  loginForm?.reset();
  showLoginForm();
}

function setActiveView(view) {
  activeView = view;
  studioTabBtn?.classList.toggle('active', view === 'studio');
  proTabBtn?.classList.toggle('active', view === 'pro');
  if (proPreviewSection) {
    proPreviewSection.hidden = view !== 'pro';
  }
}

function enableDemoAccess() {
  isDemoAccess = true;
  setDemoLabelVisible(true);
  setAccessMessage('Demo preview unlocked. Subscribe for full Pro access.', false);
  setActiveView('pro');
}

function unlockProAccess() {
  isProAccess = true;
  isDemoAccess = true;
  setAccessMessage('Pro access unlocked. Welcome to the premium studio.', false);
  setActiveView('pro');
}

function getStudioName(name = '') {
  const cleanedName = (name || 'Jaiak').trim();
  return cleanedName ? `${cleanedName} studio` : 'Jaiak studio';
}

function updateStudioIdentity(name = '') {
  const brand = document.getElementById('studioBrand');
  if (brand) {
    brand.textContent = getStudioName(name);
  }

  const badge = document.getElementById('userBadge');
  if (badge) {
    badge.textContent = name ? name : 'Guest';
  }

  const brandSubtitle = document.getElementById('brandSubtitle');
  if (brandSubtitle) {
    brandSubtitle.textContent = name ? `Nickname: ${name}` : 'Signed in as Guest';             /* name change kore guest or studiot */
  }

  document.title = `${getStudioName(name)} | Music Studio`;
}

function clearResetFormFields() {
  const otpInput = document.getElementById('resetOtp');
  const newPasswordInput = document.getElementById('resetNewPassword');
  const resetButton = document.getElementById('resetPasswordBtn');
  const emailInput = document.getElementById('resetEmail');

  if (otpInput) {
    otpInput.hidden = true;
    otpInput.value = '';
  }
  if (newPasswordInput) {
    newPasswordInput.hidden = true;
    newPasswordInput.value = '';
  }
  if (resetButton) {
    resetButton.hidden = true;
  }
  if (emailInput) {
    emailInput.value = '';
  }
  currentResetOtp = '';
}

function showLoginForm() {
  loginForm?.classList.add('active');
  signupForm?.classList.remove('active');
  resetForm?.classList.remove('active');
  showLoginBtn?.classList.add('active');
  showSignupBtn?.classList.remove('active');
  clearResetFormFields();
  setAuthMessage('Use the form above to sign in or register.');
}

function showSignupForm() {
  loginForm?.classList.remove('active');
  signupForm?.classList.add('active');
  resetForm?.classList.remove('active');
  showLoginBtn?.classList.remove('active');
  showSignupBtn?.classList.add('active');
  clearResetFormFields();
  setAuthMessage('Use the form above to sign in or register.');
}

function showResetForm() {
  loginForm?.classList.remove('active');
  signupForm?.classList.remove('active');
  resetForm?.classList.add('active');
  showLoginBtn?.classList.remove('active');
  showSignupBtn?.classList.remove('active');
  clearResetFormFields();
  setAuthMessage('Reset your password with OTP.');
}

function setAuthMode(mode) {
  if (mode === 'signup') {
    showSignupForm();
  } else {
    showLoginForm();
  }
}

function showAuthScreen(message = 'Use the form above to sign in or register.', mode = 'login') {
  setAuthMode(mode);
  isDemoAccess = false;
  isProAccess = false;
  setActiveView('studio');
  if (authShell) {
    authShell.hidden = false;
    authShell.style.display = 'grid';
  }
  if (topbar) {
    topbar.hidden = true;
  }
  if (mainContent) {
    mainContent.hidden = true;
    mainContent.style.display = 'none';
  }
  updateStudioIdentity('');
  setAuthMessage(message);
  setAccessMessage('');
}

function showMainApp(user) {
  currentUser = user;
  persistCurrentUser(user);
  if (authShell) {
    authShell.hidden = true;
    authShell.style.display = 'none';
  }
  if (topbar) {
    topbar.hidden = false;
    topbar.style.display = 'flex';
  }
  if (mainContent) {
    mainContent.hidden = false;
    mainContent.style.display = 'block';
  }
  updateStudioIdentity(user.name);
  updateProHeaderState();
  setActiveView('studio');
  setAccessMessage('');
  const welcomePanel = document.getElementById('studioWelcome');
  const welcomeUserName = document.getElementById('welcomeUserName');
  const welcomeTitle = document.getElementById('welcomeTitle');
  if (welcomePanel) {
    welcomePanel.hidden = false;
  }
  if (welcomeUserName) {
    welcomeUserName.textContent = user.name;
  }
  if (welcomeTitle) {
    welcomeTitle.textContent = `${getStudioName(user.name)} is ready`;
  }
  setAuthMessage(`Welcome back, ${user.name}!`);
}

async function exportUsersCsv() {
  try {
    const response = await fetch(API_USERS_URL);
    if (!response.ok) {
      throw new Error('Unable to fetch users');
    }

    const csvText = await response.text();
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Unable to export CSV', error);
    setAuthMessage('Unable to export the CSV right now.', true);
  }
}

let proAudioUrl = '';
let proVideoUrl = '';
let proAudioName = '';
let proVideoName = '';

function loadProAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    setEditorStatus('Please choose a valid audio file.');
    return;
  }

  if (proAudioUrl) {
    URL.revokeObjectURL(proAudioUrl);
  }

  proAudioUrl = URL.createObjectURL(file);
  proAudioName = file.name;

  if (proAudioPlayer) {
    proAudioPlayer.hidden = false;
    proAudioPlayer.src = proAudioUrl;
    proAudioPlayer.load();
  }

  setEditorStatus(`Audio loaded: ${file.name}. Add a video to sync or use AI for audio-only mastering.`);
}

function loadProVideoFile(file) {
  if (!file.type.startsWith('video/')) {
    setEditorStatus('Please choose a valid video file.');
    return;
  }

  if (proVideoUrl) {
    URL.revokeObjectURL(proVideoUrl);
  }

  proVideoUrl = URL.createObjectURL(file);
  proVideoName = file.name;

  if (proVideoPlayer) {
    proVideoPlayer.hidden = false;
    proVideoPlayer.src = proVideoUrl;
    proVideoPlayer.load();
  }

  setEditorStatus(`Video loaded: ${file.name}. Add audio to sync with your visuals.`);
}

let isPartnerConnected = false;
let connectedPartnerEmail = '';
let collabAudioUrl = '';
let partnerAudioUrl = '';

function updateSyncRoom() {
  if (syncConnectionStatus) {
    syncConnectionStatus.textContent = isPartnerConnected ? 'Connected' : 'Not connected';
  }

  if (syncRoomTitle) {
    syncRoomTitle.textContent = isPartnerConnected ? `Synced with ${connectedPartnerEmail}` : 'No partner connected';
  }

  if (syncRoomText) {
    syncRoomText.textContent = isPartnerConnected
      ? 'Both users can now drop audio tracks and listen in sync.'
      : 'Connect a user and drop both tracks to start a shared listening session.';
  }

  if (syncRoomList) {
    syncRoomList.innerHTML = isPartnerConnected
      ? `<p>Connected users:</p><ul><li>You</li><li>${connectedPartnerEmail}</li></ul>`
      : '<p>No synced users yet.</p>';
  }
}

function connectPartner() {
  const email = partnerEmailInput?.value.trim().toLowerCase();
  if (!email) {
    setEditorStatus('Enter a registered partner email to connect.');
    return;
  }

  isPartnerConnected = true;
  connectedPartnerEmail = email;
  updateSyncRoom();
  setEditorStatus(`Partner connected: ${email}. Drop both tracks to sync them.`);
}

function loadCollabAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    setEditorStatus('Please choose a valid audio file.');
    return;
  }

  if (collabAudioUrl) {
    URL.revokeObjectURL(collabAudioUrl);
  }

  collabAudioUrl = URL.createObjectURL(file);

  if (collabUserAudioPlayer) {
    collabUserAudioPlayer.hidden = false;
    collabUserAudioPlayer.src = collabAudioUrl;
    collabUserAudioPlayer.load();
  }

  setEditorStatus(`Your audio loaded: ${file.name}.`);
  updateSyncRoom();
}

function loadPartnerAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    setEditorStatus('Please choose a valid audio file.');
    return;
  }

  if (partnerAudioUrl) {
    URL.revokeObjectURL(partnerAudioUrl);
  }

  partnerAudioUrl = URL.createObjectURL(file);

  if (partnerAudioPlayer) {
    partnerAudioPlayer.hidden = false;
    partnerAudioPlayer.src = partnerAudioUrl;
    partnerAudioPlayer.load();
  }

  setEditorStatus(`Partner audio loaded: ${file.name}.`);
  updateSyncRoom();
}

function playSyncSession() {
  if (!isPartnerConnected) {
    setEditorStatus('Connect a partner before syncing the session.');
    return;
  }

  if (!collabAudioUrl || !partnerAudioUrl) {
    setEditorStatus('Both users must drop a track before the sync session starts.');
    return;
  }

  collabUserAudioPlayer?.play().catch(() => {});
  partnerAudioPlayer?.play().catch(() => {});
  setEditorStatus('Sync session started — both tracks are playing together.');
}

function createProDownload() {
  if (!proMediaUrl || !proMediaName) {
    setEditorStatus('Load a file first to download the completed project.');
    return;
  }

  const link = document.createElement('a');
  link.href = proMediaUrl;
  link.download = `final-${proMediaName}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setEditorStatus(`Download started for ${proMediaName}.`);
}

function toggleMultiEdit() {
  isMultiEditing = !isMultiEditing;
  if (multiEditBtn) {
    multiEditBtn.textContent = isMultiEditing ? 'Multi editing enabled' : 'Switch to multi editing';
  }
  setEditorStatus(isMultiEditing ? 'Multi-edit mode active: collaborate on multiple tracks at once.' : 'Multi-edit mode disabled.');
}

function simulateAiSync() {
  if (isPartnerConnected && collabAudioUrl && partnerAudioUrl) {
    setEditorStatus('AI is syncing both user tracks into a shared session...');
    playSyncSession();
    setTimeout(() => {
      setEditorStatus('AI sync complete: both partner tracks are now aligned and ready for playback.');
    }, 1400);
    return;
  }

  if (!proAudioUrl && !proVideoUrl) {
    setEditorStatus('Load an audio or video file before using AI sync.');
    return;
  }

  if (proMode === 'video') {
    setEditorStatus('AI is syncing music to video timing. This may take a few seconds...');
  } else {
    setEditorStatus('AI is analyzing your track and suggesting edits for a polished music mix...');
  }

  setTimeout(() => {
    setEditorStatus(proMode === 'video'
      ? 'AI sync complete: music aligned to video pacing and scene changes.'
      : 'AI music editing complete: your track is ready for export.');
  }, 1400);
}

async function initializeAuth() {
  users = await loadUsers();
  currentUser = loadCurrentUser();

  if (currentUser) {
    showMainApp(currentUser);
  } else {
    showAuthScreen();
  }

  showLoginBtn?.addEventListener('click', () => setAuthMode('login'));
  showSignupBtn?.addEventListener('click', () => setAuthMode('signup'));

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
      setAuthMessage('Enter both email and password to login.', true);
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.error || 'Login failed. Check your credentials.', true);
        return;
      }

      const loggedUser = {
        ...data.user,
        name: data.user.username || data.user.name || '',
      };

      showMainApp(loggedUser);
      loginForm.reset();
    } catch (error) {
      console.error('Login request failed:', error);
      setAuthMessage('Unable to reach the server. Try again later.', true);
    }
  });

  signupForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('signupName')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('signupPassword')?.value;

    if (!name || !email || !password) {
      setAuthMessage('Please fill in all fields to create an account.', true);
      return;
    }

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      setAuthMessage('That email already has an account. Please log in instead.', true);
      return;
    }

    let newUser = {
      username: name,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.error || 'Registration failed', true);
        return;
      }

      if (data.user) {
        newUser = {
          ...newUser,
          username: data.user.username || newUser.username,
          name: data.user.username || data.user.name || newUser.name,
          email: data.user.email || newUser.email,
          createdAt: data.user.createdAt || newUser.createdAt,
        };
      }
    } catch (error) {
      console.error('Registration request failed:', error);
      setAuthMessage('Server not reachable. Saving registration locally.', false);
    }

    users.push(newUser);
    await saveUsers();
    signupForm.reset();
    showMainApp(newUser);
    setAuthMessage(`Account created and saved. Welcome, ${newUser.name}!`, false);
  });

  logoutBtn?.addEventListener('click', () => {
    currentUser = null;
    clearCurrentUser();
    showAuthScreen('You have been logged out.');
  });

  forgotPasswordBtn?.addEventListener('click', () => {
    showResetForm();
    showResetMessage('Enter your registered email to receive an OTP.');
  });

  sendOtpBtn?.addEventListener('click', resetPasswordFlow);
  resetPasswordBtn?.addEventListener('click', completePasswordReset);
  backToLoginBtn?.addEventListener('click', () => {
    loginForm?.reset();
    showLoginForm();
    setAuthMessage('Back to login. Enter your credentials to continue.');
  });

  subscribeBtn?.addEventListener('click', showPurchaseModal);
  confirmPurchaseBtn?.addEventListener('click', completePurchase);
  cancelPurchaseBtn?.addEventListener('click', closePurchaseModal);
  purchaseCloseBtn?.addEventListener('click', closePurchaseModal);
  studioTabBtn?.addEventListener('click', () => setActiveView('studio'));
  proTabBtn?.addEventListener('click', () => {
    if (!isDemoAccess && !isProAccess) {
      setAccessMessage('Use View Demo or subscribe to unlock Pro features.', true);
      return;
    }
    setActiveView('pro');
  });

  downloadCsvBtn?.addEventListener('click', () => {
    exportUsersCsv();
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (link.hasAttribute('data-protected') && !isDemoAccess && !isProAccess) {
      event.preventDefault();
      setAccessMessage('Subscribe or use View Demo to unlock these features.', true);
      return;
    }

    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

launchBtn?.addEventListener('click', () => {
  if (!isDemoAccess && !isProAccess) {
    setAccessMessage('Use View Demo or subscribe to unlock the Pro studio.', true);
    return;
  }

  setStatus('Studio opened — collaborators are now syncing live.');
  setActiveView('pro');
  if (collaboratorCountEl) {
    collaboratorCountEl.textContent = '6';
  }
  if (progressFill) {
    progressFill.style.width = '100%';
  }
});

setInterval(() => {
  collaboratorCount = collaboratorCount < 8 ? collaboratorCount + 1 : 4;
  if (collaboratorCountEl) {
    collaboratorCountEl.textContent = collaboratorCount;
  }
  progress = (progress + 12) % 112;
  if (progressFill) {
    progressFill.style.width = `${Math.min(progress, 100)}%`;
  }
}, 2400);

function resetAudioPlayer() {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.removeAttribute('src');
    audioPlayer.load();
  }
  if (dropTitle) {
    dropTitle.textContent = 'Drop your music here';
  }
  if (dropText) {
    dropText.textContent = 'or click to browse for a local audio file';
  }
  if (audioStatus) {
    audioStatus.textContent = 'No audio loaded yet.';
  }
  dropZone?.classList.remove('is-ready');
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = '';
  }
}

function loadAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    if (audioStatus) {
      audioStatus.textContent = 'Please choose a valid audio file.';
    }
    return;
  }

  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }

  audioUrl = URL.createObjectURL(file);
  if (audioPlayer) {
    audioPlayer.src = audioUrl;
    audioPlayer.load();
  }
  if (dropTitle) {
    dropTitle.textContent = `Playing: ${file.name}`;
  }
  if (dropText) {
    dropText.textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }
  if (audioStatus) {
    audioStatus.textContent = `Loaded ${file.name}. Press play to preview it.`;
  }
  dropZone?.classList.add('is-ready');

  audioPlayer?.play().catch(() => {
    if (audioStatus) {
      audioStatus.textContent = 'Loaded. Press play to start preview.';
    }
  });
}

browseBtn?.addEventListener('click', () => audioFileInput?.click());

discardBtn?.addEventListener('click', () => {
  resetAudioPlayer();
  if (formMessage) {
    formMessage.textContent = 'Song removed from preview.';
  }
});

audioFileInput?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) {
    loadAudioFile(file);
  }
});

dropZone?.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone?.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone?.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  const file = event.dataTransfer.files?.[0];
  if (file) {
    loadAudioFile(file);
  }
});

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    controlButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const action = button.dataset.action;
    if (action === 'pause' && audioPlayer) {
      audioPlayer.pause();
      setStatus('Preview paused — your mix is waiting for the next cue.');
    } else if (action === 'boost') {
      setStatus('Energy boost enabled — the room feels brighter and punchier.');
    } else {
      setStatus('Preview started — your session is live and ready for feedback.');
      audioPlayer?.play().catch(() => {});
    }
  });
});

moodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    moodButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const mood = button.dataset.mood;
    const moodMessages = {
      ambient: 'Ambient mode selected — warm, spacious, and immersive.',
      upbeat: 'Upbeat mode selected — the tempo is brighter and more energetic.',
      cinematic: 'Cinematic mode selected — rich layers and dramatic motion.',
    };
    setStatus(moodMessages[mood] || 'Studio mood updated.');
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get('name')?.toString().trim() || 'there';
  if (formMessage) {
    formMessage.textContent = `Thanks, ${name}! Your message is on its way to the studio.`;
  }
  contactForm.reset();
});

proAudioBrowseBtn?.addEventListener('click', () => collabAudioFileInput?.click());
proVideoBrowseBtn?.addEventListener('click', () => partnerAudioFileInput?.click());

proAudioFileInput?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) {
    loadProAudioFile(file);
  }
});

proVideoFileInput?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) {
    loadProVideoFile(file);
  }
});

proAudioDropZone?.addEventListener('dragover', (event) => {
  event.preventDefault();
  proAudioDropZone.classList.add('dragover');
});

proAudioDropZone?.addEventListener('dragleave', () => {
  proAudioDropZone.classList.remove('dragover');
});

proAudioDropZone?.addEventListener('drop', (event) => {
  event.preventDefault();
  proAudioDropZone.classList.remove('dragover');
  const file = event.dataTransfer.files?.[0];
  if (file) {
    loadProAudioFile(file);
  }
});

proVideoDropZone?.addEventListener('dragover', (event) => {
  event.preventDefault();
  proVideoDropZone.classList.add('dragover');
});

proVideoDropZone?.addEventListener('dragleave', () => {
  proVideoDropZone.classList.remove('dragover');
});

proVideoDropZone?.addEventListener('drop', (event) => {
  event.preventDefault();
  proVideoDropZone.classList.remove('dragover');
  const file = event.dataTransfer.files?.[0];
  if (file) {
    loadProVideoFile(file);
  }
});

editorTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.media;
    setEditorMode(mode);
  });
});

aiSyncBtn?.addEventListener('click', simulateAiSync);

multiEditBtn?.addEventListener('click', toggleMultiEdit);

proDownloadBtn?.addEventListener('click', createProDownload);

setEditorMode(proMode);

initializeAuth();

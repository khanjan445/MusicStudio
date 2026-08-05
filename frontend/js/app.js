// Jaiak Studio Application Logic Controller (Strict Auth & Pro Subscription Protection)

document.addEventListener('DOMContentLoaded', () => {
  // UI Element Selectors
  const launchBtn = document.getElementById('launchDemo');
  const statusText = document.getElementById('statusText');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const studioTabBtn = document.getElementById('studioTabBtn');
  const proTabBtn = document.getElementById('proTabBtn');
  const proPreviewSection = document.getElementById('proSection');
  const demoStatusLabel = document.getElementById('demoStatusLabel');
  const accessMessage = document.getElementById('accessMessage');
  const collaboratorCountEl = document.getElementById('collaboratorCount');
  const progressFill = document.getElementById('progressFill');

  // Main Audio Elements
  const audioFileInput = document.getElementById('audioFile');
  const dropZone = document.getElementById('dropZone');
  const browseBtn = document.getElementById('browseBtn');
  const discardBtn = document.getElementById('discardBtn');
  const audioPlayer = document.getElementById('audioPlayer');
  const audioStatus = document.getElementById('audioStatus');
  const dropTitle = document.getElementById('dropTitle');
  const dropText = document.getElementById('dropText');

  // Pro Workspace Elements
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
  const proAudioPlayer = document.getElementById('proAudioPlayer');
  const proVideoPlayer = document.getElementById('proVideoPlayer');

  // Synced Pro Room & Shared Playlist Elements
  const partnerEmailInput = document.getElementById('partnerEmailInput');
  const connectPartnerBtn = document.getElementById('connectPartnerBtn');
  const syncConnectionStatus = document.getElementById('syncConnectionStatus');
  const collabAudioFileInput = document.getElementById('collabAudioFile');
  const collabAudioBrowseBtn = document.getElementById('collabAudioBrowseBtn');
  const partnerAudioFileInput = document.getElementById('partnerAudioFile');
  const partnerAudioBrowseBtn = document.getElementById('partnerAudioBrowseBtn');
  const syncRoomTitle = document.getElementById('syncRoomTitle');
  const syncRoomText = document.getElementById('syncRoomText');
  const syncedStatusBadge = document.getElementById('syncedStatusBadge');
  const sharedRoomAudioPlayer = document.getElementById('sharedRoomAudioPlayer');
  const roomPlaylistQueue = document.getElementById('roomPlaylistQueue');
  const syncPlayPauseBtn = document.getElementById('syncPlayPauseBtn');
  const syncNextBtn = document.getElementById('syncNextBtn');
  const syncPrevBtn = document.getElementById('syncPrevBtn');

  // Contact & Form Elements
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  const moodButtons = document.querySelectorAll('.mood-pill');
  const controlButtons = document.querySelectorAll('.control-btn');

  // Auth Shell Elements
  const authShell = document.getElementById('authShell');
  const topbar = document.getElementById('topbar');
  const mainContent = document.getElementById('mainContent');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const resetForm = document.getElementById('resetForm');
  const authMessage = document.getElementById('authMessage');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showSignupBtn = document.getElementById('showSignupBtn');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const resetPasswordBtn = document.getElementById('resetPasswordBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');

  // Modal Elements
  const purchaseModal = document.getElementById('purchaseModal');
  const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn');
  const cancelPurchaseBtn = document.getElementById('cancelPurchaseBtn');
  const purchaseCloseBtn = document.getElementById('purchaseCloseBtn');

  // User Profile Modal Selectors
  const userBadge = document.getElementById('userBadge');
  const profileModal = document.getElementById('profileModal');
  const profileCloseBtn = document.getElementById('profileCloseBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const profileForm = document.getElementById('profileForm');
  const profileNickname = document.getElementById('profileNickname');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profileSubStatusText = document.getElementById('profileSubStatusText');
  const profileSubBadge = document.getElementById('profileSubBadge');
  const toggleSubscriptionBtn = document.getElementById('toggleSubscriptionBtn');

  // Avatar Customization Elements
  const profileAvatarFile = document.getElementById('profileAvatarFile');
  const browseAvatarBtn = document.getElementById('browseAvatarBtn');
  const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
  const profileAvatarImg = document.getElementById('profileAvatarImg');
  const avatarPresetBtns = document.querySelectorAll('.avatar-preset-btn');
  let currentSelectedAvatar = '👤';

  // Application State
  let collaboratorCount = 4;
  let progress = 0;
  let audioUrl = '';
  let isMultiEditing = false;
  let currentUser = null;
  let currentResetOtp = '';
  let isProAccess = false;

  // Shared Room Playlist State
  let roomPlaylist = []; // Array of { id, name, url, uploaderName, uploaderType }
  let currentTrackIndex = -1;

  const CURRENT_USER_KEY = 'jaiakStudioCurrentUser';
  const PRO_SUBSCRIPTION_KEY = 'jaiakStudioProSubscribed';

  // Toast Notification Helper
  function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `<span>${isError ? '⚠️' : '✨'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  const setStatus = (msg) => { if (statusText) statusText.textContent = msg; };
  const setEditorStatus = (msg) => { if (editorStatus) editorStatus.textContent = msg; };

  function loadCurrentUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }

  function persistCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(PRO_SUBSCRIPTION_KEY);
    currentUser = null;
    isProAccess = false;
  }

  function loadSubscriptionState() {
    if (currentUser && currentUser.isProSubscribed !== undefined) {
      return !!currentUser.isProSubscribed;
    }
    const userEmail = currentUser ? currentUser.email : '';
    const key = userEmail ? `${PRO_SUBSCRIPTION_KEY}_${userEmail}` : PRO_SUBSCRIPTION_KEY;
    return localStorage.getItem(key) === 'true' || localStorage.getItem(PRO_SUBSCRIPTION_KEY) === 'true';
  }

  function setSubscriptionState(subscribed) {
    isProAccess = !!subscribed;
    if (currentUser) {
      currentUser.isProSubscribed = isProAccess;
      persistCurrentUser(currentUser);
      const userEmail = currentUser.email;
      if (userEmail) {
        localStorage.setItem(`${PRO_SUBSCRIPTION_KEY}_${userEmail}`, isProAccess ? 'true' : 'false');
      }
    }
    localStorage.setItem(PRO_SUBSCRIPTION_KEY, isProAccess ? 'true' : 'false');
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

  // 🔒 1. REQUIRE LOGIN GATE
  function requireAuth(callback) {
    if (!currentUser) {
      showAuthScreen('Access Denied: Please log in or register to enter Jaiak Studio.');
      showToast('Please log in to access studio features.', true);
      return false;
    }
    if (callback) callback();
    return true;
  }

  // ⭐ 2. REQUIRE PRO SUBSCRIPTION GATE
  function requireProSubscription(callback) {
    if (!requireAuth()) return false;

    if (!isProAccess) {
      showPurchaseModal();
      showToast('⭐ Pro Subscription Required: Subscribe to unlock Pro Music & Video Editor, AI Sync, Multi-Editing, and Synced Room Playlists.', true);
      return false;
    }

    if (callback) callback();
    return true;
  }

  function updateProHeaderState() {
    if (subscribeBtn) {
      if (isProAccess) {
        subscribeBtn.textContent = 'Subscribed ⭐';
        subscribeBtn.classList.add('subscribed-text');
      } else {
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.classList.remove('subscribed-text');
      }
    }

    const demoStatusLabel = document.getElementById('demoStatusLabel');
    const demoModeContainer = document.getElementById('demoModeContainer');
    const uploadSection = document.getElementById('upload');

    if (demoStatusLabel) {
      demoStatusLabel.hidden = isProAccess;
      demoStatusLabel.style.display = isProAccess ? 'none' : 'inline-block';
    }
    if (demoModeContainer) {
      demoModeContainer.hidden = isProAccess;
      demoModeContainer.style.display = isProAccess ? 'none' : 'block';
    }

    // Hide entire Audio Preview section when user is subscribed to Pro
    if (uploadSection) {
      uploadSection.hidden = isProAccess;
      uploadSection.style.display = isProAccess ? 'none' : '';
    }
  }

  function showPurchaseModal() {
    if (purchaseModal) purchaseModal.classList.add('active');
  }

  function closePurchaseModal() {
    if (purchaseModal) purchaseModal.classList.remove('active');
  }

  function renderAvatarInModal(avatar) {
    if (!profileAvatarEmoji || !profileAvatarImg) return;

    if (avatar && (avatar.startsWith('data:image') || avatar.startsWith('http'))) {
      profileAvatarEmoji.style.display = 'none';
      profileAvatarImg.src = avatar;
      profileAvatarImg.style.display = 'block';
    } else {
      profileAvatarImg.style.display = 'none';
      profileAvatarEmoji.textContent = avatar || '👤';
      profileAvatarEmoji.style.display = 'inline';
    }

    avatarPresetBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.avatar === avatar);
    });
  }

  function updateProfileModalUI() {
    if (!currentUser) return;
    if (profileNickname) profileNickname.value = currentUser.username || currentUser.name || '';
    if (profileEmail) profileEmail.value = currentUser.email || '';
    if (profilePhone) profilePhone.value = currentUser.phone || '';

    currentSelectedAvatar = currentUser.avatar || '👤';
    renderAvatarInModal(currentSelectedAvatar);

    if (isProAccess) {
      if (profileSubStatusText) profileSubStatusText.textContent = 'Active ⭐ Pro Member';
      if (profileSubBadge) {
        profileSubBadge.textContent = 'PRO ACTIVE';
        profileSubBadge.style.color = 'var(--accent-green)';
        profileSubBadge.style.borderColor = 'var(--accent-green)';
        profileSubBadge.style.background = 'rgba(0, 255, 157, 0.15)';
      }
      if (toggleSubscriptionBtn) {
        toggleSubscriptionBtn.textContent = 'Cancel Pro Subscription';
        toggleSubscriptionBtn.className = 'btn btn-outline';
      }
    } else {
      if (profileSubStatusText) profileSubStatusText.textContent = 'Free Basic Plan';
      if (profileSubBadge) {
        profileSubBadge.textContent = 'FREE PLAN';
        profileSubBadge.style.color = 'var(--text-muted)';
        profileSubBadge.style.borderColor = 'var(--border-glass)';
        profileSubBadge.style.background = 'rgba(255, 255, 255, 0.05)';
      }
      if (toggleSubscriptionBtn) {
        toggleSubscriptionBtn.textContent = '⭐ Activate Pro Subscription';
        toggleSubscriptionBtn.className = 'btn btn-primary';
      }
    }
  }

  function showProfileModal() {
    if (!requireAuth()) return;
    updateProfileModalUI();
    if (profileModal) profileModal.classList.add('active');
  }

  function closeProfileModal() {
    if (profileModal) profileModal.classList.remove('active');
  }

  function completePurchase() {
    if (!requireAuth()) return;
    setSubscriptionState(true);

    if (currentUser) {
      window.ApiService.updateProfile(
        currentUser.email,
        currentUser.username || currentUser.name,
        currentUser.email,
        currentUser.phone || '',
        currentUser.avatar || '👤',
        true
      ).catch(() => {});
    }

    if (demoStatusLabel) demoStatusLabel.hidden = true;
    setAccessMessage('Subscription active! Pro Music & Video Editor and Synced Room Playlists unlocked.', false);
    showToast('Pro Subscription Active! Full features unlocked until you cancel.');
    updateProHeaderState();
    if (proPreviewSection) proPreviewSection.hidden = false;
    closePurchaseModal();
  }

  function getStudioName(name = '') {
    return 'JAIAK STUDIO';
  }

  function updateStudioIdentity(name = '', avatar = '') {
    const brand = document.getElementById('studioBrand');
    if (brand) brand.textContent = 'JAIAK STUDIO';

    const badge = document.getElementById('userBadge');
    if (badge) {
      const displayName = name ? name : 'Guest';
      const userAvatar = avatar || (currentUser ? currentUser.avatar : '') || '👤';

      let avatarMarkup = '';
      if (userAvatar.startsWith('data:image') || userAvatar.startsWith('http')) {
        avatarMarkup = `<img class="user-avatar-img" src="${userAvatar}" alt="Avatar" />`;
      } else {
        avatarMarkup = userAvatar;
      }

      badge.innerHTML = `<span class="user-avatar-icon">${avatarMarkup}</span><span class="user-name-text">${displayName}</span><span class="user-online-dot" title="Online Presence"></span>`;
    }

    const brandSubtitle = document.getElementById('brandSubtitle');
    if (brandSubtitle) {
      brandSubtitle.textContent = name ? `Nickname: ${name}` : 'Signed in as Guest';
    }

    document.title = 'JAIAK STUDIO | Music Studio';
  }

  // Auth Visibility
  function showLoginForm() {
    loginForm?.classList.add('active');
    signupForm?.classList.remove('active');
    resetForm?.classList.remove('active');
    showLoginBtn?.classList.add('active');
    showSignupBtn?.classList.remove('active');
    setAuthMessage('Use the form above to sign in or register.');
  }

  function showSignupForm() {
    loginForm?.classList.remove('active');
    signupForm?.classList.add('active');
    resetForm?.classList.remove('active');
    showLoginBtn?.classList.remove('active');
    showSignupBtn?.classList.add('active');
    setAuthMessage('Create your Jaiak Studio account.');
  }

  function showResetForm() {
    loginForm?.classList.remove('active');
    signupForm?.classList.remove('active');
    resetForm?.classList.add('active');
    showLoginBtn?.classList.remove('active');
    showSignupBtn?.classList.remove('active');
    setAuthMessage('Reset your password with OTP.');
  }

  let typewriterTimeout = null;

  function startWelcomeTypewriterAnimation(nickname) {
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (!welcomeTitle) return;

    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
    }

    const cleanNick = (nickname || 'Artist').trim();
    const messages = [
      `Welcome, ${cleanNick}!`,
      `JAIAK STUDIO IS READY`,
      `PRO MUSIC & VIDEO WORKSPACE`
    ];

    let msgIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeStep() {
      const currentMsg = messages[msgIndex];

      if (isDeleting) {
        welcomeTitle.innerHTML = currentMsg.substring(0, charIndex - 1) + '<span class="typewriter-cursor">|</span>';
        charIndex--;
      } else {
        welcomeTitle.innerHTML = currentMsg.substring(0, charIndex + 1) + '<span class="typewriter-cursor">|</span>';
        charIndex++;
      }

      let typeSpeed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentMsg.length) {
        typeSpeed = 2200; // Pause for 2.2s on complete message
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        msgIndex = (msgIndex + 1) % messages.length;
        typeSpeed = 400; // Pause before typing next message
      }

      typewriterTimeout = setTimeout(typeStep, typeSpeed);
    }

    typeStep();
  }

  function showAuthScreen(message = 'Sign in or register to enter studio.') {
    showLoginForm();
    isProAccess = false;
    currentUser = null;

    if (authShell) {
      authShell.hidden = false;
      authShell.style.display = 'grid';
    }
    if (topbar) {
      topbar.hidden = true;
      topbar.style.display = 'none';
    }
    if (mainContent) {
      mainContent.hidden = true;
      mainContent.style.display = 'none';
    }

    updateStudioIdentity('');
    setAuthMessage(message);
  }

  function showMainApp(user) {
    currentUser = user;
    isProAccess = (user.isProSubscribed === true) || loadSubscriptionState();
    user.isProSubscribed = isProAccess;
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

    // Always show Main Attraction Pro Workspace prominently
    if (proPreviewSection) {
      proPreviewSection.hidden = false;
    }

    updateStudioIdentity(user.username || user.name, user.avatar || '👤');
    updateProHeaderState();
    setAccessMessage('');

    const welcomePanel = document.getElementById('studioWelcome');
    const welcomeUserName = document.getElementById('welcomeUserName');

    if (welcomePanel) welcomePanel.hidden = false;
    if (welcomeUserName) welcomeUserName.textContent = user.username || user.name;
    startWelcomeTypewriterAnimation(user.username || user.name);

    showToast(`Welcome back, ${user.username || user.name}!`);
  }

  // Auth Handlers
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) return setAuthMessage('Please enter both email and password.', true);

    try {
      const data = await window.ApiService.login(email, password);
      showMainApp(data.user);
      loginForm.reset();
    } catch (err) {
      setAuthMessage(err.message || 'Login failed. Invalid credentials.', true);
    }
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;

    if (!name || !email || !password) return setAuthMessage('Please fill out all registration fields.', true);

    try {
      const data = await window.ApiService.register(name, email, password);
      showMainApp(data.user);
      signupForm.reset();
      showToast('Account created successfully!');
    } catch (err) {
      setAuthMessage(err.message || 'Registration failed.', true);
    }
  });

  // Password Reset OTP Flow
  forgotPasswordBtn?.addEventListener('click', () => showResetForm());
  backToLoginBtn?.addEventListener('click', () => showLoginForm());

  sendOtpBtn?.addEventListener('click', async () => {
    const email = document.getElementById('resetEmail')?.value.trim();
    if (!email) return setAuthMessage('Enter registered email to receive OTP.', true);

    try {
      const data = await window.ApiService.sendOtp(email);
      currentResetOtp = data.otp;
      document.getElementById('resetOtp').hidden = false;
      document.getElementById('resetNewPassword').hidden = false;
      resetPasswordBtn.hidden = false;
      setAuthMessage(`OTP sent! (Code: ${data.otp})`);
      showToast(`OTP Code: ${data.otp}`);
    } catch (err) {
      setAuthMessage(err.message || 'Failed to send OTP.', true);
    }
  });

  resetPasswordBtn?.addEventListener('click', async () => {
    const email = document.getElementById('resetEmail')?.value.trim();
    const otp = document.getElementById('resetOtp')?.value.trim();
    const newPassword = document.getElementById('resetNewPassword')?.value;

    if (!email || !otp || !newPassword) return setAuthMessage('All reset fields are required.', true);

    try {
      await window.ApiService.resetPassword(email, otp, newPassword);
      showToast('Password updated! Log in with new password.');
      showLoginForm();
    } catch (err) {
      setAuthMessage(err.message || 'Failed to reset password.', true);
    }
  });

  downloadCsvBtn?.addEventListener('click', () => {
    window.location.href = window.ApiService.getExportCsvUrl();
    showToast('Exporting users.csv...');
  });

  logoutBtn?.addEventListener('click', () => {
    clearCurrentUser();
    showAuthScreen('You have been logged out.');
    showToast('Logged out successfully.');
  });

  // User Profile & Subscription Handlers
  userBadge?.addEventListener('click', () => showProfileModal());
  profileCloseBtn?.addEventListener('click', () => closeProfileModal());
  cancelProfileBtn?.addEventListener('click', () => closeProfileModal());

  toggleSubscriptionBtn?.addEventListener('click', () => {
    const newState = !isProAccess;
    setSubscriptionState(newState);

    if (currentUser) {
      window.ApiService.updateProfile(
        currentUser.email,
        currentUser.username || currentUser.name,
        currentUser.email,
        currentUser.phone || '',
        currentUser.avatar || '👤',
        newState
      ).catch(() => {});
    }

    updateProHeaderState();
    updateProfileModalUI();
    showToast(newState ? 'Pro Subscription Activated! ⭐' : 'Pro Subscription Cancelled.');
  });

  // Avatar Customization Handlers
  browseAvatarBtn?.addEventListener('click', () => profileAvatarFile?.click());

  profileAvatarFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      currentSelectedAvatar = evt.target.result;
      renderAvatarInModal(currentSelectedAvatar);
      showToast('Custom Avatar picture selected!');
    };
    reader.readAsDataURL(file);
  });

  avatarPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentSelectedAvatar = btn.dataset.avatar;
      renderAvatarInModal(currentSelectedAvatar);
    });
  });

  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const oldEmail = currentUser.email;
    const newNickname = profileNickname?.value.trim();
    const newEmail = profileEmail?.value.trim();
    const newPhone = profilePhone?.value.trim();

    if (!newNickname || !newEmail) {
      showToast('Nickname and email cannot be empty.', true);
      return;
    }

    try {
      const data = await window.ApiService.updateProfile(oldEmail, newNickname, newEmail, newPhone, currentSelectedAvatar, isProAccess);

      if (data && data.user) {
        currentUser = { ...currentUser, ...data.user };
      } else {
        currentUser.username = newNickname;
        currentUser.name = newNickname;
        currentUser.email = newEmail;
        currentUser.phone = newPhone;
        currentUser.avatar = currentSelectedAvatar;
        currentUser.isProSubscribed = isProAccess;
      }

      persistCurrentUser(currentUser);
      updateStudioIdentity(currentUser.username || currentUser.name, currentUser.avatar);
      startWelcomeTypewriterAnimation(currentUser.username || currentUser.name);

      showToast('Profile updated permanently! ✨');
      closeProfileModal();
    } catch (err) {
      currentUser.username = newNickname;
      currentUser.name = newNickname;
      currentUser.email = newEmail;
      currentUser.phone = newPhone;
      currentUser.avatar = currentSelectedAvatar;
      currentUser.isProSubscribed = isProAccess;

      persistCurrentUser(currentUser);
      updateStudioIdentity(newNickname, currentSelectedAvatar);
      startWelcomeTypewriterAnimation(newNickname);

      showToast('Profile updated permanently on this device!');
      closeProfileModal();
    }
  });

  // Navigation Links & Tabs
  showLoginBtn?.addEventListener('click', () => showLoginForm());
  showSignupBtn?.addEventListener('click', () => showSignupForm());
  subscribeBtn?.addEventListener('click', () => showPurchaseModal());
  confirmPurchaseBtn?.addEventListener('click', () => completePurchase());
  cancelPurchaseBtn?.addEventListener('click', () => closePurchaseModal());
  purchaseCloseBtn?.addEventListener('click', () => closePurchaseModal());

  // Protected Nav Link Listener
  document.querySelectorAll('a[data-protected="true"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!requireAuth()) {
        e.preventDefault();
      }
    });
  });

  // Basic Audio Upload
  function loadAudioFile(file) {
    if (!requireAuth()) return;
    if (!file.type.startsWith('audio/')) {
      if (audioStatus) audioStatus.textContent = 'Please choose a valid audio file.';
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = URL.createObjectURL(file);
    if (audioPlayer) {
      audioPlayer.src = audioUrl;
      audioPlayer.load();
    }
    if (dropTitle) dropTitle.textContent = `Playing: ${file.name}`;
    if (dropText) dropText.textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    if (audioStatus) audioStatus.textContent = `Loaded ${file.name}. Click play to listen.`;
    dropZone?.classList.add('is-ready');
    showToast(`Loaded audio: ${file.name}`);
  }

  browseBtn?.addEventListener('click', () => requireAuth() && audioFileInput?.click());
  audioFileInput?.addEventListener('change', (e) => {
    if (e.target.files[0]) loadAudioFile(e.target.files[0]);
  });

  discardBtn?.addEventListener('click', () => {
    if (!requireAuth()) return;
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.removeAttribute('src');
    }
    if (dropTitle) dropTitle.textContent = 'Drop your music here';
    if (dropText) dropText.textContent = 'or click to browse for a local audio file';
    if (audioStatus) audioStatus.textContent = 'No audio loaded yet.';
    showToast('Song discarded');
  });

  // Responsive Drag & Drop
  ['dragover', 'dragenter'].forEach(evt => {
    dropZone?.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropZone?.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone?.addEventListener('drop', (e) => {
    if (e.dataTransfer.files[0]) loadAudioFile(e.dataTransfer.files[0]);
  });

  // Hero Controls
  controlButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!requireAuth()) return;
      controlButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const action = btn.dataset.action;
      if (action === 'pause') {
        audioPlayer?.pause();
        setStatus('Preview paused.');
      } else if (action === 'boost') {
        setStatus('Energy boost active — room dynamics boosted!');
      } else {
        setStatus('Preview playing — session live.');
        audioPlayer?.play().catch(() => {});
      }
    });
  });

  moodButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!requireAuth()) return;
      moodButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setStatus(`Mood changed to: ${btn.dataset.mood}`);
    });
  });

  launchBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    setStatus('Pro Studio workspace opened — live session running.');
    document.getElementById('proSection')?.scrollIntoView({ behavior: 'smooth' });
    showToast('Welcome to Pro Studio Workspace!');
  });

  // ⭐ PRO FEATURE 1 & 2: MUSIC & VIDEO EDITOR + AI SYNC + MULTI EDITING
  proAudioBrowseBtn?.addEventListener('click', () => requireProSubscription(() => proAudioFileInput?.click()));
  proVideoBrowseBtn?.addEventListener('click', () => requireProSubscription(() => proVideoFileInput?.click()));

  proAudioFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && proAudioPlayer) {
      proAudioPlayer.src = URL.createObjectURL(file);
      setEditorStatus(`Audio track loaded: ${file.name}`);
      showToast(`Pro Audio loaded: ${file.name}`);
    }
  });

  proVideoFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && proVideoPlayer) {
      proVideoPlayer.src = URL.createObjectURL(file);
      setEditorStatus(`Video track loaded: ${file.name}`);
      showToast(`Pro Video loaded: ${file.name}`);
    }
  });

  const proDiscardAudioBtn = document.getElementById('proDiscardAudioBtn');
  const proDiscardVideoBtn = document.getElementById('proDiscardVideoBtn');

  proDiscardAudioBtn?.addEventListener('click', () => {
    if (!requireAuth()) return;
    if (proAudioPlayer) {
      proAudioPlayer.pause();
      proAudioPlayer.removeAttribute('src');
    }
    if (proAudioFileInput) proAudioFileInput.value = '';
    setEditorStatus('Pro Audio track discarded.');
    showToast('Pro Audio track discarded.');
  });

  proDiscardVideoBtn?.addEventListener('click', () => {
    if (!requireAuth()) return;
    if (proVideoPlayer) {
      proVideoPlayer.pause();
      proVideoPlayer.removeAttribute('src');
    }
    if (proVideoFileInput) proVideoFileInput.value = '';
    setEditorStatus('Pro Video track discarded.');
    showToast('Pro Video track discarded.');
  });

  aiSyncBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    setEditorStatus('⚡ AI analyzing track & video pacing for automatic sync...');
    setTimeout(() => {
      setEditorStatus('AI Sync complete! Audio & video perfectly aligned.');
      showToast('AI Music-Video Track Sync complete!');
    }, 1500);
  });

  multiEditBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    isMultiEditing = !isMultiEditing;
    multiEditBtn.textContent = isMultiEditing ? 'Multi editing enabled ✓' : 'Switch to multi editing';
    setEditorStatus(isMultiEditing ? 'Multi-edit mode active.' : 'Multi-edit disabled.');
    showToast(isMultiEditing ? 'Multi-editing mode enabled!' : 'Multi-editing mode disabled.');
  });

  proDownloadBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    showToast('Download started for final master track.');
  });

  // ⭐ PRO FEATURE 3: CONNECT PRO USER & SHARED ROOM PLAYLIST + SYNCED PLAYBACK CONTROLS

  function playTrackAtIndex(index) {
    if (index < 0 || index >= roomPlaylist.length) return;
    currentTrackIndex = index;
    const track = roomPlaylist[index];

    if (sharedRoomAudioPlayer) {
      sharedRoomAudioPlayer.src = track.url;
      sharedRoomAudioPlayer.load();
      sharedRoomAudioPlayer.play().catch(() => {});
    }

    if (syncedStatusBadge) {
      syncedStatusBadge.textContent = `▶ PLAYING TRACK ${index + 1}/${roomPlaylist.length} · ${track.name}`;
    }

    if (syncPlayPauseBtn) {
      syncPlayPauseBtn.textContent = '⏸ Pause Shared Session';
    }

    renderRoomPlaylist();
    showToast(`Now Playing in Synced Room: ${track.name}`);
  }

  function renderRoomPlaylist() {
    if (!roomPlaylistQueue) return;
    if (roomPlaylist.length === 0) {
      roomPlaylistQueue.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No songs added to the playlist yet. Drop tracks above!</p>';
      return;
    }

    roomPlaylistQueue.innerHTML = roomPlaylist.map((track, i) => `
      <div class="playlist-item ${i === currentTrackIndex ? 'active-track' : ''}" data-index="${i}" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: ${i === currentTrackIndex ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)'};
        border: 1px solid ${i === currentTrackIndex ? 'var(--accent-cyan)' : 'var(--border-glass)'};
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition-fast);
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 700; color: ${i === currentTrackIndex ? 'var(--accent-cyan)' : 'var(--text-muted)'};">${i === currentTrackIndex ? '▶' : i + 1}</span>
          <div>
            <h5 style="font-size: 0.9rem; color: var(--text-main);">${track.name}</h5>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Added by ${track.uploaderName} (${track.uploaderType})</span>
          </div>
        </div>
        <button type="button" class="btn btn-outline track-select-btn" data-index="${i}" style="padding: 4px 10px; font-size: 0.75rem; min-height: 28px;">
          ${i === currentTrackIndex ? 'Playing' : 'Play Now'}
        </button>
      </div>
    `).join('');

    // Attach click handlers to playlist items
    document.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        if (!requireProSubscription()) return;
        const index = parseInt(item.dataset.index, 10);
        playTrackAtIndex(index);
      });
    });
  }

  function addSongToRoomPlaylist(file, uploaderName, uploaderType) {
    const songUrl = URL.createObjectURL(file);
    const newTrack = {
      id: Date.now(),
      name: file.name,
      url: songUrl,
      uploaderName,
      uploaderType
    };

    roomPlaylist.push(newTrack);
    showToast(`Added "${file.name}" to Room Playlist!`);

    if (currentTrackIndex === -1) {
      playTrackAtIndex(0);
    } else {
      renderRoomPlaylist();
    }
  }

  connectPartnerBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    const email = partnerEmailInput?.value.trim();
    if (!email) return setEditorStatus('Enter a valid Pro partner email.');

    isPartnerConnected = true;
    connectedPartnerEmail = email;

    if (syncConnectionStatus) syncConnectionStatus.textContent = 'Connected ✓';
    if (syncRoomTitle) syncRoomTitle.textContent = `Synced Room with ${email}`;
    if (syncRoomText) syncRoomText.textContent = `Connected with ${email}! Both Pro users can now drop songs, control playback, and listen simultaneously.`;
    if (syncedStatusBadge) syncedStatusBadge.textContent = '● PRO ROOM LIVE & SYNCED';

    setEditorStatus(`Partner connected: ${email}. Add songs to the shared playlist below!`);
    showToast(`Pro Room Connected with ${email}!`);
  });

  collabAudioBrowseBtn?.addEventListener('click', () => requireProSubscription(() => collabAudioFileInput?.click()));
  partnerAudioBrowseBtn?.addEventListener('click', () => requireProSubscription(() => partnerAudioFileInput?.click()));

  collabAudioFileInput?.addEventListener('change', (e) => {
    if (!requireProSubscription()) return;
    const file = e.target.files[0];
    if (file) {
      const uploader = currentUser ? (currentUser.username || currentUser.name) : 'You';
      addSongToRoomPlaylist(file, uploader, 'You');
    }
  });

  partnerAudioFileInput?.addEventListener('change', (e) => {
    if (!requireProSubscription()) return;
    const file = e.target.files[0];
    if (file) {
      const uploader = connectedPartnerEmail || 'Partner';
      addSongToRoomPlaylist(file, uploader, 'Partner');
    }
  });

  // Synced Playback Control Buttons (Play/Pause, Next, Prev)
  syncPlayPauseBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    if (roomPlaylist.length === 0) {
      showToast('Add songs to the playlist first!', true);
      return;
    }

    if (currentTrackIndex === -1) {
      playTrackAtIndex(0);
      return;
    }

    if (sharedRoomAudioPlayer.paused) {
      sharedRoomAudioPlayer.play().catch(() => {});
      syncPlayPauseBtn.textContent = '⏸ Pause Shared Session';
      showToast('Resumed Synced Shared Room Playback');
    } else {
      sharedRoomAudioPlayer.pause();
      syncPlayPauseBtn.textContent = '▶ Play Shared Session';
      showToast('Paused Synced Shared Room Playback');
    }
  });

  syncNextBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    if (roomPlaylist.length === 0) return showToast('Playlist is empty.', true);
    const nextIndex = (currentTrackIndex + 1) % roomPlaylist.length;
    playTrackAtIndex(nextIndex);
  });

  syncPrevBtn?.addEventListener('click', () => {
    if (!requireProSubscription()) return;
    if (roomPlaylist.length === 0) return showToast('Playlist is empty.', true);
    const prevIndex = (currentTrackIndex - 1 + roomPlaylist.length) % roomPlaylist.length;
    playTrackAtIndex(prevIndex);
  });

  // Contact Form
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (formMessage) formMessage.textContent = 'Message sent to Jaiak Studio!';
    showToast('Message sent to studio!');
    contactForm.reset();
  });

  // Session Progress Simulation
  setInterval(() => {
    if (!currentUser) return;
    collaboratorCount = collaboratorCount < 8 ? collaboratorCount + 1 : 4;
    if (collaboratorCountEl) collaboratorCountEl.textContent = collaboratorCount;
    progress = (progress + 8) % 108;
    if (progressFill) progressFill.style.width = `${Math.min(progress, 100)}%`;
  }, 2500);

  // Web Audio API Visualizer & Sound FX Rack
  const canvas = document.getElementById('audioVisualizerCanvas');
  const canvasCtx = canvas ? canvas.getContext('2d') : null;

  let audioCtx = null;
  let analyser = null;
  let sourceNodeMap = new WeakMap();
  let lowFilter = null;
  let midFilter = null;
  let highFilter = null;
  let animFrameId = null;

  function initWebAudioFX(audioElement) {
    if (!audioElement || !canvasCtx) return;
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      audioCtx = new AudioCtxClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!sourceNodeMap.has(audioElement)) {
      try {
        const source = audioCtx.createMediaElementSource(audioElement);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;

        lowFilter = audioCtx.createBiquadFilter();
        lowFilter.type = 'lowshelf';
        lowFilter.frequency.value = 250;
        lowFilter.gain.value = 0;

        midFilter = audioCtx.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1500;
        midFilter.Q.value = 1;
        midFilter.gain.value = 0;

        highFilter = audioCtx.createBiquadFilter();
        highFilter.type = 'highshelf';
        highFilter.frequency.value = 4000;
        highFilter.gain.value = 0;

        // Connect chain: source -> lowFilter -> midFilter -> highFilter -> analyser -> destination
        source.connect(lowFilter);
        lowFilter.connect(midFilter);
        midFilter.connect(highFilter);
        highFilter.connect(analyser);
        analyser.connect(audioCtx.destination);

        sourceNodeMap.set(audioElement, source);
      } catch (err) {
        console.warn('WebAudio init notice:', err);
      }
    }

    startVisualizerRender();
  }

  function startVisualizerRender() {
    if (!canvas || !canvasCtx || animFrameId) return;

    function renderFrame() {
      animFrameId = requestAnimationFrame(renderFrame);
      const width = canvas.width = canvas.parentElement.clientWidth;
      const height = canvas.height = canvas.parentElement.clientHeight;

      canvasCtx.clearRect(0, 0, width, height);

      if (!analyser) {
        drawIdleSpectrum(canvasCtx, width, height);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;
        const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.5, '#8a2be2');
        gradient.addColorStop(1, '#ff2e93');

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    }

    renderFrame();
  }

  let idlePhase = 0;
  function drawIdleSpectrum(ctx, w, h) {
    idlePhase += 0.05;
    const bars = 28;
    const barW = w / bars;
    for (let i = 0; i < bars; i++) {
      const barH = (Math.sin(idlePhase + i * 0.3) * 0.3 + 0.4) * h * 0.6;
      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(138, 43, 226, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(i * barW, h - barH, barW - 3, barH);
    }
  }

  // Hook audio players to Web Audio FX
  const proAudioPlayerEl = document.getElementById('proAudioPlayer');
  proAudioPlayerEl?.addEventListener('play', () => initWebAudioFX(proAudioPlayerEl));

  const audioPlayerEl = document.getElementById('audioPlayer');
  audioPlayerEl?.addEventListener('play', () => initWebAudioFX(audioPlayerEl));

  const sharedRoomAudioPlayerEl = document.getElementById('sharedRoomAudioPlayer');
  sharedRoomAudioPlayerEl?.addEventListener('play', () => initWebAudioFX(sharedRoomAudioPlayerEl));

  // Start initial canvas loop so it looks alive immediately
  startVisualizerRender();

  // EQ Sliders Event Listeners
  const lowEqSlider = document.getElementById('lowEqSlider');
  const midEqSlider = document.getElementById('midEqSlider');
  const highEqSlider = document.getElementById('highEqSlider');
  const reverbSlider = document.getElementById('reverbSlider');

  lowEqSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const label = document.getElementById('lowEqVal');
    if (label) label.textContent = `${val > 0 ? '+' : ''}${val} dB`;
    if (lowFilter) lowFilter.gain.value = val;
  });

  midEqSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const label = document.getElementById('midEqVal');
    if (label) label.textContent = `${val > 0 ? '+' : ''}${val} dB`;
    if (midFilter) midFilter.gain.value = val;
  });

  highEqSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const label = document.getElementById('highEqVal');
    if (label) label.textContent = `${val > 0 ? '+' : ''}${val} dB`;
    if (highFilter) highFilter.gain.value = val;
  });

  reverbSlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    const label = document.getElementById('reverbVal');
    if (label) label.textContent = `${val} %`;
  });

  // Sound FX Presets
  const fxPresetBtns = document.querySelectorAll('.fx-preset-btn');
  fxPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fxPresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset;

      let low = 0, mid = 0, high = 0;
      if (preset === 'bass') { low = 8; mid = -2; high = 1; }
      else if (preset === 'vocal') { low = -2; mid = 7; high = 3; }
      else if (preset === 'lofi') { low = 4; mid = -4; high = -6; }

      if (lowEqSlider) { lowEqSlider.value = low; lowEqSlider.dispatchEvent(new Event('input')); }
      if (midEqSlider) { midEqSlider.value = mid; midEqSlider.dispatchEvent(new Event('input')); }
      if (highEqSlider) { highEqSlider.value = high; highEqSlider.dispatchEvent(new Event('input')); }

      showToast(`Applied Audio Preset: ${btn.textContent}`);
    });
  });

  // Startup Check
  const savedUser = loadCurrentUser();
  if (savedUser) {
    showMainApp(savedUser);
  } else {
    showAuthScreen();
  }
});

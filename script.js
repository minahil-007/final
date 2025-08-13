// CHANGE THIS to your backend IP
const API_BASE = "https://system-nkgq.vercel.app/api/auth";

// Rate limiting
const rateLimit = {
  attempts: 0,
  lastAttempt: 0,
  maxAttempts: 5,
  lockoutTime: 15 * 60 * 1000 // 15 minutes
};

// Show loading state
function showLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Loading...';
  }
}

// Hide loading state
function hideLoading(buttonId, originalText) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

// Check rate limit
function checkRateLimit() {
  const now = Date.now();
  
  if (rateLimit.attempts >= rateLimit.maxAttempts) {
    if (now - rateLimit.lastAttempt < rateLimit.lockoutTime) {
      const remainingTime = Math.ceil((rateLimit.lockoutTime - (now - rateLimit.lastAttempt)) / 60000);
      alert(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      return false;
    } else {
      // Reset rate limit after lockout period
      rateLimit.attempts = 0;
    }
  }
  
  return true;
}

// Sanitize input
function sanitizeInput(input) {
  return input.replace(/[<>]/g, '').trim();
}

// LOGIN
async function login() {
  const email = sanitizeInput(document.getElementById("loginEmail").value);
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!checkRateLimit()) {
    return;
  }

  showLoading("loginBtn");
  
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { message: text || "Invalid response from server" }; 
    }

    if (res.ok && data.success) {
      rateLimit.attempts = 0; // Reset on success
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("loggedIn", "true");
      alert(data.message || "Login Successful!");
      window.location.href = "home.html";
    } else {
      rateLimit.attempts++;
      rateLimit.lastAttempt = Date.now();
      alert(data.message || `Login failed (${res.status})`);
    }
  } catch (err) {
    console.error(err);
    rateLimit.attempts++;
    rateLimit.lastAttempt = Date.now();
    alert("Error connecting to server.");
  } finally {
    hideLoading("loginBtn", "Login");
  }
}

// SIGNUP
async function signup() {
  const name = sanitizeInput(document.getElementById("signupName").value);
  const email = sanitizeInput(document.getElementById("signupEmail").value);
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!isValidPassword(password)) {
    alert("Password does not meet requirements. Please check the requirements below.");
    return;
  }

  showLoading("signupBtn");

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { message: text || "Invalid response from server" }; 
    }

    if (res.ok && data.success) {
      alert(data.message || "Signup successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message || `Signup failed (${res.status})`);
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  } finally {
    hideLoading("signupBtn", "Signup");
  }
}

// RESET PASSWORD
async function resetPassword() {
  const email = sanitizeInput(document.getElementById("resetEmail").value);
  if (!email) {
    alert("Please enter your email.");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  showLoading("resetBtn");

  try {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { message: text || "Invalid response from server" }; 
    }

    if (res.ok && data.success) {
      alert(data.message || "Reset link sent!");
      window.location.href = "reset-confirmation.html";
    } else {
      alert(data.message || `Reset failed (${res.status})`);
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  } finally {
    hideLoading("resetBtn", "Send Reset Link");
  }
}

// LOGOUT
async function logout() {
  const token = localStorage.getItem("token");

  showLoading("logoutBtn");

  try {
    const res = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { message: text || "Invalid response from server" }; 
    }

    alert(data.message || "Logged out successfully.");
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  } finally {
    hideLoading("logoutBtn", "Logout");
  }

  localStorage.removeItem("token");
  localStorage.removeItem("loggedIn");
  localStorage.setItem("logoutMessage", "true");
  window.location.href = "index.html";
}

// SET NEW PASSWORD
async function setNewPassword(event) {
  event.preventDefault();
  
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  if (!newPassword || !confirmPassword) {
    alert("Please fill in both password fields.");
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  
  if (!isValidPassword(newPassword)) {
    alert("Password does not meet requirements. Please check the requirements below.");
    return;
  }
  
  // Get reset token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) {
    alert("Reset token is missing. Please use the link from your email.");
    return;
  }

  showLoading("updateBtn");
  
  try {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    });

    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { message: text || "Invalid response from server" }; 
    }

    if (res.ok && data.success) {
      alert(data.message || "Password updated successfully!");
      window.location.href = "index.html";
    } else {
      alert(data.message || `Password update failed (${res.status})`);
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  } finally {
    hideLoading("updateBtn", "Update Password");
  }
}

// EMAIL VALIDATION
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// PASSWORD VALIDATION
function isValidPassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// SESSION MANAGEMENT
function checkSession() {
  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");
  
  if (!token || !loggedIn) {
    return false;
  }
  
  // Check if token is expired (assuming JWT with exp claim)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired
      localStorage.removeItem("token");
      localStorage.removeItem("loggedIn");
      return false;
    }
  } catch (e) {
    // Invalid token format
    localStorage.removeItem("token");
    localStorage.removeItem("loggedIn");
    return false;
  }
  
  return true;
}

// Auto-logout on inactivity
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (checkSession()) {
      alert("Session expired due to inactivity. Please login again.");
      logout();
    }
  }, 30 * 60 * 1000); // 30 minutes
}

// Initialize session management
document.addEventListener('DOMContentLoaded', function() {
  // Check session on page load
  if (window.location.pathname.includes('home.html') && !checkSession()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Set up inactivity timer
  resetInactivityTimer();
  
  // Reset timer on user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
});

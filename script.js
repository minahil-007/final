// CHANGE THIS to your backend API URL
const API_BASE = "https://auth-backendd.up.railway.app/api/auth";

// LOGIN
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("loggedIn", "true");
      alert(data.message || "Login Successful!");
      window.location.href = "home.html";
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
}

// SIGNUP
async function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message || "Signup successful! Please verify your email.");
      localStorage.setItem("emailForOtp", email);
      window.location.href = "verify.html"; // redirect to OTP verification page
    } else {
      alert(data.message || "Signup failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
}

// OTP VERIFICATION
async function verifyEmail() {
  const otp = document.getElementById("otp").value.trim();
  const email = localStorage.getItem("emailForOtp");

  if (!otp || otp.length !== 6) {
    alert("Please enter a valid 6-digit OTP.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/verifyEmail`, { // fixed endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message || "Verification successful!");
      localStorage.removeItem("emailForOtp");
      window.location.href = "index.html"; // back to login
    } else {
      alert(data.message || "Invalid OTP. Please try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
}

// RESEND OTP
document.getElementById("resendOtp")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = localStorage.getItem("emailForOtp");

  try {
    const res = await fetch(`${API_BASE}/resendOTP`, { // fixed endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || "OTP resent successfully.");
  } catch (err) {
    console.error(err);
    alert("Error sending OTP.");
  }
});

// RESET PASSWORD
async function resetPassword() {
  const email = document.getElementById("resetEmail").value.trim();
  if (!email) {
    alert("Please enter your email.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/forgotPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || "Reset link sent!");
    if (data.success) {
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
}

// LOGOUT
async function logout() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    alert(data.message || "Logged out successfully.");
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }

  localStorage.removeItem("token");
  localStorage.removeItem("loggedIn");
  localStorage.setItem("logoutMessage", "true");
  window.location.href = "index.html";
}
 
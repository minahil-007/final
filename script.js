// CHANGE THIS to your backend IP
const API_BASE = "https://auth-backendd.up.railway.app/";







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

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message || "Signup successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Signup failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
}

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

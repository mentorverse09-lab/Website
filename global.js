// =========================
// 🌟 MentorVerse Frontend Global API File
// =========================

// Base URL for backend API
const BASE_URL = "http://localhost:5000";

// =========================
// 🌟 API request wrapper
// =========================
async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = "Bearer " + token;
    }

    const options = { method, headers };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(BASE_URL + endpoint, options);
    return response.json();
}

// =========================
// 🌟 REGISTER USER
// =========================
async function registerUser(data) {
    return await apiRequest(
        "/api/auth/register",
        "POST",
        data
    );
}

// =========================
// 🌟 LOGIN USER
// =========================
function showMessage(msg) {
  alert(msg);
}


/// =========================
// 🌍 GLOBAL CONFIG
// =========================
window.BASE_URL = "http://localhost:5000";

// =========================
// 🌟 LOGOUT
// =========================
function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// =========================
// 🌟 GET USER PROFILE
// =========================
async function getProfile() {
    return await apiRequest("/api/users/profile", "GET", null, true);
}

// =========================
// 🌟 UPDATE USER PROFILE
// =========================
async function updateProfile(data) {
    return await apiRequest("/api/users/profile", "PUT", data, true);
}

// =========================
// 🌟 FETCH COURSES
// =========================
async function getCourses() {
    return await apiRequest("/api/courses", "GET");
}

// =========================
// 🌟 FETCH internship
// =========================
async function getinternship() {
    return await apiRequest("/api/internship", "GET");
}

// =========================
// 🌟 FETCH WEBINARS
// =========================
async function getWebinars() {
    return await apiRequest("/api/webinars", "GET");
}

// =========================
// 🌟 GENERAL ALERT HANDLER
// =========================
function showMessage(msg) {
    alert(msg);
}

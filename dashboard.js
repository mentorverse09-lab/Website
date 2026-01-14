document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ dashboard.js loaded");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    // 🔹 ALWAYS fetch fresh profile from backend
    const res = await fetch(`${window.BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    console.log("DASHBOARD PROFILE:", data);

    if (!res.ok) {
      alert("Session expired");
      window.location.href = "login.html";
      return;
    }

    // 🔹 Update UI
    document.getElementById("userName").innerText = data.full_name;
    document.getElementById("userEmail").innerText = data.email;

  } catch (err) {
    console.error("Dashboard load error:", err);
    alert("Server error");
  }
});

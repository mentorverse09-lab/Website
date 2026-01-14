document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const college = document.getElementById("college");
  const branch = document.getElementById("branch");
  const year = document.getElementById("year");
  const form = document.getElementById("profileForm");

  // =========================
  // 🌟 LOAD PROFILE (ONLY ONCE)
  // =========================
  fetch(`${window.BASE_URL}/api/users/profile`, {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      fullName.value = data.full_name || "";
      email.value = data.email || "";
      college.value = data.college_name || "";
      branch.value = data.branch || "";
      year.value = data.year || "";
    })
    .catch(() => alert("Failed to load profile"));

  // =========================
  // 🌟 UPDATE PROFILE
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // 🔥 MOST IMPORTANT LINE

    const payload = {
      full_name: fullName.value.trim(),
      college_name: college.value.trim(),
      branch: branch.value,
      year: year.value
    };

    try {
      const res = await fetch(`${window.BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Update failed");
        return;
      }

      alert("Profile updated successfully");

      // Update localStorage name
      const user = JSON.parse(localStorage.getItem("user"));
      user.full_name = payload.full_name;
      localStorage.setItem("user", JSON.stringify(user));

    } catch {
      alert("Server error");
    }
  });
});

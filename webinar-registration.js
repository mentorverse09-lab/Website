document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const webinarId = params.get("webinar_id");

  if (!webinarId) {
    alert("Invalid webinar");
    return;
  }

  document.getElementById("webinarForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      full_name: full_name.value,
      email: email.value,
      mobile: mobile.value,
      college_name: college_name.value,
      branch: branch.value,
      year: year.value
    };

    try {
      const res = await fetch(
        `${window.BASE_URL}/api/webinars/${webinarId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Webinar registered successfully 🎉");
      window.location.href = "dashboard.html?webinar=registered";

    } catch {
      alert("Server error");
    }
  });
});

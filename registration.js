document.getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    if (password !== confirm) {
        alert("Passwords do not match");
        return;
    }

    const response = await registerUser({
        full_name,
        email,
        password
    });

    alert(response.message || response.error);

    if (response.message) {
        window.location.href = "login.html";
    }
});

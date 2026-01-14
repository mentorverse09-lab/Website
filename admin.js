const token = localStorage.getItem("token");

fetch("http://localhost:5000/api/admin/stats", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.json())
.then(data => {
  document.querySelector("#totalUsers").innerText =
    data.totalUsers + " Registered Users";
});

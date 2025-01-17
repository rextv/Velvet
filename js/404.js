document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("back-to-terminal");
  button.addEventListener("click", () => {
    window.location.href = "/";
  });
});
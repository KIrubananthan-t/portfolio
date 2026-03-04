const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];
const currentYear = document.getElementById("currentYear");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.classList.toggle("active");
    siteNav.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.classList.remove("active");
      siteNav.classList.remove("open");
    });
  });
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

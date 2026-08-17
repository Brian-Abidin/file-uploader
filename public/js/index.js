const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const dropdownIcon = document.getElementById("dropdownIcon");

dropdownBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle("opacity-0");
  dropdownMenu.classList.toggle("scale-y-0");
  dropdownMenu.classList.toggle("pointer-events-none");

  dropdownMenu.classList.toggle("opacity-100");
  dropdownMenu.classList.toggle("scale-y-100");
  dropdownMenu.classList.toggle("pointer-events-auto");

  dropdownIcon.classList.toggle("rotate-360");
});

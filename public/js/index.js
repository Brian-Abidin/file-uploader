const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const dropdownIcon = document.getElementById("dropdownIcon");
const modalBtn = document.getElementById("modalBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");

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

modalBtn.addEventListener("click", () => {
  modal.showModal();
  console.log("hello?");
});

// close modal
closeModalBtn.addEventListener("click", () => {
  modal.close();
});

// if user clicks on the backdrop area outside of modal the modal closes
modal.addEventListener("click", (e) => {
  const dialogDimensions = modal.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    modal.close();
  }
});

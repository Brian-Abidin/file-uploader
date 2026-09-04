const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const dropdownIcon = document.getElementById("dropdownIcon");

const modalBtnFile = document.getElementById("modalBtn-file");
const modalFile = document.getElementById("modal-file");
const closeModalBtnFile = document.getElementById("close-modal-btn-file");

const modalBtnFolder = document.getElementById("modalBtn-folder");
const modalFolder = document.getElementById("modal-folder");
const closeModalBtnFolder = document.getElementById("close-modal-btn-folder");

const pagePath = document.getElementById("page-path");
const pagePathFolder = document.getElementById("page-path-folder");

const dropdownFolder = document.getElementsByClassName(
  ".dropdown-toggle-folder"
);

pagePath.value = window.location.pathname;
pagePathFolder.value = window.location.pathname;

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

// open file upload and create new folder modals
// modalBtnFile.addEventListener("click", () => {
//   modalFile.showModal();
//   console.log("hello?");
// });

modalBtnFolder.addEventListener("click", () => {
  modalFolder.showModal();
  console.log("hello?");
});

// close file upload and create new folder modal
// closeModalBtnFile.addEventListener("click", () => {
//   modalFile.close();
// });
closeModalBtnFolder.addEventListener("click", () => {
  modalFolder.close();
});

document.addEventListener("click", (event) => {
  const isToggle = event.target.matches(".dropdown-toggle-folder");
  console.log(event.target, isToggle);
  const currentDropdown = isToggle
    ? event.target.closest(".dropdown-folder")
    : null;
  console.log(currentDropdown, "HELP");
  // const secondChild = currentDropdown.children[1];
  if (isToggle) {
    currentDropdown.children[1].classList.toggle("opacity-0");
    currentDropdown.children[1].classList.toggle("scale-y-0");
    currentDropdown.children[1].classList.toggle("pointer-events-none");

    currentDropdown.children[1].classList.toggle("opacity-100");
    currentDropdown.children[1].classList.toggle("scale-y-100");
    currentDropdown.children[1].classList.toggle("pointer-events-auto");
  }
  // closes dropdown if outside of menu
  document.querySelectorAll(".dropdown-folder").forEach((dropdown) => {
    if (
      currentDropdown !== dropdown &&
      dropdown.children[1].classList.contains("opacity-100")
    ) {
      dropdown.children[1].classList.toggle("opacity-0");
      dropdown.children[1].classList.toggle("scale-y-0");
      dropdown.children[1].classList.toggle("pointer-events-none");

      dropdown.children[1].classList.toggle("opacity-100");
      dropdown.children[1].classList.toggle("scale-y-100");
      dropdown.children[1].classList.toggle("pointer-events-auto");
    }
  });
});

// document.addEventListener("click", (e) => {
//   const dropdowns = document.querySelectorAll(".dropdown-menu-folder").forEach((dropdown) => {
//   if(!dropdowns.includes(e.target)){
//     dropdowns.forEach((dropdown) => {
//       if(dropdown.classList.contains("opacity-100"))
//       dropdown.classList.remove("opacity-100")
//       dropdown.classList.add("opacity-0")
//     })
//   }
// })

// closes modal if click is outside
modalFolder.addEventListener("click", (e) => {
  const dialogDimensions = modalFolder.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    modalFolder.close();
  }
});

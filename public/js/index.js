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

// if user clicks on the backdrop area outside of modal the modal closes
// modalFile.addEventListener("click", (e) => {
//   const dialogDimensions = modalFile.getBoundingClientRect();
//   if (
//     e.clientX < dialogDimensions.left ||
//     e.clientX > dialogDimensions.right ||
//     e.clientY < dialogDimensions.top ||
//     e.clientY > dialogDimensions.bottom
//   ) {
//     modalFile.close();
//   }
// });

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

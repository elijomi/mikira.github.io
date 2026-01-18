const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-control.prev");
const nextButton = document.querySelector(".lightbox-control.next");

const images = galleryItems.map((item) => {
  const img = item.querySelector("img");
  return {
    src: img.getAttribute("src"),
    alt: img.getAttribute("alt"),
  };
});

let currentIndex = 0;

const openLightbox = (index) => {
  currentIndex = index;
  const { src, alt } = images[currentIndex];
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const showNext = () => {
  currentIndex = (currentIndex + 1) % images.length;
  openLightbox(currentIndex);
};

const showPrev = () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  openLightbox(currentIndex);
};

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => openLightbox(index));
});

closeButton.addEventListener("click", closeLightbox);
nextButton.addEventListener("click", showNext);
prevButton.addEventListener("click", showPrev);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowRight") {
    showNext();
  }

  if (event.key === "ArrowLeft") {
    showPrev();
  }
});

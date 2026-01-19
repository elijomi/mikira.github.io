// Image metadata with dimensions for performance and preventing layout shift
const imageMetadata = {
  "photo-01.jpg": { width: 2048, height: 1538 },
  "photo-02.jpg": { width: 2027, height: 2700 },
  "photo-03.jpg": { width: 2700, height: 2027 },
  "photo-04.jpg": { width: 2700, height: 2027 },
  "photo-05.jpg": { width: 2027, height: 2700 },
  "photo-06.jpg": { width: 2700, height: 2027 },
  "photo-07.jpg": { width: 2027, height: 2700 },
  "photo-08.jpg": { width: 2700, height: 2027 },
  "photo-09.jpg": { width: 2700, height: 2027 },
};

let images = [];
let currentIndex = 0;
let currentTab = 'sport'; // Default active tab
let lightboxInitialized = false; // Track if lightbox has been initialized

// Fetch images from GitHub API for a specific subfolder
async function fetchImages(subfolder = 'sport') {
  const apiUrl = `https://api.github.com/repos/elijomi/mikira.github.io/contents/assets/images/${subfolder}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }
    
    const files = await response.json();
    
    // Filter for image files and sort alphabetically
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files
      .filter(file => {
        const ext = file.name.toLowerCase().match(/\.[^.]+$/);
        return ext && imageExtensions.includes(ext[0]);
      })
      .map(file => file.name)
      .sort();
    
    return imageFiles;
  } catch (error) {
    console.error('Error fetching images from GitHub API:', error);
    // Fallback to known images from metadata if available
    return Object.keys(imageMetadata).sort();
  }
}

// Render gallery items dynamically
function renderGallery(imageFiles, subfolder = 'sport') {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = ''; // Clear existing content
  
  imageFiles.forEach((filename, index) => {
    const button = document.createElement('button');
    button.className = 'gallery-item';
    button.type = 'button';
    button.setAttribute('data-index', index);
    
    const img = document.createElement('img');
    img.src = `./assets/images/${subfolder}/${filename}`;
    img.loading = 'lazy';
    
    // Use metadata if available, otherwise use default dimensions
    if (imageMetadata[filename]) {
      img.width = imageMetadata[filename].width;
      img.height = imageMetadata[filename].height;
    }
    
    button.appendChild(img);
    gallery.appendChild(button);
  });
  
  // Store images for lightbox
  images = imageFiles.map(filename => ({
    src: `./assets/images/${subfolder}/${filename}`,
    alt: '',
  }));
}

// Initialize lightbox functionality
function initializeLightbox() {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const lightboxCaption = document.querySelector(".lightbox-caption");
  const closeButton = document.querySelector(".lightbox-close");

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

  // Attach gallery item click listeners
  attachGalleryListeners(openLightbox);

  // Only initialize these listeners once
  if (!lightboxInitialized) {
    closeButton.addEventListener("click", closeLightbox);

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
    });

    lightboxInitialized = true;
  }
}

// Attach click listeners to gallery items
function attachGalleryListeners(openLightbox) {
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load initial tab (sport)
  const imageFiles = await fetchImages(currentTab);
  renderGallery(imageFiles, currentTab);
  initializeLightbox();
  initializeScrollToTop();
  initializeTabs();
});

// Initialize tab functionality
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      // Get the tab to switch to
      const tabName = tab.getAttribute('data-tab');
      
      // If clicking the same tab, do nothing
      if (tabName === currentTab) {
        return;
      }
      
      // Update active states
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      
      // Update gallery panel aria-labelledby
      const galleryPanel = document.querySelector('.gallery');
      galleryPanel.setAttribute('aria-labelledby', `tab-${tabName}`);
      
      // Update current tab
      currentTab = tabName;
      
      // Fetch and render images for the new tab
      const imageFiles = await fetchImages(currentTab);
      renderGallery(imageFiles, currentTab);
      initializeLightbox(); // Re-initialize lightbox with new images
    });
  });
}

// Initialize scroll-to-top button
function initializeScrollToTop() {
  const scrollToTopButton = document.querySelector('.scroll-to-top');
  
  if (!scrollToTopButton) {
    return;
  }
  
  // Show/hide button based on scroll position
  const toggleScrollButton = () => {
    if (window.scrollY > 300) {
      scrollToTopButton.classList.add('visible');
    } else {
      scrollToTopButton.classList.remove('visible');
    }
  };
  
  // Scroll to top smoothly when clicked
  scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Listen for scroll events
  window.addEventListener('scroll', toggleScrollButton);
  
  // Check initial scroll position
  toggleScrollButton();
}

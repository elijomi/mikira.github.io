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

let currentTab = 'sport'; // Default active tab

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
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = `./assets/images/${subfolder}/${filename}`;
    img.loading = 'lazy';
    
    // Use metadata if available, otherwise use default dimensions
    if (imageMetadata[filename]) {
      img.width = imageMetadata[filename].width;
      img.height = imageMetadata[filename].height;
    }
    
    div.appendChild(img);
    gallery.appendChild(div);
  });
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load initial tab (sport)
  const imageFiles = await fetchImages(currentTab);
  renderGallery(imageFiles, currentTab);
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

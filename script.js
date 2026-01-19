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
    
    // Filter for image files
    const imageExtensions = ['.avif', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files
      .filter(file => {
        const ext = file.name.toLowerCase().match(/\.[^.]+$/);
        return ext && imageExtensions.includes(ext[0]);
      })
      .map(file => file.name);
    
    // Group images by base name (without extension)
    const imageGroups = {};
    imageFiles.forEach(filename => {
      const baseName = filename.replace(/\.(avif|jpg|jpeg|png|gif|webp)$/i, '');
      if (!imageGroups[baseName]) {
        imageGroups[baseName] = {};
      }
      
      const ext = filename.match(/\.(avif|jpg|jpeg|png|gif|webp)$/i)[0].toLowerCase();
      if (ext === '.avif') {
        imageGroups[baseName].avif = filename;
      } else if (ext === '.jpg' || ext === '.jpeg') {
        imageGroups[baseName].jpeg = filename;
      } else {
        imageGroups[baseName].other = filename;
      }
    });
    
    // Sort by base name
    return Object.keys(imageGroups).sort().map(baseName => imageGroups[baseName]);
  } catch (error) {
    console.error('Error fetching images from GitHub API:', error);
    return [];
  }
}

// Render gallery items dynamically
function renderGallery(imageGroups, subfolder = 'sport') {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = ''; // Clear existing content
  
  imageGroups.forEach((group, index) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    // Use <picture> element to support AVIF with fallback
    const picture = document.createElement('picture');
    
    // Add AVIF source if available (preferred format)
    if (group.avif) {
      const avifSource = document.createElement('source');
      avifSource.srcset = `./assets/images/${subfolder}/${group.avif}`;
      avifSource.type = 'image/avif';
      picture.appendChild(avifSource);
    }
    
    // Add fallback img tag (JPEG or other format)
    const img = document.createElement('img');
    if (group.jpeg) {
      img.src = `./assets/images/${subfolder}/${group.jpeg}`;
    } else if (group.other) {
      img.src = `./assets/images/${subfolder}/${group.other}`;
    } else if (group.avif) {
      // If only AVIF is available, use it as fallback too
      img.src = `./assets/images/${subfolder}/${group.avif}`;
    }
    img.loading = 'lazy';
    
    picture.appendChild(img);
    div.appendChild(picture);
    gallery.appendChild(div);
  });
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load initial tab (sport)
  const imageGroups = await fetchImages(currentTab);
  renderGallery(imageGroups, currentTab);
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
      const imageGroups = await fetchImages(currentTab);
      renderGallery(imageGroups, currentTab);
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

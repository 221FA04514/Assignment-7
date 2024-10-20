// Handle dynamic form validation and submission for the registration page
document.addEventListener('DOMContentLoaded', () => {
    const roleSelector = document.querySelector('#role');
    const additionalFields = document.querySelector('#additional-fields');

    // Show/Hide fields based on role selection
    if (roleSelector) {
        roleSelector.addEventListener('change', () => {
            if (roleSelector.value === 'seller') {
                additionalFields.innerHTML = `<label>Property Details:</label>
                                              <input type="text" name="propertyDetails" required>`;
            } else if (roleSelector.value === 'buyer') {
                additionalFields.innerHTML = `<label>Preferences (Location, Budget):</label>
                                              <input type="text" name="preferences" required>`;
            } else {
                additionalFields.innerHTML = '';
            }
        });
    }

    // Handle form submission with AJAX (simulate)
    const registrationForm = document.querySelector('#registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            alert("Form submitted successfully!");
            // Use AJAX to send form data to server here
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('.gallery');
    const images = gallery.querySelectorAll('img');
    const totalImages = images.length;
    let currentIndex = 0;
    
    function showNextImage() {
        currentIndex = (currentIndex + 1) % totalImages;
        const offset = -currentIndex * 100; // Calculate the offset based on the current index
        gallery.style.transform = `translateX(${offset}%)`;
    }
    
    setInterval(showNextImage, 2000); // Change image every second
});
// script.js

const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Initialize theme based on localStorage
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
}

/* Update Toggle Button Appearance on Page Load */
function updateToggleButton() {
    if (body.classList.contains('dark-mode')) {
        toggleButton.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
        toggleButton.setAttribute('aria-label', 'Switch to Dark Mode');
    }
}

// Initial button state
updateToggleButton();

// Toggle Theme on Button Click
toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save the user's preference in localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
    
    // Update button label
    updateToggleButton();
});

// public/js/modal.js
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById('profileEditModal');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const closeBtn = document.getElementById('closeModal');
  
    // When the user clicks the button, open the modal
    editProfileBtn.onclick = function() {
      modal.style.display = "block";
    }
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  
    // When the user clicks on close button, close the modal
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.style.display = "none";
      }
    }
  });

  // Show overlay when profile pic is clicked
document.querySelector('.profile-pic').addEventListener('click', function() {
    document.getElementById('edit-profile-overlay').style.display = 'flex';
  });
  
  // Close overlay when close button is clicked
  document.querySelector('.close-overlay').addEventListener('click', function() {
    document.getElementById('edit-profile-overlay').style.display = 'none';
  });
  
  // Handle form submission with AJAX
  document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
  
    let formData = new FormData(this);
  
    fetch('/updateProfile', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update welcome message dynamically
        document.getElementById('welcome-message').textContent = `Welcome, ${data.firstName}! Here you can manage your properties and add new listings.`;
  
        // Update profile picture dynamically
        document.querySelector('.profile-pic').src = data.profilePicture;
  
        // Display success message inside overlay
        const messageContainer = document.createElement('p');
        messageContainer.textContent = data.message;
        messageContainer.style.color = 'green';
  
        // Remove any existing messages
        const previousMessage = document.querySelector('.overlay-content p.message');
        if (previousMessage) previousMessage.remove();
  
        // Append success message
        document.querySelector('.overlay-content').appendChild(messageContainer);
  
        // Close overlay after 2 seconds
        setTimeout(() => {
          document.getElementById('edit-profile-overlay').style.display = 'none';
        }, 2000);
      } else {
        // Handle error case
        alert('Failed to update profile.');
      }
    })
    .catch(error => console.error('Error:', error));
  });
  
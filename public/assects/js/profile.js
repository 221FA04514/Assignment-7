
// In public/js/profile.js
function openProfileEditModal() {
    document.getElementById("profileEditModal").classList.remove("hidden");
}

function closeProfileEditModal() {
    document.getElementById("profileEditModal").classList.add("hidden");
}
document.addEventListener("DOMContentLoaded", () => {
    const profilePic = document.querySelector(".profile-pic");
    const overlay = document.getElementById("edit-profile-overlay");
    const closeButton = document.querySelector(".close-overlay");
  
    // Show overlay when profile picture is clicked
    profilePic.addEventListener("click", () => {
      overlay.style.display = "flex";
    });
  
    // Close overlay when close button is clicked
    closeButton.addEventListener("click", () => {
      overlay.style.display = "none";
    });
    
    // Close overlay when clicking outside of the overlay content
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        overlay.style.display = "none";
      }
    });
  });
  
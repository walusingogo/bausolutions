// Initialize EmailJS
emailjs.init("Ib3LPJQWavUBFpeXR"); // Replace with your EmailJS user ID

// Handle Form Submission
document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Collect form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const submitButton = document.getElementById('submitButton');

    // Disable button and show "Sending..."
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    
    // Send email
    emailjs.send("bausolutions_msgservice", "bausolutions_msgtemplate", {
        name: name,
        email: email,
        subject: subject,
        message: message
    }).then(() => {
        // Show toast notification on success
        const toast = new bootstrap.Toast(document.getElementById('emailSuccessToast'));
        toast.show();
        
        // Optionally, you can add a timeout before refreshing the page
        setTimeout(() => {
            window.location.reload(); // Refresh the page
        }, 2000); // Adjust the delay (in milliseconds) as needed
        
    }).catch((error) => {
        //console.error("Error sending email:", error);
        //alert("We are having trouble submitting your message. Please email your message to the following address: info@bausolutions.africa");
        const toast = new bootstrap.Toast(document.getElementById('emailFailToast'));
        toast.show();
    })
    
    .finally(function () {
        // Enable button and reset text
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
    });
});

    //NavBar behavior  
    document.addEventListener("DOMContentLoaded", function () {
        // Get all nav-link elements
        const navLinks = document.querySelectorAll(".nav-link");
        const navbarCollapse = document.querySelector(".navbar-collapse");

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                // Check if navbar is expanded
                if (navbarCollapse.classList.contains("show")) {
                    // Close the navbar
                    const bootstrapCollapse = new bootstrap.Collapse(navbarCollapse);
                    bootstrapCollapse.hide();
                }
            });
        });
    });

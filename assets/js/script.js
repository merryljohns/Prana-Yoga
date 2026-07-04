/**
 * Main application coordinator for Yoga Webinar Landing Page.
 * Manages API data injection, custom testimonials carousel,
 * YouTube video embed format conversion, form submissions, and UI states.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Initialize page elements
    loadHeroBanners();
    loadIntroVideo();
    loadYogaClasses();
    loadTestimonials();

    // Setup navbar scrolled states and scrollspy
    initScrollEffects();

    // Initialize Scroll Reveal for static elements
    initScrollReveal();

    // Event listener for form submission
    const registrationForm = document.getElementById("webinarRegisterForm");
    if (registrationForm) {
        registrationForm.addEventListener("submit", handleRegistrationSubmit);
    }
});

/**
 * Manages scroll-responsive navbar shrinking and scrollspy active links.
 */
function initScrollEffects() {
    const navbar = document.querySelector(".navbar");
    const sections = document.querySelectorAll("header, section, footer");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    // Scroll handler for navbar background & height
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }

        // Scrollspy link active updates
        let currentSectionId = "home";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Highlight a bit before the section comes in
            if (window.scrollY >= (sectionTop - 180)) {
                const id = section.getAttribute("id");
                if (id) currentSectionId = id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger initially in case page loaded scrolled down
}

/**
 * Initializes IntersectionObserver to trigger viewport entrance animations.
 */
let scrollObserver = null;
function initScrollReveal() {
    // Clean up previous observer if exists
    if (scrollObserver) {
        scrollObserver.disconnect();
    }

    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animated");
                // Stop observing once animated
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08, // trigger when 8% is visible
        rootMargin: "0px 0px -40px 0px"
    });

    animatedElements.forEach(el => scrollObserver.observe(el));
}

/**
 * Public helper to re-observe newly loaded API content.
 */
window.refreshScrollReveal = function() {
    initScrollReveal();
};

/**
 * Extracts YouTube video ID and returns a clean embed URL.
 * Handles watch URLs, short links, and embeds.
 * 
 * @param {string} url - YouTube URL
 * @returns {string} YouTube embed URL
 */
function getYouTubeEmbedUrl(url) {
    let videoId = "";
    try {
        if (url.includes("youtube.com/watch")) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get("v");
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
        } else if (url.includes("youtube.com/embed/")) {
            return url; // already embed
        }
    } catch (e) {
        console.error("Error parsing YouTube URL:", e);
    }
    
    // Return formatted embed URL or fallback default if parsing failed
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : url;
}

/**
 * Loads and displays banner images from the API in the Hero section.
 */
async function loadHeroBanners() {
    const bannerContainer = document.getElementById("heroBannerContainer");
    if (!bannerContainer) return;

    try {
        const banners = await window.YogaAPI.getBanners();
        
        if (!banners || banners.length === 0) {
            bannerContainer.innerHTML = `<img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80" class="hero-banner-img img-fluid" alt="Yoga Class">`;
            return;
        }

        let htmlContent = "";
        banners.forEach((banner, index) => {
            const activeClass = index === 0 ? "active" : "";
            htmlContent += `
                <div class="hero-slide ${activeClass}" data-slide-index="${index}">
                    <img src="${banner.image}" class="hero-banner-img img-fluid shadow-lg" alt="Yoga Webinar" onerror="this.src='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'">
                </div>
            `;
        });

        bannerContainer.innerHTML = htmlContent;

        // If there are multiple banners, auto slide every 5 seconds
        if (banners.length > 1) {
            let currentSlide = 0;
            const slides = bannerContainer.querySelectorAll(".hero-slide");
            setInterval(() => {
                slides[currentSlide].classList.remove("active");
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add("active");
            }, 5000);
        }

        window.refreshScrollReveal();

    } catch (err) {
        console.error("Error loading banners:", err);
    }
}

/**
 * Extracts the YouTube video ID from any standard YouTube URL format.
 * @param {string} url
 * @returns {string|null}
 */
function getYouTubeVideoId(url) {
    try {
        if (url.includes("youtube.com/watch")) {
            return new URLSearchParams(new URL(url).search).get("v");
        } else if (url.includes("youtu.be/")) {
            return url.split("youtu.be/")[1].split(/[?#]/)[0];
        } else if (url.includes("youtube.com/embed/")) {
            return url.split("youtube.com/embed/")[1].split(/[?#]/)[0];
        }
    } catch (e) { /* ignore */ }
    return null;
}

/**
 * Loads video list and renders a clickable YouTube thumbnail with play overlay.
 * The thumbnail image always loads (even for embed-restricted videos).
 * Clicking it will attempt to embed the iframe; if the video is restricted
 * it also provides a direct YouTube link.
 */
async function loadIntroVideo() {
    const videoSection = document.getElementById("webinarVideoContainer");
    if (!videoSection) return;

    try {
        const videos = await window.YogaAPI.getVideos();

        if (!videos || videos.length === 0) {
            videoSection.innerHTML = `
                <div class="alert alert-warning text-center">Video presentation temporarily unavailable.</div>
            `;
            return;
        }

        const rawLink = videos[0].link;
        const videoId = getYouTubeVideoId(rawLink);

        if (!videoId) {
            videoSection.innerHTML = `<div class="alert alert-warning text-center">Invalid video link received from server.</div>`;
            return;
        }

        // YouTube always serves thumbnail images regardless of embed restrictions
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const thumbnailFallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        videoSection.innerHTML = `
            <div class="video-wrapper" id="videoPlayerWrapper">
                <div class="video-thumbnail-container" id="videoThumbnailContainer" onclick="activateVideoPlayer('${videoId}', '${rawLink}')" role="button" aria-label="Play video" tabindex="0">
                    <img src="${thumbnailUrl}" 
                         onerror="this.src='${thumbnailFallback}'" 
                         alt="Yoga Webinar Video Preview" 
                         class="video-thumbnail-img">
                    <div class="video-play-btn">
                        <svg viewBox="0 0 68 48" width="68" height="48">
                            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/>
                            <path d="M45 24L27 14v20" fill="#fff"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        window.refreshScrollReveal();

    } catch (err) {
        console.error("Error loading video:", err);
    }
}

/**
 * Activates the video player: replaces the thumbnail with an embedded iframe.
 * If embedding fails (restricted video), shows a direct YouTube link.
 */
window.activateVideoPlayer = function(videoId, rawLink) {
    const wrapper = document.getElementById("videoPlayerWrapper");
    if (!wrapper) return;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    wrapper.innerHTML = `
        <div class="video-container">
            <iframe src="${embedUrl}" 
                    id="ytEmbedFrame"
                    title="Yoga Webinar Intro Video" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
        </div>
        <div class="video-overlay-footer d-flex justify-content-between align-items-center bg-dark text-white p-3 small" style="border-radius: 0 0 24px 24px; margin-top: -6px; position: relative; z-index: 5;">
            <span><i class="bi bi-play-circle-fill me-2 text-success"></i>Now Playing</span>
            <a href="${rawLink}" target="_blank" class="btn btn-outline-light btn-sm text-decoration-none" style="font-size: 0.8rem;"><i class="bi bi-box-arrow-up-right me-1"></i>Open on YouTube</a>
        </div>
    `;
};

/**
 * Loads and renders Yoga class cards.
 * Populates class selection dropdown inside the registration form.
 */
async function loadYogaClasses() {
    const classContainer = document.getElementById("classListingContainer");
    const classSelect = document.getElementById("regClassSelect");
    if (!classContainer) return;

    try {
        const classes = await window.YogaAPI.getClasses();

        if (!classes || classes.length === 0) {
            classContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No active classes found. Please check back later!</p>
                </div>
            `;
            return;
        }

        let htmlCards = "";
        let dropdownOptions = `<option value="" disabled selected>Choose a Yoga Class...</option>`;

        classes.forEach((cls, index) => {
            // Format dynamic date
            let formattedDate = cls.date;
            try {
                const dateObj = new Date(cls.date);
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            } catch (e) {
                // Keep raw date
            }

            htmlCards += `
                <div class="col-lg-4 col-md-6 mb-5 animate-on-scroll delay-${(index % 3) * 100}">
                    <div class="class-card-wrapper">
                        <div class="class-card">
                            <span class="class-badge">${cls.type} Webinar</span>
                            <div class="class-card-body">
                                <h4 class="card-title mb-2 mt-2">${cls.title}</h4>
                                <p class="text-muted small mb-3">${cls.subtitle}</p>
                                <p class="card-text text-dark flex-grow-1" style="font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px;">
                                    ${cls.description}
                                </p>
                                <div class="class-meta mb-3">
                                    <div class="class-meta-item">
                                        <i class="bi bi-calendar3"></i>
                                        <span><strong>Date:</strong> ${formattedDate}</span>
                                    </div>
                                    <div class="class-meta-item">
                                        <i class="bi bi-clock"></i>
                                        <span><strong>Time:</strong> ${cls.start_time} - ${cls.end_time}</span>
                                    </div>
                                    ${cls.place && cls.place !== 'NULL' && cls.place !== 'null' ? `
                                    <div class="class-meta-item">
                                        <i class="bi bi-geo-alt"></i>
                                        <span><strong>Location:</strong> ${cls.place}</span>
                                    </div>` : ''}
                                </div>
                                <div class="d-flex align-items-center justify-content-between mt-4">
                                    <button type="button" class="btn btn-premium btn-sm" onclick="selectAndScrollToClass('${cls.id}')">
                                        Book Spot <i class="bi bi-arrow-right-short"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="class-price-badge">$${cls.amount}</div>
                        </div>
                    </div>
                </div>
            `;

            dropdownOptions += `
                <option value="${cls.id}">${cls.title} ($${cls.amount})</option>
            `;
        });

        classContainer.innerHTML = htmlCards;

        if (classSelect) {
            classSelect.innerHTML = dropdownOptions;
        }

        window.refreshScrollReveal();

    } catch (err) {
        console.error("Error loading classes:", err);
        classContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                Failed to load classes. Please refresh the page.
            </div>
        `;
    }
}

/**
 * Selects a class in the form dropdown and scrolls the user to the registration area.
 * Called when "Book Spot" is clicked on any class card.
 * 
 * @param {string} classId 
 */
window.selectAndScrollToClass = function(classId) {
    const classSelect = document.getElementById("regClassSelect");
    const registrationSection = document.getElementById("registration-section");

    if (classSelect) {
        classSelect.value = classId;
        // Trigger select styling refresh or change events if needed
    }

    if (registrationSection) {
        registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight registration form box briefly
        const regBox = document.querySelector(".registration-box");
        if (regBox) {
            regBox.style.outline = "3px solid #e59a5d";
            regBox.style.transition = "outline 0.3s ease";
            setTimeout(() => {
                regBox.style.outline = "none";
            }, 1500);
        }
    }
};

/**
 * Loads and renders testimonials from the API.
 * Builds a custom JavaScript testimonial slider.
 */
async function loadTestimonials() {
    const testimonialContainer = document.getElementById("testimonialSliderContainer");
    const dotsContainer = document.getElementById("testimonialDotsContainer");
    if (!testimonialContainer) return;

    try {
        const testimonials = await window.YogaAPI.getTestimonials();

        if (!testimonials || testimonials.length === 0) {
            testimonialContainer.innerHTML = `<p class="text-center text-muted">No testimonials available at this moment.</p>`;
            return;
        }

        let htmlTestimonials = "";
        let htmlDots = "";

        testimonials.forEach((test, index) => {
            const activeClass = index === 0 ? "active" : "";
            // Default placeholder image if API avatar fails
            const authorImg = test.image || `https://ui-avatars.com/name/${encodeURIComponent(test.name)}?background=1a4d43&color=fff&size=120`;

            htmlTestimonials += `
                <div class="testimonial-slide ${activeClass}" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                    <div class="testimonial-card">
                        <span class="testimonial-quote-icon">“</span>
                        <p class="testimonial-text">"${test.comment}"</p>
                        <div class="testimonial-author">
                            <img src="${authorImg}" class="testimonial-img" alt="${test.name}" onerror="this.src='https://ui-avatars.com/name/${encodeURIComponent(test.name)}?background=1a4d43&color=fff&size=120'">
                            <div>
                                <h5 class="testimonial-name">${test.name}</h5>
                                <p class="testimonial-role">Verified Participant</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            htmlDots += `
                <button class="testimonial-dot ${activeClass}" data-dot-index="${index}" aria-label="Go to testimonial slide ${index + 1}"></button>
            `;
        });

        testimonialContainer.innerHTML = htmlTestimonials;
        if (dotsContainer) {
            dotsContainer.innerHTML = htmlDots;
            setupTestimonialSlider(testimonials.length);
        }

        window.refreshScrollReveal();

    } catch (err) {
        console.error("Error loading testimonials:", err);
    }
}

/**
 * Handles slider transitions and dot actions for testimonials.
 * 
 * @param {number} totalSlides 
 */
function setupTestimonialSlider(totalSlides) {
    if (totalSlides <= 1) return;

    let currentSlide = 0;
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll(".testimonial-dot");
    let autoSlideInterval = startInterval();

    function goToSlide(n) {
        slides[currentSlide].style.display = "none";
        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");

        currentSlide = (n + totalSlides) % totalSlides;

        slides[currentSlide].style.display = "block";
        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");
    }

    function startInterval() {
        return setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 6000); // Rotate every 6s
    }

    // Add click listeners to dots
    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            clearInterval(autoSlideInterval);
            goToSlide(idx);
            autoSlideInterval = startInterval(); // restart countdown
        });
    });
}

/**
 * Handles class registration form submission and Firebase database storage.
 */
async function handleRegistrationSubmit(event) {
    event.preventDefault();

    const registrationForm = document.getElementById("webinarRegisterForm");
    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const phoneInput = document.getElementById("regPhone");
    const classSelect = document.getElementById("regClassSelect");
    const submitBtn = document.getElementById("regSubmitBtn");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const classId = classSelect.value;

    // Simple Form Validation
    if (!name || !email || !phone || !classId) {
        showToast("Please fill in all details.", "error");
        return;
    }

    if (!validateEmail(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
    }

    if (!validatePhone(phone)) {
        showToast("Please enter a valid 10-digit phone number.", "error");
        return;
    }

    // Loading State
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Securing spot...`;

    try {
        // Trigger Firebase submit
        const result = await window.saveRegistration(name, email, phone, classId);

        if (result.success) {
            // Find selected class title to display in modal
            const selectedOption = classSelect.options[classSelect.selectedIndex];
            const classTitle = selectedOption ? selectedOption.text : "Yoga Class";

            try {
                // Trigger success UI modal
                showSuccessModal(name, email, classTitle);
            } catch (modalError) {
                console.warn("Success modal could not be shown:", modalError);
                showToast("Registration successful! Please check your inbox for details.", "success");
            }
            
            // Clear form fields
            registrationForm.reset();
        } else {
            throw new Error(result.error || "Save operation failed.");
        }
    } catch (err) {
        console.error("Submission error:", err);
        showToast("Registration failed. Please try again.", "error");
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Regex check for standard email formats.
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Regex check for standard 10-digit phone numbers.
 */
function validatePhone(phone) {
    const re = /^\d{10}$/; // 10-digit number pattern
    return re.test(phone.replace(/[\s\-\(\)]/g, '')); // Strip spaces/symbols first
}

/**
 * Instantiates and opens a premium Success Modal.
 */
function showSuccessModal(name, email, classTitle) {
    if (typeof window.bootstrap === "undefined" || typeof window.bootstrap.Modal !== "function") {
        throw new Error("Bootstrap modal is not available.");
    }

    // Create element or select existing modal
    let modalElement = document.getElementById("registrationSuccessModal");
    
    if (!modalElement) {
        // Create dynamic modal if not in HTML
        modalElement = document.createElement("div");
        modalElement.id = "registrationSuccessModal";
        modalElement.className = "modal fade";
        modalElement.setAttribute("tabindex", "-1");
        modalElement.setAttribute("aria-hidden", "true");
        document.body.appendChild(modalElement);
    }

    modalElement.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 24px; overflow: hidden;">
                <div class="modal-body text-center p-5">
                    <div class="success-checkmark">
                        <i class="bi bi-check-lg"></i>
                    </div>
                    <h3 class="display-font mb-3">Booking Confirmed!</h3>
                    <p class="text-muted px-2">
                        Namaste <strong>${name}</strong>, you have successfully registered for:<br>
                        <span class="text-primary d-block mt-2 font-weight-bold">"${classTitle}"</span>
                    </p>
                    <div class="alert alert-light mt-4 text-start border-0 bg-light p-3" style="border-radius: 12px;">
                        <small class="text-muted d-block mb-1"><i class="bi bi-info-circle-fill me-1"></i> What's Next?</small>
                        <small class="d-block text-dark">We have sent a webinar confirmation link and invoice receipt details to: <strong>${email}</strong>.</small>
                    </div>
                    <button type="button" class="btn btn-premium w-100 mt-4 py-3" data-bs-dismiss="modal">Close & Begin Preparing</button>
                </div>
            </div>
        </div>
    `;

    // Instantiate and show Bootstrap modal
    const bsModal = new bootstrap.Modal(modalElement);
    bsModal.show();
}

/**
 * Displays a beautiful toast notification message.
 * 
 * @param {string} message - Text notification
 * @param {'success'|'error'} type - Style type
 */
function showToast(message, type = "success") {
    let toast = document.getElementById("customFeedbackToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "customFeedbackToast";
        toast.className = "custom-toast";
        document.body.appendChild(toast);
    }

    const iconHtml = type === "success" 
        ? `<div class="toast-icon success"><i class="bi bi-check-circle-fill"></i></div>`
        : `<div class="toast-icon error"><i class="bi bi-exclamation-circle-fill"></i></div>`;

    toast.innerHTML = `
        ${iconHtml}
        <div class="toast-message">${message}</div>
    `;

    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// Spotlight and intro overlay script
const overlay = document.getElementById('intro-overlay');
const startButton = document.getElementById('start-button');
const mainContent = document.getElementById('main-content');

// Update mouseCircle position on mouse move and toggle startButton visibility
const mouseCircle = document.getElementById('mouse-circle');

// Detect if device is touch capable
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (isTouchDevice) {
    // On tactile, afficher le bouton en permanence
    startButton.style.opacity = '1';
    // Afficher le cercle
    mouseCircle.style.display = 'block';

    // Function to get a random initial position outside the viewport
    function getRandomInitialPosition() {
        const positions = ['top', 'left', 'right', 'bottom'];
        const choice = positions[Math.floor(Math.random() * positions.length)];
        let x, y;
        switch (choice) {
            case 'top':
                x = Math.random() * window.innerWidth;
                y = -mouseCircle.offsetHeight - 10;
                break;
            case 'left':
                x = -mouseCircle.offsetWidth - 10;
                y = Math.random() * window.innerHeight;
                break;
            case 'right':
                x = window.innerWidth + 10;
                y = Math.random() * window.innerHeight;
                break;
            case 'bottom':
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + 10;
                break;
        }
        return { x, y };
    }

    // Get random initial position
    let { x: circleX, y: circleY } = getRandomInitialPosition();
    mouseCircle.style.left = circleX + 'px';
    mouseCircle.style.top = circleY + 'px';

    // Duration of the animation in ms
    const duration = 3000;
    let startTime = null;

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Generate multiple random intermediate points across the viewport with minimum distance between points
    const intermediatePointsCount = 5;
    const intermediatePoints = [];

    function distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    function getRandomPoint() {
        return {
            x: Math.random() * (window.innerWidth - mouseCircle.offsetWidth),
            y: Math.random() * (window.innerHeight - mouseCircle.offsetHeight)
        };
    }

    while (intermediatePoints.length < intermediatePointsCount) {
        let point = getRandomPoint();
        if (intermediatePoints.length === 0) {
            intermediatePoints.push(point);
        } else {
            let lastPoint = intermediatePoints[intermediatePoints.length - 1];
            if (distance(point, lastPoint) > 150) { // minimum distance of 150px between points
                intermediatePoints.push(point);
            }
        }
    }

    // Add final target point (button center) as last point
    function getButtonCenter() {
        const rect = startButton.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - mouseCircle.offsetWidth / 2,
            y: rect.top + rect.height / 2 - mouseCircle.offsetHeight / 2
        };
    }
    intermediatePoints.push(getButtonCenter());

    // Total segments = intermediatePointsCount + 1 (start to first, between points, last to button)
    const totalSegments = intermediatePoints.length;

    // Calculate duration per segment
    const segmentDuration = duration / totalSegments;

    // Current segment index
    let currentSegment = 0;

    // Start position for current segment
    let segmentStartX = circleX;
    let segmentStartY = circleY;

    // Target position for current segment
    let segmentTargetX = intermediatePoints[0].x;
    let segmentTargetY = intermediatePoints[0].y;

    // Randomize oscillation amplitude and frequency for trajectory variation
    const oscillationAmplitude = 3 + Math.random() * 3; // between 3 and 6, less jitter
    const oscillationFrequency = 0.2 + Math.random() * 0.3; // between 0.2 and 0.5, slower oscillation

    function animateCircle(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // Calculate time elapsed in current segment
        const segmentElapsed = elapsed - currentSegment * segmentDuration;
        const t = Math.min(segmentElapsed / segmentDuration, 1);
        const easedT = easeInOutQuad(t);

        // Interpolated position with easing and oscillations for varied trajectory
        let offsetX = Math.sin(easedT * Math.PI * oscillationFrequency) * 10;
        let offsetY = Math.sin(easedT * Math.PI * oscillationFrequency) * oscillationAmplitude;

        const currentX = segmentStartX + (segmentTargetX - segmentStartX) * easedT + offsetX;
        const currentY = segmentStartY + (segmentTargetY - segmentStartY) * easedT + offsetY;

        mouseCircle.style.left = currentX + 'px';
        mouseCircle.style.top = currentY + 'px';

        if (t >= 1) {
            // Move to next segment
            currentSegment++;
            if (currentSegment < totalSegments) {
                // Update segment start and target positions
                segmentStartX = segmentTargetX;
                segmentStartY = segmentTargetY;
                segmentTargetX = intermediatePoints[currentSegment].x;
                segmentTargetY = intermediatePoints[currentSegment].y;
            } else {
                // Animation finished, show the "Commencer" button
                startButton.style.opacity = '1';

                // Ensure circle is exactly centered on the button at the end
                const finalRect = startButton.getBoundingClientRect();
                mouseCircle.style.left = (finalRect.left + finalRect.width / 2 - mouseCircle.offsetWidth / 2) + 'px';
                mouseCircle.style.top = (finalRect.top + finalRect.height / 2 - mouseCircle.offsetHeight / 2) + 'px';

                // Start bounce effect in series of 3 bounces loop
                function bounceSeries() {
                    let count = 0;
                    function bounce() {
                        if (count < 3) {
                            mouseCircle.animate([
                                { transform: 'translateY(0) scale(1)' },
                                { transform: 'translateY(-15px) scale(1.1)' },
                                { transform: 'translateY(0) scale(1)' }
                            ], {
                                duration: 600,
                                easing: 'ease-in-out',
                                direction: 'alternate'
                            }).onfinish = () => {
                                count++;
                                bounce();
                            };
                        } else {
                            count = 0;
                            bounce();
                        }
                    }
                    bounce();
                }
                bounceSeries();
                return; // Stop animation loop
            }
        }

        window.requestAnimationFrame(animateCircle);
    }

    window.requestAnimationFrame(animateCircle);

    // Repositionner le cercle et bouton au resize
    window.addEventListener('resize', () => {
        const rect = startButton.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 - mouseCircle.offsetWidth / 2;
        const targetY = rect.top + rect.height / 2 - mouseCircle.offsetHeight / 2;
        mouseCircle.style.left = targetX + 'px';
        mouseCircle.style.top = targetY + 'px';
    });

} else {
    // Comportement PC avec souris
    overlay.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        // Calculate offset based on current circle size to center it on mouse pointer
        const circleRect = mouseCircle.getBoundingClientRect();
        const offsetX = circleRect.width / 2;
        const offsetY = circleRect.height / 2;
        mouseCircle.style.left = (x - offsetX) + 'px';
        mouseCircle.style.top = (y - offsetY) + 'px';

        // Get button bounding rect
        const rect = startButton.getBoundingClientRect();
        // Check if mouse is over button or near mouse circle (within 100px radius)
        const distX = Math.max(rect.left - x, x - rect.right, 0);
        const distY = Math.max(rect.top - y, y - rect.bottom, 0);
        const distance = Math.sqrt(distX * distX + distY * distY);
        if (distance < 100) {
            startButton.style.opacity = '1';
        } else {
            startButton.style.opacity = '0';
        }
    });
}

// On button click, hide overlay and show main content
startButton.style.opacity = '0';
startButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    mainContent.style.display = 'block';
});

// Back to top button
const backToTopButton = document.getElementById('back-to-top');
backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Show/hide back to top button on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Newsletter form submission (dummy)
const newsletterForm = document.getElementById('newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Merci pour votre inscription à la newsletter !');
    newsletterForm.reset();
});


// Automatic background slideshow for hero section
const heroBackground = document.querySelector('.hero-background');
const images = [
    'image/Conseil.jpg',
    'image/Montage.jpg',
    'image/Production.jpg',
    'image/Strategie.jpg'
];
let currentIndex = 0;
const slideInterval = 5000; // 5 seconds

function changeBackground() {
    // Add fade-out class to trigger opacity transition
    heroBackground.classList.add('fade-out');

    setTimeout(() => {
        // Change background image
        heroBackground.style.backgroundImage = `url(${images[currentIndex]})`;

        // Remove fade-out class to fade back in
        heroBackground.classList.remove('fade-out');

        // Update index for next image
        currentIndex = (currentIndex + 1) % images.length;
    }, 250); // Match the CSS transition duration
}

// Initialize the first background image
heroBackground.style.backgroundImage = `url(${images[0]})`;
currentIndex = 1;

// Start the slideshow interval
setInterval(changeBackground, slideInterval);

window.addEventListener('DOMContentLoaded', () => {
    const servicesTrack = document.querySelector('.services-track');
    if (servicesTrack) {
        // Duplicate items for seamless scroll
        const items = Array.from(servicesTrack.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            servicesTrack.appendChild(clone);
        });

        let scrollAmount = 0;
        const scrollStep = 1; // pixels per frame
        let isPaused = false; // Flag to control pause/resume of scrolling

        function scroll() {
            if (!isPaused) {
                scrollAmount += scrollStep;
                if (scrollAmount >= servicesTrack.scrollWidth / 2) {
                    scrollAmount = 0;
                }
                servicesTrack.style.transform = `translateX(-${scrollAmount}px)`;
            }

            // Zoom effect logic: find the service item closest to center and add zoomed class
            const container = document.querySelector('.services-list');
            const containerRect = container.getBoundingClientRect();
            const containerCenterX = containerRect.left + containerRect.width / 2;

            let closestItem = null;
            let closestDistance = Infinity;

            const items = servicesTrack.querySelectorAll('.service-item');
            items.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2;
                const distance = Math.abs(containerCenterX - itemCenterX);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });

            items.forEach(item => {
                if (item === closestItem) {
                    item.classList.add('zoomed');
                } else {
                    item.classList.remove('zoomed');
                }
            });

            requestAnimationFrame(scroll);
        }

        // Add mouseover and mouseout event listeners to pause/resume scrolling
        const serviceItems = servicesTrack.querySelectorAll('.service-item');
        serviceItems.forEach(item => {
            item.addEventListener('mouseover', () => {
                isPaused = true;
            });
            item.addEventListener('mouseout', () => {
                isPaused = false;
            });
        });

        requestAnimationFrame(scroll);
    }
});

// Scroll Reveal effect for testimonials blockquotes
document.addEventListener('DOMContentLoaded', () => {
    const testimonials = document.querySelectorAll('.testimonial-list blockquote');
    const testimonialHeading = document.querySelectorAll('#testimonials h2');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            } else {
                entry.target.classList.remove('reveal');
            }
        });
    }, observerOptions);

    testimonials.forEach(testimonial => {
        observer.observe(testimonial);
    });
    testimonialHeading.forEach(heading => {
        observer.observe(heading);
    });
});

// Rotating Text effect for "Nos Services"
document.addEventListener('DOMContentLoaded', () => {
    const rotatingText = document.getElementById('rotating-text');
    if (rotatingText) {
        const words = ['Services', 'Conseils', 'Créations'];
        let index = 0;

        function changeWord() {
            // Ajouter la classe blur-out pour l'animation de disparition
            rotatingText.classList.add('blur-out');

            rotatingText.addEventListener('animationend', () => {
                // Après la disparition, changer le texte
                rotatingText.classList.remove('blur-out');
                index = (index + 1) % words.length;
                rotatingText.textContent = words[index];

                // Ajouter la classe blur pour l'animation d'apparition
                rotatingText.classList.add('blur');
            }, { once: true });

            // Retirer la classe blur après l'animation d'apparition
            rotatingText.addEventListener('animationend', () => {
                rotatingText.classList.remove('blur');
            }, { once: true });
        }

        // Lancer la première animation d'apparition
        rotatingText.classList.add('blur');

        // Changer de mot toutes les 3 secondes
        setInterval(changeWord, 3000);
    }

    // Ajout du toggle menu mobile
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isExpanded));
            navMenu.classList.toggle('show');
        });
    }
});
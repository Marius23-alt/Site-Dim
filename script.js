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
    const duration = 4000;
    let startTime = null;

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    let targetX = 0;
    let targetY = 0;

    // Randomize oscillation amplitude and frequency for trajectory variation
    const oscillationAmplitude = 30 + Math.random() * 30; // between 30 and 60
    const oscillationFrequency = 3 + Math.random() * 4; // between 3 and 7

    function animateCircle(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);

        const easedT = easeInOutQuad(t);

        // Recalculate target position at animation start to adapt to screen size
        if (t === 0) {
            const rect = startButton.getBoundingClientRect();
            targetX = rect.left + rect.width / 2 - mouseCircle.offsetWidth / 2;
            targetY = rect.top + rect.height / 2 - mouseCircle.offsetHeight / 2;
        }

        // Interpolated position with easing and oscillations for varied trajectory
        // Adjust final position to be exactly centered on the button at t=1
        let offsetX = 0;
        let offsetY = 0;
        if (t === 1) {
            offsetX = targetX - mouseCircle.offsetLeft;
            offsetY = targetY - mouseCircle.offsetTop;
        }
        const currentX = circleX + (targetX - circleX) * easedT + Math.sin(easedT * Math.PI * oscillationFrequency) * 10 + offsetX;
        const currentY = circleY + (targetY - circleY) * easedT + Math.sin(easedT * Math.PI * oscillationFrequency) * oscillationAmplitude + offsetY;

        mouseCircle.style.left = currentX + 'px';
        mouseCircle.style.top = currentY + 'px';

        if (t < 1) {
            window.requestAnimationFrame(animateCircle);
        } else {
            // Show the "Commencer" button
            startButton.style.opacity = '1';

            // Animation finished, start bounce effect in series of 3 bounces loop
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
            // Do not restart full animation
        }
    }

    window.requestAnimationFrame(animateCircle);

    // Repositionner le cercle et bouton au resize
    window.addEventListener('resize', () => {
        const rect = startButton.getBoundingClientRect();
        targetX = rect.left + rect.width / 2 - mouseCircle.offsetWidth / 2;
        targetY = rect.top + rect.height / 2 - mouseCircle.offsetHeight / 2;
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

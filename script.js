document.addEventListener('DOMContentLoaded', function() {
  // fetchContent();
  const containers = document.querySelectorAll('.container');
  var currentContainer = containers[0];
  currentContainer.classList.remove('preload');
  
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  confetti_hearts();
  make_letters_animations(containers);
  handleScroll(animatedElements);

  const progressIndicator = document.querySelector('.donut-progress');
  const dotsContainer = document.querySelector('.donut-dots');
  const totalContainers = containers.length;
  const circleRadius = 45; // Radius of the donut circle
  const circleCircumference = 2 * Math.PI * circleRadius;

  // Set up the dots for each container
  function setupDots() {
      const angleStep = 360 / totalContainers; // Angle between dots
      for (let i = 0; i < totalContainers; i++) {
          const angle = (angleStep * i) * (Math.PI / 180); // Convert to radians
          const x = 50 + Math.cos(angle) * circleRadius; // X position
          const y = 50 + Math.sin(angle) * circleRadius; // Y position
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', x);
          dot.setAttribute('cy', y);
          dot.setAttribute('r', 5); // Dot radius
          dot.setAttribute('class', 'progress-dot'); // Add a class for styling
          dotsContainer.appendChild(dot);
      }
  }

  // Update the progress circle
  // Update the progress circle and dots
  function updateProgress() {
    const containerProgress = currentContainerNumber / totalContainers;
    const angleProgress = Math.abs(angle) / (2 * Math.PI / totalContainers);
    const totalProgress = containerProgress + angleProgress / totalContainers;

    // Calculate the stroke-dashoffset based on progress
    const offset = circleCircumference * (1 - totalProgress);
    progressIndicator.style.strokeDashoffset = offset;

    // Update the color of the dots based on progress
    const dots = document.querySelectorAll('.progress-dot');
    const progressAngle = totalProgress * 360; // Convert progress to degrees
    dots.forEach((dot, index) => {
        const dotAngle = (index / totalContainers) * 360; // Angle of the dot in degrees
        if (dotAngle <= progressAngle) {
            dot.style.fill = '#f08be2'; // Same color as the progress bar
        } else {
            dot.style.fill = '#ddd'; // Background color for unfilled dots
        }
    });
  }

  // Initialize the dots
  setupDots();
  // Virtual scroll position
  const numberOfContainers = containers.length;
  var currentContainerNumber = 0;
  var angle = 0;
  const changeContainerAngle = Math.PI/12; 
  const scrollSpeed = 3000; // How fast the wheel moves the animation (adjustable)
  const radius = 2000; // Radius of circular path
  const centerX = -radius;
  const centerY = 0;
  window.addEventListener('wheel', (event) => {
    event.preventDefault(); // Prevent actual scrolling

    const progress = - event.deltaY / scrollSpeed;

    // Circular motion
    angle += progress * 2 * Math.PI; // a circle
    angle = angle % (2 * Math.PI); // Normalize angle to 0 to 2PI
    if (angle < -changeContainerAngle) {
      currentContainer.style.display = 'none';

      currentContainerNumber += 1;
      currentContainerNumber = currentContainerNumber % numberOfContainers;
      console.log('next container. coming: container number', currentContainerNumber);
      currentContainer = containers[currentContainerNumber];
      currentContainer.style.display = 'flex';
      
      angle = changeContainerAngle

      if (currentContainerNumber === 0) {
        confetti_hearts();
      }
    } else if (angle > changeContainerAngle) {
      currentContainer.style.display = 'none';

      currentContainerNumber -= 1;
      currentContainerNumber = currentContainerNumber < 0 ? numberOfContainers - 1 : currentContainerNumber;
      console.log('previous container. coming: container number', currentContainerNumber);
      currentContainer = containers[currentContainerNumber];
      currentContainer.style.display = 'flex';
      
      angle = -changeContainerAngle
    }

    // Apply transform
    const xOffset = Math.cos(angle) * radius;
    const yOffset = Math.sin(angle) * radius; // Upward arc
    currentContainer.style.transform = `translate(${xOffset + centerX}px, ${yOffset + centerY}px) rotate(${angle}rad)`;

    const currentContainerAnimatedElements = currentContainer.querySelectorAll('.animate-on-scroll');
    handleScroll(currentContainerAnimatedElements);

    updateProgress();
}, { passive: false }); // passive: false to allow preventDefault
});

function letters_animation(element, wait) {
  const letters = element.textContent.split(''); // Splits into individual characters
  element.innerHTML = letters.map((letter, index) => {
      // Preserve spaces by using a non-breaking space or keeping the original character
      const displayLetter = letter === ' ' ? '&nbsp;' : letter;
      const randomDelay = Math.random() * 0.5;
      return `<span style="animation-delay: ${index * 0.03 + randomDelay + wait}s">${displayLetter}</span>`;
  }).join('');
}

function make_letters_animations(containers) {
  containers.forEach((container) => {
    const letter_animation_divs = container.querySelectorAll('.text-letters-animation');
    var time = 0;
    for (let i = 0; i < letter_animation_divs.length; i++) {
      var element = letter_animation_divs[i];
      letters_animation(element, time);
      time += calculatePTime(element);
    }
  });
}

function calculatePTime(element) {
  const firstLetters = element.textContent.split('');
  const maxDelay = 0.03; // Max random delay (0.1 + 0.4)
  const animationDuration = 0.5; // Animation duration from CSS
  return firstLetters.length * maxDelay + animationDuration; // Total time in seconds
}

function confetti_hearts() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["heart"],
    colors: ["FFC0CB", "FF69B4", "FF1493", "C71585"],
  };
  
  confetti({...defaults, particleCount: 50, scalar: 2,});
  confetti({...defaults, particleCount: 25, scalar: 3,});
  confetti({...defaults, particleCount: 10, scalar: 4,});
}

function isInViewport(element, partially=false) {
    const rect = element.getBoundingClientRect();
    if (!partially) {
      return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    } else {
      return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0 &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right > 0
    );
    }
}

function handleScroll(animatedElements) {
  // maybe only for animated elements inside current container in the future!!
  animatedElements.forEach((element) => {
      if (isInViewport(element, partially=false)) {
          if (!element.classList.contains('activate')) {
            element.style.visibility = 'visible';
              element.classList.add('activate'); // Start animation
          }
      } else if (isInViewport(element, partially=true)) {
        if (!element.classList.contains('activate')) {
            element.style.visibility = 'hidden';
            // if in future there will be non-appearance animations we should change the code here with more classes to pass that
        }
      } else{
          // Reset animation state when the element is out of the viewport
          element.classList.remove('activate'); // Reset animation
      }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // fetchContent();
  const containers = document.querySelectorAll('.container');
  var currentContainer = containers[0];
  currentContainer.classList.remove('preload');
  currentContainer.style.display = 'flex';
  
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  // Trigger confetti animation if the container has the 'confetti' class
  if (currentContainer.classList.contains('confetti')) {
    confetti_hearts(); 
  }
  make_letters_animations(containers);
  handleScroll(animatedElements);

  const progressIndicator = document.querySelector('.donut-progress');
  const dotsContainer = document.querySelector('.donut-dots');
  const totalContainers = containers.length;
  const circleRadius = 45; // Radius of the donut circle
  const circleCircumference = 2 * Math.PI * circleRadius;

  // Initialize the dots
  setupDots();
  
  // Virtual scroll position
  var currentContainerNumber = 0;
  var angle = 0;
  const changeContainerAngle = Math.PI/12; 
  const scrollSpeed = 3000; // How fast the wheel moves the animation (adjustable)
  const radius = 2000; // Radius of circular path
  const centerX = -radius;
  const centerY = 0;

  window.addEventListener('wheel', (event) => {
    event.preventDefault(); // Prevent actual scrolling
    // Circular motion
    const progress = - event.deltaY / scrollSpeed;
    angle += progress * 2 * Math.PI; // a circle
    angle = angle % (2 * Math.PI); // Normalize angle to 0 to 2PI

    if (angle < -changeContainerAngle) {
      switchContainer(1); // Move to the next container
    } else if (angle > changeContainerAngle) {
      switchContainer(-1); // Move to the previous container
    } else {
      rotateContainer();
    }

    updateProgress();
}, { passive: false }); // passive: false to allow preventDefault

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
        dot.style.fill = '#ff847c'; // Same color as the progress bar
    } else {
        dot.style.fill = '#fecea8'; // Background color for unfilled dots
    }
});
}

function switchContainer(direction) {
  // Hide the current container
  currentContainer.style.display = 'none';

  // Update the current container number
  currentContainerNumber += direction;
  if (currentContainerNumber < 0) {
      currentContainerNumber = containers.length - 1; // Wrap around to the last container
  } else if (currentContainerNumber >= containers.length) {
      currentContainerNumber = 0; // Wrap around to the first container
  }

  // Update the current container
  currentContainer = containers[currentContainerNumber];
  currentContainer.style.display = 'flex';

  // Update the angle
  angle = direction > 0 ? changeContainerAngle : -changeContainerAngle;

  // Trigger confetti animation if the container has the 'confetti' class
  if (currentContainer.classList.contains('confetti')) {
      confetti_hearts();
  }
  let {xOffset, yOffset} = computeOffsets(angle);
  currentContainer.style.transform = `translate(${xOffset + centerX}px, ${yOffset + centerY}px) rotate(${angle}rad)`; 


  // Update the progress indicator
  updateProgress();
}

function rotateContainer() {
  let {xOffset, yOffset} = computeOffsets(angle);
  currentContainer.animate({
    transform: `translate(${xOffset + centerX}px, ${yOffset + centerY}px) rotate(${angle}rad)`
  }, { duration: 1200, fill: "forwards" });
  const currentContainerAnimatedElements = currentContainer.querySelectorAll('.animate-on-scroll');
  handleScroll(currentContainerAnimatedElements);
}

function computeOffsets(angle) {
  const xOffset = Math.cos(angle) * radius;
  const yOffset = Math.sin(angle) * radius;
  return {xOffset, yOffset};
}

});

function letters_animation(element, wait) {
  const text = element.textContent;
  const segments = [];
  let currentSegment = '';
  let isHebrew = null; // Null until we determine the first language

  // Helper to check if a character is Hebrew (Unicode range U+0590 to U+05FF)
  function isHebrewChar(char) {
    return /[\u0590-\u05FF]/.test(char);
  }

  // Helper to check if a character is punctuation (basic set for now)
  function isPunctuation(char) {
    return /[.,!?;:-]/.test(char); // Add more punctuation as needed
  }

  // Split text into segments based on language, handling punctuation
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charIsHebrew = isHebrewChar(char);
    const charIsPunctuation = isPunctuation(char);

    if (i === 0) {
      // First character sets the initial direction (unless it's punctuation)
      if (!charIsPunctuation) {
        isHebrew = charIsHebrew;
      }
      currentSegment = char;
    } else {
      if (charIsPunctuation) {
        // Punctuation follows the current segment's direction
        currentSegment += char;
      } else if (isHebrew === null) {
        // If we started with punctuation, set direction based on first letter
        isHebrew = charIsHebrew;
        currentSegment += char;
      } else if (charIsHebrew === isHebrew) {
        // Same language as current segment
        currentSegment += char;
      } else {
        // Language switch: push current segment and start new one
        segments.push({ text: currentSegment, isHebrew: isHebrew });
        currentSegment = char;
        isHebrew = charIsHebrew;
      }
    }
  }
  // Push the final segment
  if (currentSegment) {
    segments.push({ text: currentSegment, isHebrew: isHebrew });
  }

  // Process each segment into animated letters
  let html = '';
  let charIndex = 0;
  segments.forEach(segment => {
    const letters = segment.text.split('');
    const direction = segment.isHebrew ? 'rtl' : 'ltr';
    const segmentHtml = letters.map(letter => {
      const displayLetter = letter === ' ' ? ' ' : letter;
      const randomDelay = Math.random() * 0.5;
      const delay = charIndex * 0.03 + randomDelay + wait;
      charIndex++;
      return `<span style="animation-delay: ${delay}s; display: inline-block;">${displayLetter}</span>`;
    }).join('');
    html += `<span dir="${direction}">${segmentHtml}</span>`;
  });

  element.innerHTML = html;
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
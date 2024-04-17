/*
This block is derived from the 'carousel' block found in the
Adobe Experience Manager (AEM) Block Collection. The original code can be accessed
at: https://github.com/adobe/aem-block-collection/tree/main/blocks/carousel
Modifications (preferably avoid) may have been made to fit the specific needs of this project.
*/
import { fetchPlaceholders } from '../../scripts/aem.js';

/** Extends the block with additional functionality.
 * @param block - the carousel block
 * @returns {{autoScrollDelayInMilliseconds: (number|number), isAutoScroll: boolean,
 * isMultiSlide: boolean, autoScrollCount: number, visibleSlides: (number|number)}}
 */
function extendedFunctionality(block) {
  const visibleSlides = parseInt(block.dataset.visibleSlides, 10) ?? 1;
  const isMultiSlide = Number.isInteger(visibleSlides) && visibleSlides > 1;
  let autoScrollCount = parseInt(block.dataset.autoScroll, 10);
  let isAutoScroll = false;
  if (autoScrollCount < 0) {
    autoScrollCount = Infinity;
    isAutoScroll = true;
  } else {
    isAutoScroll = Number.isInteger(autoScrollCount) && autoScrollCount > 0;
  }
  const autoScrollDelay = parseInt(block.dataset.autoScrollDelay, 10);
  const autoScrollDelayInMilliseconds = Number.isInteger(autoScrollDelay)
    ? autoScrollDelay * 1000
    : 5000;
  return {
    visibleSlides,
    isMultiSlide,
    autoScrollCount,
    isAutoScroll,
    autoScrollDelayInMilliseconds,
  };
}

/**
 * Extends the block for MultiSlide functionality.
 * @param block - the carousel block
 */
function decorateMultiSiteCarousel(carouselBlock) {
  const visibleSlides = parseInt(carouselBlock.dataset.visibleSlides, 10);

  if (Number.isInteger(visibleSlides) && visibleSlides > 1) {
    carouselBlock.classList.add('multi-slide');
    carouselBlock.querySelector('.carousel .carousel-slides').style.setProperty('--visible-slides', visibleSlides);
  }
}

/** Adjusts the indicators based on the current slide index.
 * @param block - the carousel block
 * @param slideIndex - the index of the current slide
 */
function adjustIndicators(block, slideIndex) {
  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });
  adjustIndicators(block, slideIndex);
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];
  slides.forEach((slide) => {
    slide.dataset.mainSlide = slide === activeSlide;
  });
  activeSlide
    .querySelectorAll('a')
    .forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
  adjustIndicators(block, realSlideIndex);
}

/** Registers the auto-scroll functionality for the carousel.
 * @param block - the carousel block
 * @param totalSlides - the total number of slides
 * @param visibleSlides - the number of visible slides
 * @param autoScrollCount - the number of times to auto-scroll
 * @param autoRotateDelay - the delay between auto-scrolls
 */
function registerAutoScroll(
  block,
  totalSlides,
  visibleSlides,
  autoScrollCount,
  autoRotateDelay = 5000,
) {
  let autoRotateCounter = 1;
  let numberOfRotations = 0;
  const rotateInterval = setInterval(() => {
    const activeSlide = parseInt(block?.dataset?.activeSlide ?? '0', 10);
    const lenOfSlidesWindow = visibleSlides ? visibleSlides - 1 : 0;
    const nextSlide = (activeSlide + 1) % (totalSlides - lenOfSlidesWindow);
    block.dataset.activeSlide = nextSlide;
    showSlide(block, nextSlide);
    autoRotateCounter += 1;
    if (autoRotateCounter >= totalSlides - lenOfSlidesWindow) {
      autoRotateCounter = 0;
      numberOfRotations += 1;
    }
    if (
      autoScrollCount !== 'Infinity'
        && numberOfRotations >= parseInt(autoScrollCount, 10)
    ) {
      clearInterval(rotateInterval);
    }
  }, autoRotateDelay);
}

function bindEvents(block, isMultiSlide) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (isMultiSlide) {
            if (entry.target?.dataset?.mainSlide === 'true') {
              updateActiveSlide(entry.target);
            }
          } else {
            updateActiveSlide(entry.target);
          }
        }
      });
    },
    { threshold: 0.5 },
  );
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(
      `carousel-slide-${colIdx === 0 ? 'image' : 'content'}`,
    );
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  const {
    visibleSlides,
    isMultiSlide,
    autoScrollCount,
    isAutoScroll,
    autoScrollDelayInMilliseconds,
  } = extendedFunctionality(block);
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const totalSlides = rows.length;
  const isSingleSlide = totalSlides < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute(
    'aria-roledescription',
    placeholders.carousel || 'Carousel',
  );

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!(isMultiSlide ? totalSlides <= visibleSlides : isSingleSlide)) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute(
      'aria-label',
      placeholders.carouselSlideControls || 'Carousel Slide Controls',
    );
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const sideNavigation = block.classList.contains('side-navigation');

    if (sideNavigation) {
      const slideNavButtons = document.createElement('div');
      slideNavButtons.classList.add('carousel-navigation-buttons');
      slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${
  placeholders.previousSlide || 'Previous Slide'
}"></button>
      <button type="button" class="slide-next" aria-label="${
  placeholders.nextSlide || 'Next Slide'
}"></button>
    `;
      container.append(slideNavButtons);
    }
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    if (isMultiSlide) {
      if (idx === 0) {
        slide.dataset.mainSlide = 'true';
      }
    }

    if (slideIndicators && (!isMultiSlide || idx <= totalSlides - visibleSlides)) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${totalSlides}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  decorateMultiSiteCarousel(block);
  if (!isSingleSlide) {
    bindEvents(block, isMultiSlide);
  }

  if (isAutoScroll) {
    registerAutoScroll(
      block,
      totalSlides,
      visibleSlides,
      autoScrollCount,
      autoScrollDelayInMilliseconds,
    );
  }
}

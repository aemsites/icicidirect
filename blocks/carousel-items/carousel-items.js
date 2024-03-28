// Map of API names and their respective endpoint URLs
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { handleSocialShareClick } from '../../scripts/scripts.js';
import { callAPI } from '../../scripts/mockapi.js';

function renderImageLinkVariant({ data }, carouselItems) {
  data.forEach((item) => {
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');
    slide.innerHTML = `
                    <div class="carousel-slide-image">
                        <img src="${item.finImage}" alt="${item.finTitle}">
                    </div>
                    <div class="carousel-slide-content">
                        <h3><a href="${item.finLink}">${item.finTitle}</a></h3>
                        <div class="carousel-slide-content-footer copyright">
                        <div>
                            <div>${item.finPoweredBy}</div>
                            <div>${item.finPoweredOn}</div>
                        </div>
                        <div class="socialshare">
                            <a class="social-share">
                                <img src="/icons/gray-share-icon.svg" alt="Social Share" >
                            </a>
                        </div>
                    </div>
                    </div>
                `;
    carouselItems.append(slide);
  });
}

async function loadCarousel(carouselItems, block) {
  const carouselBlock = buildBlock('carousel', '');
  carouselBlock.innerHTML = '';

  carouselItems.parentElement.classList.forEach((className) => {
    carouselBlock.classList.add(className);
  });

  Array.from(carouselItems.children).forEach((carouselItemElement) => {
    const divElement = document.createElement('div');
    Array.from(carouselItemElement.children).forEach((child) => {
      divElement.appendChild(child.cloneNode(true));
    });
    carouselBlock.appendChild(divElement);
  });

  block.parentElement.insertAdjacentElement('afterend', carouselBlock);
  decorateBlock(carouselBlock);

  carouselBlock.querySelectorAll('.social-share').forEach((anchor) => anchor.addEventListener('click', () => handleSocialShareClick(anchor)));
  return loadBlock(carouselBlock);
}

export default async function decorate(block) {
  block.style.display = 'none';
  const carouselItems = document.createElement('div');
  carouselItems.classList.add('carousel-items');
  block.append(carouselItems);
  const apiElement = block.querySelector('div[data-block-name="carousel-items"] div > div');
  if (apiElement.textContent.trim().toLowerCase() === 'api') {
    const apiName = apiElement.nextElementSibling.textContent.trim();
    const data = await callAPI(apiName);

    if (block.classList.contains('image-link')) {
      // create Carousel Items with Image & Heading
      renderImageLinkVariant(data, carouselItems);
    }
  } else {
    // ToDo: create Carousel Items with static content i.e. image and title
  }
  return loadCarousel(carouselItems, block);
}

// Map of API names and their respective endpoint URLs
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { handleSocialShareClick } from '../../scripts/scripts.js';
import { callAPI } from '../../scripts/mockapi.js';
import { observe } from "../../scripts/blocks-utils.js";

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

async function loadCarousel(block, carouselItems) {
  const carouselBlock = buildBlock('carousel', '');
  carouselBlock.innerHTML = '';
  block.classList.forEach((className) => {
    carouselBlock.classList.add(className);
  });

  Array.from(carouselItems.children).forEach((carouselItemElement) => {
    const divElement = document.createElement('div');
    Array.from(carouselItemElement.children).forEach((child) => {
      divElement.appendChild(child.cloneNode(true));
    });
    carouselBlock.appendChild(divElement);
  });

  const carouselBlockParent = document.createElement('div');
  carouselBlockParent.classList.add('carousel-wrapper');
  carouselBlockParent.appendChild(carouselBlock);
  block.parentElement.insertAdjacentElement('afterend', carouselBlockParent);
  decorateBlock(carouselBlock);

  carouselBlock.querySelectorAll('.social-share').forEach((anchor) => anchor.addEventListener('click', () => handleSocialShareClick(anchor)));
  return loadBlock(carouselBlock);
}

export default async function decorate(block) {
  block.style.display = 'none';
  const container = block.closest('.section .section-container');
  container.style.display = 'none';
  for (let i = 0; i < block.children.length; i++) {
    const configElements = block.children[i];
    const configNameElement = configElements.querySelector("div");
    if (configNameElement.textContent.trim().toLowerCase() === 'api') {
      const carouselItems = document.createElement('div');
      carouselItems.classList.add('carousel-items');
      const apiName = configNameElement.nextElementSibling.textContent.trim();
      callAPI(apiName)
          .then((data) => {
            if (block.classList.contains('image-link-slider')) {
              // create Carousel Items with Image & Heading
              renderImageLinkVariant(data, carouselItems);
            }
            return loadCarousel(block, carouselItems);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          })
          .finally(() => {
            container.style.display = 'block';
          });
    } else if (configNameElement.textContent.trim().toLowerCase() === 'title') {
      const titleElement = document.createElement('h2');
      const title = configNameElement.nextElementSibling.textContent.trim();
      titleElement.textContent = title;
      const titleParentElement = document.createElement('div');
      titleParentElement.classList.add('title-wrapper');
      titleParentElement.append(titleElement);
      container.insertBefore(titleParentElement, container.firstChild);
    } else if (configNameElement.textContent.trim().toLowerCase() === 'link') {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('button-wrapper');
      buttonWrapper.append(configNameElement.nextElementSibling);
      container.append(buttonWrapper);
    }
  }
}

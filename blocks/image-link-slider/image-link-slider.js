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

function handleTitleConfig(titleElement, container) {
  const titleText = titleElement.textContent.trim();
  const title = document.createElement('h2');
  title.textContent = titleText;

  const titleWrapper = document.createElement('div');
  titleWrapper.classList.add('title-wrapper');
  titleWrapper.appendChild(title);

  container.insertBefore(titleWrapper, container.firstChild);
}

export default async function decorate(block) {
  block.style.display = 'none';
  const container = block.closest('.section .section-container');
  container.style.display = 'none';
  const configElementsArray = Array.from(block.children);

  const promises = configElementsArray.map(async (configElement) => {
    const configNameElement = configElement.querySelector('div');
    const configName = configNameElement.textContent.trim().toLowerCase();
    if (configName === 'api') {
      const carouselItems = document.createElement('div');
      carouselItems.classList.add('carousel-items');
      const apiName = configNameElement.nextElementSibling.textContent.trim();
      const data = await callAPI(apiName);
      if (block.classList.contains('image-link-slider')) {
        renderImageLinkVariant(data, carouselItems);
      }
      await loadCarousel(block, carouselItems);
    } else if (configName === 'title') {
      const titleElement = configNameElement.nextElementSibling;
      handleTitleConfig(titleElement, container);
    } else if (configName === 'link') {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('button-wrapper');
      buttonWrapper.append(configNameElement.nextElementSibling);
      container.append(buttonWrapper);
    }
  });

  await Promise.all(promises);
  container.style.display = 'block';
}

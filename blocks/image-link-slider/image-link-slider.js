// Map of API names and their respective endpoint URLs
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';
import { callAPI } from '../../scripts/mockapi.js';
import { observe } from '../../scripts/blocks-utils.js';

function renderImageLinkVariant({ data }, carouselItems) {
  data.forEach((item) => {
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');
    slide.innerHTML = `
                    <div class="carousel-slide-image">
                        <img data-src="${item.finImage}" alt="${item.finTitle}">
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
  carouselBlock.style.display = 'none';
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
  block.insertBefore(carouselBlockParent, block.firstChild.nextSibling);
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
  // style the block
  block.classList.add('padded');
  block.classList.add('gray-scale-bg');
  block.classList.add('align-button-center');

  const configElementsArray = Array.from(block.children);

  configElementsArray.map(async (configElement) => {
    configElement.style.display = 'none';
    const configNameElement = configElement.querySelector('div');
    const configName = configNameElement.textContent.trim().toLowerCase();
    if (configName === 'type') {
      const carouselItems = document.createElement('div');
      carouselItems.classList.add('carousel-items');
      const apiName = configNameElement.nextElementSibling.textContent.trim();
      callAPI(apiName)
        .then((data) => {
          if (block.classList.contains('image-link-slider')) {
            renderImageLinkVariant(data, carouselItems);
          }
          return loadCarousel(block, carouselItems);
        })
        .then(() => {
          block.querySelectorAll('.carousel-slide').forEach((slide) => {
            observe(slide, (element) => {
              const img = element.querySelector('img');
              img.src = img.dataset.src;
              img.onload = function handleImageLoad() {
                img.width = this.width;
                img.height = this.height;
              };
            });
          });
        }).then(() => {
          block.querySelector('.block.carousel').style.display = 'block';
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error fetching data:', error);
        })
        .finally(() => {
          block.style.display = 'block';
        });
    } else if (configName === 'title') {
      const titleElement = configNameElement.nextElementSibling;
      handleTitleConfig(titleElement, block);
    } else if (configName === 'link') {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('button-wrapper');
      buttonWrapper.append(configNameElement.nextElementSibling);
      block.append(buttonWrapper);
    }
  });
}

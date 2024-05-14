import {
  buildBlock, decorateBlock, loadBlock, fetchPlaceholders,
} from '../../scripts/aem.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';
import {
  getOriginUrl,
  getResearchAPIUrl,
  handleNoResults,
  parseResponse,
  postFormData,
} from '../../scripts/blocks-utils.js';

const placeholders = await fetchPlaceholders();
function getFinAceShareLink(permLink) {
  return `${getOriginUrl()}/research/equity/finace/${permLink}`;
}

function getFinAceImage(image) {
  return `${getOriginUrl()}/images/${image}`;
}

function renderImageLinkVariant(data, carouselItems, maxLimit = 20) {
  let slideCount = 0;
  data.forEach((item) => {
    if (slideCount >= maxLimit) return;
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');
    slide.innerHTML = `
                    <div class="carousel-slide-image">
                        <img src="${getFinAceImage(item.Image)}" alt="${item.AltImage}">
                    </div>
                    <div class="carousel-slide-content">
                        <h3><a href="${getFinAceShareLink(item.PermLink)}">${item.Title}</a></h3>
                        <div class="carousel-slide-content-footer copyright">
                        <div>
                            <div>${placeholders.powerby}</div>
                            <div>${placeholders.publishedon} ${item.PublishedOn}</div>
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
    slideCount += 1;
  });
}

async function loadCarousel(block, carouselItems) {
  const carouselBlock = buildBlock('carousel', '');
  carouselBlock.dataset.visibleSlides = block.dataset.visibleSlides || '';
  carouselBlock.dataset.autoScroll = block.dataset.autoScroll || '';
  carouselBlock.dataset.autoScrollDelay = block.dataset.autoScrollDelay || '';
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
      const formData = new FormData();
      if (apiName === 'finace') {
        formData.append('apiName', 'GetFinaceListing');
      }
      formData.append('inputJson', JSON.stringify({ pageNo: '1', pageSize: '5' }));
      // eslint-disable-next-line consistent-return
      postFormData(getResearchAPIUrl(), formData, async (error, apiResponse = []) => {
        if (error || !apiResponse) {
          const noResultsContainer = document.createElement('div');
          noResultsContainer.classList.add('no-results-container');
          const buttonDiv = block.querySelector('.button-wrapper');
          block.insertBefore(noResultsContainer, buttonDiv);
          handleNoResults(noResultsContainer);
        } else {
          const jsonResult = parseResponse(apiResponse);
          if (block.classList.contains('image-link-slider')) {
            renderImageLinkVariant(jsonResult, carouselItems, block?.dataset?.maxLimit);
            return loadCarousel(block, carouselItems).then(() => {
              block.querySelector('.block.carousel').style.display = 'block';
            });
          }
        }
      });
    } else if (configName === 'title') {
      const titleElement = configNameElement.nextElementSibling;
      handleTitleConfig(titleElement, block);
    } else if (configName === 'link') {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('button-wrapper');
      buttonWrapper.append(configNameElement.nextElementSibling);
      block.append(buttonWrapper);
    } else if (configName === 'visible slides') {
      const visibleSlides = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.visibleSlides = visibleSlides;
    } else if (configName === 'auto scroll') {
      const autoScroll = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.autoScroll = autoScroll;
    } else if (configName === 'auto scroll delay') {
      const autoScrollDelay = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.autoScrollDelay = autoScrollDelay;
    } else if (configName === 'max limit') {
      const maxLimit = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.maxLimit = maxLimit;
    }
  });
}

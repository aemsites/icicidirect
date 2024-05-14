import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

const MAX_BANNERS = 15;
const AUTO_SCROLL_COUNT = -1;

const handleSocialShareClick = () => {
};

async function loadCarousel(block, carouselItems) {
  const carouselBlock = buildBlock('carousel', '');
  carouselBlock.dataset.visibleSlides = block.dataset.visibleSlides || '';
  carouselBlock.dataset.autoScroll = AUTO_SCROLL_COUNT;
  carouselBlock.dataset.autoScrollDelay = block.dataset.autoScrollDelay || '';
  carouselBlock.style.display = 'none';
  carouselBlock.innerHTML = '';
  block.classList.forEach((className) => {
    carouselBlock.classList.add(className);
  });

  Array.from(carouselItems.children).forEach((carouselItemElement) => {
    const divElement = document.createElement('div');
    Array.from(carouselItemElement.children).forEach((child) => {
      divElement.appendChild(child);
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

const getBannerAttributes = (banner) => {
  const attributes = {
    imageNode: '',
    overlayText: '',
    link: '',
    template: '',
  };
  const [imageNode, overlayText, link] = banner.children;
  attributes.imageNode = imageNode.querySelector('picture');
  attributes.overlayText = overlayText;
  link.querySelectorAll('li').forEach((item) => {
    if (item.innerText.includes('Link')) {
      attributes.link = item.querySelector('a').href;
    } else if (item.innerText.includes('Template')) {
      attributes.template = item.innerText.split(':')[1].trim();
    }
  });
  return attributes;
};

const buildIndividualBanner = (bannerItems, container, maxLimit = MAX_BANNERS) => {
  let slideCount = 0;
  bannerItems.forEach((singleBanner, index) => {
    if (slideCount >= maxLimit) return;
    const bannerAttributes = getBannerAttributes(singleBanner);
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');
    slide.innerHTML = `
                    <div class="carousel-slide-image">
                        ${bannerAttributes.imageNode.outerHTML}
                    </div>
                    <div class="carousel-slide-content ${bannerAttributes.template}">
                        <a href="${bannerAttributes.link}" aria-label="hero slider image ${index}">
                          <div class="carousel-slide-content-overlay">
                            ${bannerAttributes.overlayText.outerHTML}
                          </div>
                        </a>
                    </div>
                    </div>
                `;
    container.append(slide);
    slideCount += 1;
  });
};

export default async function decorate(block) {
  block.display = 'none';
  block.classList.add('padded');
  const carouselItems = document.createElement('div');
  carouselItems.classList.add('carousel-items');
  const bannerItems = [...block.children];
  block.innerHTML = '';
  buildIndividualBanner(bannerItems, carouselItems);
  block.append(carouselItems);
  loadCarousel(block, carouselItems);
  carouselItems.remove();
  block.querySelector('.block.carousel').style.display = 'block';
  block.display = 'block';
}

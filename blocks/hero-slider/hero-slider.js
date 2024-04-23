import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

const MAX_BANNERS = 5;
const AUTO_SCROLL_COUNT = 3;

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
  bannerItems.forEach((singleBanner) => {
    if (slideCount >= maxLimit) return;
    const bannerAttributes = getBannerAttributes(singleBanner);
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');
    slide.innerHTML = `
                    <div class="carousel-slide-image">
                        ${bannerAttributes.imageNode.outerHTML}
                    </div>
                    <div class="carousel-slide-content">
                        <h3><a href="${bannerAttributes.link}">${bannerAttributes.link}</a></h3>
                        <div class="carousel-slide-content-footer copyright">
                        <div>
                            <div>${bannerAttributes.overlayText.outerHTML}</div>
                            <div>${bannerAttributes.template}</div>
                        </div>
                        <div class="socialshare">
                            <a class="social-share">
                                <img src="/icons/gray-share-icon.svg" alt="Social Share" >
                            </a>
                        </div>
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

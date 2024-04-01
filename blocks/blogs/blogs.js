import { callMockBlogAPI } from '../../scripts/mockapi.js';
import { decorateIcons, fetchPlaceholders, readBlockConfig } from '../../scripts/aem.js';
import { createPictureElement, observe } from '../../scripts/blocks-utils.js';

async function createBlogCard(blogData) {
  const { imageUrl } = blogData;
  const articleUrl = blogData.link;
  const articleTitle = blogData.title;
  const articleDesc = blogData.description;
  const articleDate = blogData.postDate;

  const arcticleDiv = document.createElement('div');
  arcticleDiv.className = 'article';
  const pictureWrapper = document.createElement('div');
  pictureWrapper.className = 'picture-wrapper';
  const articlePicture = createPictureElement(imageUrl, 'article-thumbnail', false);

  pictureWrapper.appendChild(articlePicture);
  arcticleDiv.appendChild(pictureWrapper);
  const articleContent = document.createElement('div');
  articleContent.className = 'article-content';
  const articleTitleDiv = document.createElement('h3');

  const articleLink = document.createElement('a');
  articleLink.href = articleUrl;
  articleLink.textContent = articleTitle;
  articleLink.target = '_blank';
  articleTitleDiv.appendChild(articleLink);
  articleContent.appendChild(articleTitleDiv);

  const articleText = document.createElement('div');
  articleText.className = 'article-text';

  const articleTextP = document.createElement('span');
  articleTextP.textContent = articleDesc;
  articleText.appendChild(articleTextP);
  articleContent.appendChild(articleText);
  const articleInfo = document.createElement('div');
  articleInfo.className = 'article-info';

  const spanIcon = document.createElement('span');
  spanIcon.className = 'icon icon-time';
  articleInfo.appendChild(spanIcon);
  decorateIcons(articleInfo, '');
  const articleInfoTime = document.createElement('abbr');
  articleInfoTime.textContent = articleDate;
  articleInfo.appendChild(articleInfoTime);

  const articleInfoPoweredBy = document.createElement('abbr');
  articleInfoPoweredBy.textContent = (await fetchPlaceholders()).icicisecurities;
  articleInfo.appendChild(articleInfoPoweredBy);
  articleContent.appendChild(articleInfo);

  arcticleDiv.appendChild(articleContent);
  return arcticleDiv;
}

async function generateCardsView(block) {
  const blogsContainer = block.querySelector('.blogs-cards-container');
  const blogsDataArray = await callMockBlogAPI();
  const entriesToProcess = blogsDataArray.length;
  /**
   * Loop through the blogsDataArray and create a blog card for each blog entry.
   * Append the blog card to the blogsContainers column. Each column will have 2 blog cards.
   */
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i + 1 < entriesToProcess; i += 2) {
    const blogsColumn = document.createElement('div');
    blogsColumn.className = 'blogs-container-column';
    // eslint-disable-next-line no-await-in-loop
    const blogCard1 = await createBlogCard(blogsDataArray[i]);
    // eslint-disable-next-line no-await-in-loop
    const blogCard2 = await createBlogCard(blogsDataArray[i + 1]);
    blogsColumn.appendChild(blogCard1);
    blogsColumn.appendChild(blogCard2);
    blogsContainer.appendChild(blogsColumn);
  }
}

function addDiscoverLink(blogsContainer, discoverMoreAnchor) {
  if (discoverMoreAnchor) {
    const div = document.createElement('div');
    div.className = 'text-center discover-more';
    const anchor = document.createElement('a');
    anchor.href = discoverMoreAnchor.href; // Set the href to your discoverLink variable
    anchor.className = 'link-color';
    anchor.target = '_blank'; // Ensures the link opens in a new tab
    anchor.textContent = discoverMoreAnchor.title; // Add the text content
    const icon = document.createElement('i');
    icon.className = 'icon-up-arrow icon ';
    anchor.appendChild(icon);
    div.appendChild(anchor);
    blogsContainer.appendChild(div);
  }
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const discoverMoreAnchor = block.querySelector('a');
  block.textContent = '';
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row border-wrapper';
  const titleDiv = document.createElement('div');
  titleDiv.className = 'title text-center';

  const titleText = document.createElement('h2');
  titleText.textContent = blockConfig.title;
  titleDiv.appendChild(titleText);
  rowDiv.appendChild(titleDiv);

  const blogsContainer = document.createElement('div');
  blogsContainer.classList.add('blogs-cards-container');

  rowDiv.appendChild(blogsContainer);
  addDiscoverLink(rowDiv, discoverMoreAnchor);
  block.appendChild(rowDiv);
  observe(block, generateCardsView);
}

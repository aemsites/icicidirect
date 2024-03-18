import {
  buildBlock, decorateBlock, loadBlock, readBlockConfig,
} from '../../scripts/aem.js';
import { fetchRecommendations } from '../../scripts/mockapi.js';
import { createDiv } from '../../scripts/blocks-utils.js';

// Result parsers parse the API query results into a format that can be used by the block builder
// for the specific block types
const resultParsers = {
  // Parse results into a cards block
  cards: async (results, blockCfg) => {
    const blockContents = [];
    const powerBy = (blockCfg['power-by'] ?? '').trim().toLowerCase();
    const publishedOn = (blockCfg['published-on'] ?? '').trim().toLowerCase();
    // Show max 3 cards by default
    for (let index = 0; index < (results.length > 3 ? 3 : results.length); index += 1) {
      const result = results[index];
      const fields = blockCfg.fields.split(',');
      const row = [];
      let titleContent = '';
      let publishedOnContent = '';
      let linkContent = '';
      const cardDescription = createDiv('div', '');
      for (let innerIndex = 0; innerIndex < fields.length; innerIndex += 1) {
        const field = fields[innerIndex];
        const fieldName = field.trim().toLowerCase();
        switch (fieldName) {
          case 'title':
            titleContent = result[fieldName];
            break;
          case 'description': {
            if (result[fieldName]) {
              cardDescription.innerHTML = decodeURIComponent(result[fieldName]);
            }
            break;
          }
          case 'publishedon': {
            publishedOnContent = result[fieldName];
            break;
          }
          case 'link': {
            linkContent = result[fieldName];
            break;
          }
          default: {
            // No default logic
          }
        }
      }
      const cardTitle = createDiv('div', '');
      const cardPublishedOn = createDiv('div', '');
      const titleH3 = createDiv('h3', '');
      if (linkContent) {
        const aLink = createDiv('a', '');
        aLink.href = linkContent;
        aLink.textContent = titleContent;
        titleH3.appendChild(aLink);
      } else {
        titleH3.appendChild(titleContent);
      }
      cardTitle.appendChild(titleH3);
      row.push(cardTitle);
      row.push(cardDescription);

      if (powerBy) {
        const powerByTag = createDiv('p', '');
        powerByTag.textContent = powerBy;
        cardPublishedOn.appendChild(powerByTag);
      }

      if (publishedOn && publishedOnContent) {
        const publishedOnTag = createDiv('p', '');
        publishedOnTag.textContent = `${publishedOn} ${publishedOnContent}`;
        cardPublishedOn.appendChild(publishedOnTag);
      }
      row.push(cardPublishedOn);
      blockContents.push(row);
    }

    return blockContents;
  },
};

/**
 * Feed block decorator to build feeds based on block configuration
 */
export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  const blockTitle = (blockCfg['block-name'] ?? 'cards').trim().toLowerCase();
  const blockName = (blockTitle.split('(')[0]).trim();
  const variation = (blockTitle.match(/\((.+)\)/) === null ? '' : blockName.match(/\((.+)\)/)[1]).trim();
  const apiType = (blockCfg['api-type'] ?? '').trim().toLowerCase();
  const results = await fetchRecommendations(apiType);
  block.innerHTML = '';
  const blockContents = await resultParsers[blockName](results, blockCfg);
  const builtBlock = buildBlock(blockName, blockContents);

  [...block.classList].forEach((item) => {
    if (item !== 'feed') {
      builtBlock.classList.add(item);
    }
  });

  if (variation) {
    builtBlock.classList.add(variation);
  }

  if (block.parentNode) {
    block.parentNode.replaceChild(builtBlock, block);
  }

  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  return builtBlock;
}

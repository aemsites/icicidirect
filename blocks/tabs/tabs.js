import {
  buildBlock, decorateBlock, loadBlock, toClassName,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  const types = [...block.children].map((child) => child.children[1]);
  const links = [...block.children].map((child) => child.children[2]);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    tabpanel.textContent = '';
    const mediaBlock = buildBlock('media', '');
    mediaBlock.classList.add('media', 'block');
    mediaBlock.dataset.blockName = 'media';
    mediaBlock.innerHTML = `<div>
            <div>Title</div>
            <div>${tab.innerHTML}</div>
          </div>
          <div>
            <div>Type</div>
            <div>${types[i].textContent.toLowerCase()}</div>
          </div>
          <div>
            <div>Link</div>
            <div class='button-container'>${links[i].innerHTML}</div>
          </div>`;
    tabpanel.append(mediaBlock);
    // build tab button
    const button = document.createElement('button');
    // copy all existing attributes of div into button
    Array.from(tab.attributes).forEach((singleAttribute) => {
      button.setAttribute(singleAttribute.name, singleAttribute.value);
    });
    button.className = 'tabs-tab';
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });
  block.prepend(tablist);
  block.querySelectorAll('.block.media').forEach((mediaBlock) => {
    decorateBlock(mediaBlock);
    loadBlock(mediaBlock);
  });
}

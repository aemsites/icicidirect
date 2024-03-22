/**
 * decorates the breadcrumbs, mainly the body's top breadcrumbs
 * @param {Element} block The breadcrumbs block element
 */
export default async function decorate(block) {
  [...block.children].forEach((singleItem, index, arr) => {
    const linkTag = singleItem.querySelector('a');
    linkTag.classList.add('breadcrumb-link');
    // Make the last item of the breadcrumb as the active one
    if (index === arr.length - 1) {
      linkTag.classList.add('active');
    }
    const breadcrumbTitle = linkTag.innerText;
    linkTag.innerText = '';
    const breadcrumbItemDiv = document.createElement('div');
    breadcrumbItemDiv.className = 'breadcrumb-title';
    breadcrumbItemDiv.innerText = breadcrumbTitle;
    linkTag.appendChild(breadcrumbItemDiv);
  });
}

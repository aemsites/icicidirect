/**
 * decorates the breadcrumbs, mainly the body's top breadcrumbs
 * @param {Element} block The breadcrumbs block element
 */

async function addSEOData() {
  if (document.getElementById('brdcrmp-seo-schema')) {
    return;
  }
  fetch('../../scripts/breadcrumbschema.json')
    .then((response) => response.json()) // Parse the JSON response
    .then((jsonData) => {
      // Create a script element
      const scriptElement = document.createElement('script');

      // Set type attribute to "application/ld+json"
      scriptElement.type = 'application/ld+json';

      // Set text content of the script element to fetched JSON data
      scriptElement.textContent = JSON.stringify(jsonData);

      scriptElement.id = 'brdcrmp-seo-schema';

      // Append the script element to the body
      document.body.appendChild(scriptElement);
    })
    .catch((error) => console.error('Error fetching JSON:', error));
}
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
  addSEOData();
}

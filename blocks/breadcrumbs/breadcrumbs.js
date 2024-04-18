async function appendSchemaDataToBody(schemaData) {
  // Create a JSON LD object based on schemaData
  const jsonLD = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: schemaData.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item ? item.item : 'default_value_here',
    })),
  };

  // Create a script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLD);

  // Append the script element to the body tag
  document.body.appendChild(script);
}
/**
 * decorates the breadcrumbs, mainly the body's top breadcrumbs
 * @param {Element} block The breadcrumbs block element
 */
export default async function decorate(block) {
  const schemaData = [];
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
    schemaData.push({
      name: breadcrumbTitle,
      item: linkTag.href ? linkTag.href : window.location.origin,
    });
  });
  appendSchemaDataToBody(schemaData);
}

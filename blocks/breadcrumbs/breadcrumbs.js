const fetchBreadCrumbs = async () => {
  const breadcrumbsDataURL = '/draft/vivesing/breadcrumbs.json';
  let hostUrl = window.location.origin;
  if (!hostUrl || hostUrl === 'null') {
    // eslint-disable-next-line prefer-destructuring
    hostUrl = window.location.ancestorOrigins[0];
  }
  const apiUrl = `${hostUrl}${breadcrumbsDataURL}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Transform the API response to the desired breadcrumbs map format
    const breadcrumbsList = data && data.data;
    const breadcrumbsMap = {};
    Array.from(breadcrumbsList).forEach((singleBreadCrumb) => {
      breadcrumbsMap[singleBreadCrumb.path] = singleBreadCrumb;
    });
    return breadcrumbsMap;
  } catch (error) {
    return [];
  }
};

const decorateBreadCrumbs = async (block) => {
  const breadcrumbContainerDiv = document.createElement('div');
  breadcrumbContainerDiv.className = 'breadcrumbs-list';
  const breadcrumbsMap = await fetchBreadCrumbs();
  const currentPath = window.location.pathname;
  let currPath = '';
  currentPath.split('/').forEach((singleLevel, index, arr) => {
    if (singleLevel === '') {
      currPath = `${currPath}/`;
    } else {
      currPath = `${currPath}${singleLevel}`;
    }
    const singleItemLinkTag = document.createElement('a');
    singleItemLinkTag.className = 'breadcrumb-link';
    const details = breadcrumbsMap[currPath] || {};
    // fallback to the path value in case missing in excel
    const itemTitle = details.title || singleLevel;
    const itemLink = details.url || window.location.href;
    singleItemLinkTag.href = itemLink;
    const singleItemTitleDiv = document.createElement('div');
    singleItemTitleDiv.className = 'breadcrumb-title';
    singleItemTitleDiv.innerText = itemTitle;
    if (index === arr.length - 1) {
      singleItemLinkTag.classList.add('active');
    }
    singleItemLinkTag.appendChild(singleItemTitleDiv);
    breadcrumbContainerDiv.appendChild(singleItemLinkTag);
    currPath = index === 0 ? currPath : `${currPath}/`;
  });
  block.append(breadcrumbContainerDiv);
};

/**
 * decorates the breadcrumbs, mainly the body's top breadcrumbs
 * @param {Element} block The breadcrumbs block element
 */
export default async function decorate(block) {
  decorateBreadCrumbs(block);
}

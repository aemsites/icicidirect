import { callMockIlensAPI } from '../../scripts/mockapi.js';

function createHTMLElements(block, jsonResponse) {
  // Accessing necessary data from the JSON response
  const data = jsonResponse.body.tableData;

  // Creating a container div
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('container');

  // Iterating through the data array to create article elements
  data.forEach((item) => {
    // Creating article element
    const article = document.createElement('article');
    // article.classList.add('');

    // Creating div for title wrap
    const titleWrapDiv = document.createElement('div');
    titleWrapDiv.classList.add('title_wrap', 'text-center');

    // Creating h2 element with image and text
    const h2 = document.createElement('h2');
    // h2.classList.add('');
    const img = document.createElement('img');
    // eslint-disable-next-line max-len
    img.src = jsonResponse.body.screen.iconURL;
    img.alt = 'assets-orange-114';
    h2.appendChild(img);
    const titleText = document.createTextNode(` ${item[0]}`); // Assuming the first item in the data array is the title
    h2.appendChild(titleText);
    titleWrapDiv.appendChild(h2);

    // Appending titleWrapDiv to article
    article.appendChild(titleWrapDiv);

    // Creating paragraph element
    const paragraph = document.createElement('p');
    const paragraphText = document.createTextNode('Your paragraph text goes here'); // You can replace this with actual content from the JSON response
    paragraph.appendChild(paragraphText);
    article.appendChild(paragraph);

    // Creating div for explore section
    const exploreSectionDiv = document.createElement('div');
    exploreSectionDiv.classList.add('explore-section');

    // Creating div for explore container
    const exploreContainerDiv = document.createElement('div');
    exploreContainerDiv.classList.add('explore-container');

    // Appending exploreContainerDiv to exploreSectionDiv
    exploreSectionDiv.appendChild(exploreContainerDiv);

    // Appending exploreSectionDiv to article
    article.appendChild(exploreSectionDiv);

    // Appending article to containerDiv
    containerDiv.appendChild(article);
  });

  // Appending containerDiv to the document body
  block.appendChild(containerDiv);
}
export default async function decorate(block) {
  console.log('Decorating i-lens block...');
  block.textContent = '';
  const jsonResponse = await callMockIlensAPI();
  createHTMLElements(block, JSON.parse(jsonResponse));
}

export default async function decorate(block) {
  const bannerLink = block.querySelector('a');
  bannerLink.innerText = '';
  const bannerImage = block.querySelector('picture');
  bannerLink.append(bannerImage);
  block.innerText = '';
  block.append(bannerLink);
}

export default async function decorate(block) {
  block.display = 'none';
  const bannerLink = block.querySelector('a');
  bannerLink.innerText = '';
  const bannerImage = block.querySelector('picture');
  bannerLink.append(bannerImage);
  block.innerText = '';
  block.append(bannerLink);
  block.display = 'block';
}

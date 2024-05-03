export default async function decorate(block) {
  console.log('  I am here    ');

  const images = Array.from(block.querySelectorAll('img')).map((img) => img.src);
  block.innerHTML = '';
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('simple-carousel');

  const carouselInner = document.createElement('div');
  carouselInner.classList.add('carousel-inner');
  images.forEach((imagePath) => {
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = 'Image';
    carouselInner.appendChild(img);
  });

  carouselContainer.appendChild(carouselInner);
  block.appendChild(carouselContainer);

  const carousel = document.querySelector('.simple-carousel');
  const carouselInner1 = carousel.querySelector('.carousel-inner');
  const images1 = carouselInner1.querySelectorAll('img');

  let currentIndex = 0;
  const totalImages = images1.length;
  function showImage(index) {
    // Hide all images
    for (let i = 0; i < totalImages; i++) {
      carouselContainer.querySelectorAll('img')[i].style.display = 'none';
    }
    // Show the current image
    carouselContainer.querySelectorAll('img')[index].style.display = 'block';
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % totalImages;
    showImage(currentIndex);
  }

  // Show the first image initially
  showImage(currentIndex);

  // Automatically switch to the next image every 2 seconds
  setInterval(nextImage, 2000);
}

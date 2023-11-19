import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { fetchImages, per_page } from './img-api';

const formEl = document.querySelector('.search-form');
const divEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const inputEl = document.querySelector('[name=searchQuery]');
const searchBtn = document.querySelector('.search-btn');

formEl.addEventListener('submit', onSubmitBtn);
loadMoreBtn.addEventListener('click', onLoadMoreData);

let page = 1;
let searchQuery = '';
let submitClick = false;

let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const renderPage = async () => {
  try {
    const images = await fetchImages(searchQuery, page);

    if (images.hits.length === 0) {
      inputEl.disabled = false;
      searchBtn.disabled = false;
      return Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    if (submitClick) {
      Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
    }

    createMarkup(images.hits);

    gallery.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    loadMoreBtn.classList.remove('is-hidden');

    const lastPage = Math.ceil(images.totalHits / per_page);

    if (page === lastPage) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.info(
        'We are sorry, but you have reached the end of search results.'
      );
    }
  } catch (error) {
    Notiflix.Notify.failure('Oops, someting went wrong!');
  }
  inputEl.disabled = false;
  searchBtn.disabled = false;
};

function createMarkup(images) {
  const markup = images
    .map(image => {
      return `<a href="${image.largeImageURL}" class="photo-card">
    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" width=250 height=200 />
    <div class="info">
    <p class="info-item">
      <b>👍 Likes: ${image.likes}</b>
      </p>
      <p class="info-item">
      <b>👀 Views: ${image.views}</b>
      </p>
      <p class="info-item">
      <b>💬 Comments: ${image.comments}</b>
    </p>
    <p class="info-item">
    <b>⬇️ Downloads: ${image.downloads}</b>
    </p>
    </div>
    </a>`;
    })
    .join('');
  divEl.insertAdjacentHTML('beforeend', markup);
}

async function onSubmitBtn(event) {
  event.preventDefault();

  submitClick = true;

  if (inputEl.value.trim() === '') {
    Notiflix.Notify.warning('Please, fill the form! Form should not be empty!');
    return;
  }

  inputEl.disabled = true;
  searchBtn.disabled = true;

  loadMoreBtn.classList.add('is-hidden');

  page = 1;
  searchQuery = event.target.elements.searchQuery.value.trim();
  divEl.innerHTML = '';

  renderPage();
}

function onLoadMoreData() {
  page += 1;
  loadMoreBtn.classList.add('is-hidden');

  submitClick = false;

  renderPage();
}

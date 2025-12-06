const API_KEY = 'adabda8e240a3755785019fbc1ca242e';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.getElementById('movies-container');
const filters = document.querySelectorAll('.filter');
const modal = document.getElementById('trailer-modal');
const trailerVideo = document.getElementById('trailer-video');
const closeBtn = document.querySelector('.close-btn');

// Simulasi data cinema per film (karena TMDb tidak menyediakan)
// Bisa dikembangkan dengan API tambahan atau input manual
const cinemaMapping = {
  "Agak Laen": "XXI",
  "Kejar Waktu": "CGV",
  "Zootopia+": "Cinépolis"
};

async function fetchNowPlayingMovies() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=id-ID&page=1`);
    const data = await response.json();

    // Map data films untuk keperluan UI
    const movies = data.results.map(movie => ({
      title: movie.title,
      poster: POSTER_BASE_URL + movie.poster_path,
      cinema: cinemaMapping[movie.title] || "Semua Bioskop",
      movieId: movie.id,
      trailer: '',
      showing: true,
      seats: Math.floor(Math.random() * 15) + 1 // data random untuk badge kursi
    }));

    return movies;
  } catch (error) {
    console.error('Gagal fetch data TMDb:', error);
    return [];
  }
}

async function fetchTrailer(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=id-ID`);
    const data = await response.json();

    const trailer = data.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
    if (trailer) {
      return `https://www.youtube.com/embed/${trailer.key}`;
    }
    return '';
  } catch (error) {
    console.error('Gagal fetch trailer:', error);
    return '';
  }
}

let currentMovies = [];

async function renderMovies(filterCinema = "all") {
  moviesContainer.innerHTML = 'Loading...';

  if(currentMovies.length === 0){
    currentMovies = await fetchNowPlayingMovies();

    // Fetch trailer untuk setiap film
    for(let i = 0; i < currentMovies.length; i++) {
      currentMovies[i].trailer = await fetchTrailer(currentMovies[i].movieId);
    }
  }

  let filteredMovies = currentMovies.filter(m => m.showing);
  if (filterCinema !== "all") {
    filteredMovies = filteredMovies.filter(m => m.cinema === filterCinema);
  }

  moviesContainer.innerHTML = '';

  if(filteredMovies.length === 0){
    moviesContainer.innerHTML = '<p style="color:#ccc; text-align:center; width:100%;">Tidak ada film untuk filter ini.</p>';
    return;
  }

  filteredMovies.forEach((movie, index) => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.style.animationDelay = `${index * 0.1}s`;
    movieCard.innerHTML = `
      <img src="${movie.poster}" alt="Poster ${movie.title}" />
      <div class="badge">${movie.seats}</div>
      <h3>${movie.title}</h3>
    `;
    movieCard.addEventListener('click', () => {
      if(movie.trailer){
        trailerVideo.src = movie.trailer + "?autoplay=1&rel=0";
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      } else {
        alert('Trailer tidak tersedia untuk film ini.');
      }
    });
    moviesContainer.appendChild(movieCard);
  });
}

// Filter tombol event
filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(f => {
      f.classList.remove('active');
      f.setAttribute('aria-selected', 'false');
    });
    filter.classList.add('active');
    filter.setAttribute('aria-selected', 'true');
    renderMovies(filter.dataset.cinema);
  });
});

// Modal close events
closeBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  trailerVideo.src = '';
  document.body.style.overflow = 'auto';
});

modal.addEventListener('click', e => {
  if(e.target === modal){
    modal.classList.remove('show');
    trailerVideo.src = '';
    document.body.style.overflow = 'auto';
  }
});

// Initial render semua film
renderMovies();

const toogleButton = document.getElementById('toogle-btn');
const sidebar = document.getElementById('sidebar');
const navLinks = document.querySelectorAll('#sidebar a');
const slider = document.querySelector('input[type="range"]');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const serchContainer = document.getElementById('searchContainer');

const favourites = [];
let tracks = []; 
const genres = ['Hip-Hop', 'Rock', 'Pop', 'Electronic', 'Jazz'];

const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const favBtn = document.getElementById('fav');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeEl = document.getElementById('volume');
const titleEl = document.getElementById('player-title');
const artistEl = document.getElementById('player-artist');
const coverEl = document.getElementById('player-cover');

let currentTrack = null;
let currentIndex = 0;

loadPage('home');

async function searchMusic() {
    const query = searchInput.value.trim();
    if (!query){
        loadPage('home');
        return;
    }

    const loader = document.getElementById("loader");
    const home = document.getElementById("home");
    const error = document.getElementById("error");

    home.classList.add("hidden");
    loader.classList.remove("hidden");

    try{
        error.classList.add("hidden");

        const data = await fetchSongs(query, 50);
        tracks = data;

        const container = document.getElementById("home");
        container.innerHTML = "";

        if(data.length > 0){
            showSongs(data, '', container, 0);
        } else {
            error.textContent = 'Not found';
            error.classList.remove("hidden");
        }  
    } 
    catch(error) {
        console.log(error);
    } finally {
        loader.classList.add("hidden"); 
        home.classList.remove("hidden");
   
    }
}

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); 
        searchMusic();
    }
});

searchInput.addEventListener("input", () => {
    if (!searchInput.value.trim()) {
        loadPage('home');
        error.classList.add("hidden");
    }
});

searchBtn.addEventListener('click', searchMusic);

function toogleSidebar(){
    sidebar.classList.toggle('close')
}

navLinks.forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault(); 

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const page = link.dataset.page;
    loadPage(page)
  });
});

async function fetchSongs(query, amount) {
    try{
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${amount}`);
        const data = await res.json();
        return data.results
    }
    catch(error){
        console.log(error);
    }
}

async function loadPage(page){
    try{

        if (page === 'home') {
            tracks = [];

            const fav = document.getElementById('favourites');
            fav.classList.add('hidden');

            serchContainer.classList.remove('hidden');

            const error = document.getElementById('error');
            error.classList.add('hidden');

            const container = document.getElementById("home");
            container.innerHTML = "";

            const promises = genres.map(async genre => {
                const data = await fetchSongs(genre, 12);
                const startIndex = tracks.length;
                tracks.push(...data);
                showSongs(data, genre, container, startIndex);   
            });

            await Promise.all(promises);
        }
        else if(page === 'favourites'){
            const fav = document.getElementById('favourites');
            fav.classList.remove('hidden');

            serchContainer.classList.add('hidden');

            const home = document.getElementById("home");
            home.innerHTML = "";

            const container = document.getElementById("favourites");
            container.innerHTML = "";

            if(favourites.length == 0){
                const error = document.getElementById('error');
                error.classList.remove('hidden');
                error.textContent = 'Your list is empty. Add some songs to get started';
            } else {
                tracks = favourites;
                showSongs(favourites, 'Favourites', container, 0);  
            }
        }
    }
    catch(error){
        console.log(error);
    }
} 

function showSongs(songs, genre, container, startIndex){
    const section = document.createElement("section");
    section.classList.add("genre-section");

    const title = document.createElement("h2");
    title.textContent = genre;
    section.appendChild(title);

    const row = document.createElement("div");
    row.classList.add("row-container");

    songs.forEach((song, index) => {
        const globalIndex = startIndex + index;
        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <img src="${song.artworkUrl100}" alt="cover">
            <button class="playBtn">
                <svg width="50" height="50" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="18" fill="#121212" fill-opacity="0.5"/>
                <path d="M12.6667 18V15.6267C12.6667 12.68 14.7533 11.4733 17.3067 12.9467L19.3667 14.1333L21.4267 15.32C23.98 16.7933 23.98 19.2067 21.4267 20.68L19.3667 21.8667L17.3067 23.0533C14.7533 24.5267 12.6667 23.32 12.6667 20.3733V18Z" fill="white" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            </button>
            <div class="song-title">${song.trackName}</div>
            <div class="artist">${song.artistName}</div>
        `;

        card.querySelector(".playBtn").addEventListener("click", () => {
            playSong(globalIndex);
        });
        
        row.appendChild(card);
    });

    section.appendChild(row);
    container.appendChild(section);
}

favBtn.addEventListener('click', () => {
    if (!currentTrack) return;

    const exists = favourites.some(song => song.trackId === currentTrack.trackId);

    if (!exists) {
        favourites.push(currentTrack);
    } else {
        const index = favourites.findIndex(song => song.trackId === currentTrack.trackId);
        if (index !== -1) {
            favourites.splice(index, 1);
        }   
    }

    updateFavButton();
});

function updateFavButton() {
    if (!currentTrack) return;

    const isFav = favourites.some(song => song.trackId === currentTrack.trackId);

    if (isFav) {
        favBtn.innerHTML = `<img src="./icons/heart-checked.png" alt="">`;
    } else {
        favBtn.innerHTML = `<img src="./icons/heart.png" alt="">`;
    }
}

slider.addEventListener('input', e => {
    updateSliderBackground(e.target);
});

function playSong(index) {
    currentIndex = index;
    const track = tracks[index];

    currentTrack = track;
    audio.src = track.previewUrl;
    titleEl.textContent = track.trackName;
    artistEl.textContent = track.artistName;
    coverEl.src = track.artworkUrl100;

    audio.play();
    playBtn.innerHTML = `<img src="./icons/pause.png">`;

    updateFavButton(); 
}

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = `<img src="./icons/pause.png" alt="">`;
    } else {
        audio.pause();
        playBtn.innerHTML = `<img src="./icons/play.png" alt="">`;
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        playSong(currentIndex - 1);
    }
})

nextBtn.addEventListener('click', () => {
    if (currentIndex < tracks.length - 1) {
        playSong(currentIndex + 1);
    }
})

volumeEl.addEventListener('input', () => {
    audio.volume = volumeEl.value;
    updateSliderBackground(volumeEl);
});

audio.addEventListener('timeupdate', () => {
    progress.value = (audio.currentTime / audio.duration) * 100 || 0;
    progress.style.setProperty('--progress', `${progress.value}%`);
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener('input', () => {
    audio.pause();
    playBtn.innerHTML = `<img src="./icons/play.png" alt="">`;
    audio.currentTime = (progress.value / 100) * audio.duration;
    updateSliderBackground(progress);
});

function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateSliderBackground(slider) {
    const value = (slider.value / slider.max) * 100;
    slider.style.setProperty('--progress', `${value}%`);
}


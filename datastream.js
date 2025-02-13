// Fetch data dari memories.json
async function loadMemories() {
    try {
        const response = await fetch('reminisync.json');
        const data = await response.json();
        window.Store = { ...data, currentMediaIndex: 0 }; // Simpan ke global Store
        console.log(Store);

        App.initialize(); // Jalankan aplikasi setelah data dimuat
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

// Button of memories Functions
const graduationDate = new Date(2025, 5, 20, 0, 0, 0); // 20 Juni 2025

const Nostalgia = {
    modal: document.getElementById("nostalgiaModal"),
    imageElement: document.getElementById("nostalgiaImage"),
    music: document.getElementById("bgMusic"),
    images: [],
    currentIndex: 0,
    interval: null,

// Function of countdown and nostalgiaImage
async loadImages() {
        try {
            const response = await fetch("reminisync.json");
            const data = await response.json();
            this.images = data.memories
                .flatMap(memory => memory.mediaFiles)
                .filter(file => /\.(jpg|jpeg|png)$/i.test(file)); // Hanya foto
            
            if (this.images.length === 0) {
                console.warn("Tidak ada foto ditemukan untuk mode nostalgia.");
            }
        } catch (error) {
            console.error("Error loading nostalgia images:", error);
        }
    },

    showNextImage() {
        if (this.images.length === 0) return;
        this.imageElement.src = this.images[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },

    startSlideshow() {
        this.showNextImage();
        this.interval = setInterval(() => this.showNextImage(), 2000);
    },

    open() {
        this.loadImages().then(() => {
            if (this.images.length > 0) {
                this.startSlideshow();
                this.music.play();
                this.modal.showModal();
            } else {
                alert("Tidak ada gambar nostalgia.");
            }
        });
    },

    close() {
        clearInterval(this.interval);
        this.music.pause();
        this.modal.close();
    }
};

document.getElementById("nostalgiaToggle").addEventListener("click", () => Nostalgia.open());

        // Menampilkan modal hitung mundur
        function showCountdown() {
            document.getElementById("countdown-modal").classList.remove("hidden");
            updateCountdown(); // Jalankan sekali sebelum interval
        }

        // Menyembunyikan modal hitung mundur
        function hideCountdown() {
            document.getElementById("countdown-modal").classList.add("hidden");
        }
        // Menyembunyikan modal hitung mundur
        function hideCountdown() {
            document.getElementById("countdown-modal").classList.add("hidden");
        }

        // Update countdown timer setiap detik
        function updateCountdown() {
            const now = new Date();
            const timeLeft = graduationDate - now;

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById("countdown-timer").innerHTML = 
                `${days}d ${hours}h ${minutes}m ${seconds}s`;

            setTimeout(updateCountdown, 1000);
        }


// Utility Functions
const Utils = {
    isVideo(filename) {
        return /\.(mp4|webm|ogg)$/i.test(filename);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    createMediaElement(src, title, isVideo) {
        return isVideo
            ? `<video src="${src}" controls class="w-full max-h-[60vh] object-contain">Your browser does not support video playback.</video>`
            : `<img src="${src}" alt="${title}" class="w-full max-h-[60vh] object-contain">`;
    }
};

// Modal Controller
const Modal = {
    elements: {
        modal: () => document.getElementById('memoryModal'),
        title: () => document.getElementById('modalTitle'),
        content: () => document.getElementById('modalContent'),
        description: () => document.getElementById('modalDescription'),
        indicators: () => document.getElementById('modalIndicators')
    },
    currentMemory: null,

    showMedia(memory, index) {
        if (!memory || !memory.mediaFiles || memory.mediaFiles.length === 0) return;

        const mediaFile = memory.mediaFiles[index];
        this.elements.content().innerHTML = Utils.createMediaElement(
            mediaFile, memory.title, Utils.isVideo(mediaFile)
        );

        // Update indikator
        Array.from(this.elements.indicators().children).forEach((indicator, i) => {
            indicator.classList.toggle('bg-gray-700', i === index);
            indicator.classList.toggle('bg-gray-300', i !== index);
        });

        // Pause semua video sebelum mengganti slide
        document.querySelectorAll('video').forEach(video => video.pause());

        Store.currentMediaIndex = index;
    },

    prevSlide() {
        if (!this.currentMemory) return;
        const newIndex = Store.currentMediaIndex === 0
            ? this.currentMemory.mediaFiles.length - 1
            : Store.currentMediaIndex - 1;
        this.showMedia(this.currentMemory, newIndex);
    },

    nextSlide() {
        if (!this.currentMemory) return;
        const newIndex = (Store.currentMediaIndex + 1) % this.currentMemory.mediaFiles.length;
        this.showMedia(this.currentMemory, newIndex);
    },

    createIndicators(memory) {
        return memory.mediaFiles.map((_, index) => `
            <div 
                onclick="Modal.showMedia(Modal.currentMemory, ${index})" 
                class="w-2 h-2 rounded-full cursor-pointer transition-colors ${index === 0 ? 'bg-gray-700' : 'bg-gray-300'}"
            ></div>
        `).join('');
    },

    open(id) {
        this.currentMemory = Store.memories.find(m => m.id === id);
        if (!this.currentMemory) return;

        this.elements.title().textContent = this.currentMemory.title;
        this.elements.description().textContent = this.currentMemory.description;

        // Buat indikator
        this.elements.indicators().innerHTML = this.createIndicators(this.currentMemory);

        // Tampilkan media pertama
        this.showMedia(this.currentMemory, 0);

        // Tambah keyboard navigation
        document.addEventListener('keydown', this.handleKeyPress);
        this.elements.modal().showModal();
    },

    close() {
        document.querySelectorAll('video').forEach(video => video.pause());
        this.currentMemory = null;
        document.removeEventListener('keydown', this.handleKeyPress);
        this.elements.modal().close();
    },

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowLeft': Modal.prevSlide(); break;
            case 'ArrowRight': Modal.nextSlide(); break;
            case 'Escape': Modal.close(); break;
        }
    }
};

// Gallery Controller
const Gallery = {
    renderMemories(memories) {
        document.getElementById('memoriesGrid').innerHTML = memories.map(memory => `
            <div class="card bg-base-100 shadow-xl">
                <figure class="h-64">
                    ${Utils.createMediaElement(memory.mediaFiles[0], memory.title, Utils.isVideo(memory.mediaFiles[0]))}
                </figure>
                <div class="card-body">
                    <h2 class="card-title">${memory.title}</h2>
                    <p>${Utils.formatDate(memory.date)}</p>
                    <div class="card-actions justify-end">
                        <button class="btn btn-primary" onclick="Modal.open(${memory.id})">Lihat</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    filterMemories(category) {
        Store.currentMemories = category === 'all' 
            ? [...Store.memories] 
            : Store.memories.filter(memory => memory.category === category);
        this.renderMemories(Store.currentMemories);
    },

    initializeFilters() {
        if (!Store.categories) return;
        document.getElementById('filterButtons').innerHTML = Store.categories.map(category => `
            <button class="btn join-item" onclick="Gallery.filterMemories('${category}')">
                ${category === 'all' ? 'Semua' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        `).join('');
    }
};

// Music Controller
const Music = {
    element: document.getElementById('bgMusic'),
    isPlaying: false,

    toggle() {
        if (this.isPlaying) {
            this.element.pause();
        } else {
            this.element.play().catch(error => console.log("Music autoplay prevented:", error));
        }
        this.isPlaying = !this.isPlaying;
    }
};

// Main App Controller
const App = {
    initialize() {
        if (!window.Store) return;
        Store.currentMemories = [...Store.memories];
        Gallery.initializeFilters();
        Gallery.renderMemories(Store.memories);
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('musicToggle')?.addEventListener('click', () => Music.toggle());
        
        document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const form = e.target;
    fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { "Accept": "application/json" }
    }).then(response => {
        if (response.ok) {
            alert("Terima kasih! Kenangan Anda telah berhasil dikirim.");
            form.reset();
        } else {
            alert("Oops! Ada kesalahan, coba lagi nanti.");
        }
    }).catch(error => {
        alert("Gagal mengirim pesan. Periksa koneksi internet Anda.");
    });
});
        document.getElementById('memoryModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('memoryModal')) {
                Modal.close();
            }
        });
    },

    scrollToGallery() {
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    }
};

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => loadMemories());

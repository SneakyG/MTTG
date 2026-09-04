<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KHAI BÁO BIẾN & ĐIỀU HƯỚNG INTERFACE ---
    const heartBtn = document.getElementById('heart-btn');
    const heartIcon = document.getElementById('heart-icon');
    const introScreen = document.getElementById('intro-screen');
    const homeScreen = document.getElementById('home-screen');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    // Filter & Pagination & Lightbox States
    let appData = null;
    let currentSelectedStage = '2_nguoi_yeu';
    let currentMediaType = 'all'; // 'all' | 'image' | 'youtube'
    let currentSelectedDate = 'all'; // 'all' | 'YYYY-MM-DD'
    let currentPage = 1;
    const ITEMS_PER_PAGE = 6;

    // Quản lý trạng thái Lightbox (Chuyển Next/Prev)
    let currentLightboxList = [];
    let currentLightboxIndex = 0;

    // Cache DOM Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    // Helper: Chuyển Google Drive File ID thành Direct Image URL
    function getDriveImageUrl(driveId) {
        if (!driveId) return '';
        if (driveId.startsWith('http')) return driveId; // Nếu đã lỡ nhập full URL
        return `https://lh3.googleusercontent.com/d/${driveId}`;
    }

    // Helper: Lấy ảnh Thumbnail của Video Youtube
    function getYoutubeThumbnail(youtubeId) {
        if (!youtubeId) return '';
        return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    // --- 2. TẠO LIGHTBOX MODAL ĐIỀU HƯỚNG (MŨI TÊN & PHÍM BÀN PHÍM) ---
    let lightboxEl = document.getElementById('media-lightbox');
    if (!lightboxEl) {
        lightboxEl = document.createElement('div');
        lightboxEl.id = 'media-lightbox';
        lightboxEl.className = 'fixed inset-0 bg-black/90 z-50 hidden flex flex-col justify-center items-center p-4 transition-opacity duration-300 select-none';
        lightboxEl.innerHTML = `
            <!-- Nút đóng Lightbox -->
            <button id="close-lightbox" class="absolute top-4 right-6 text-white text-3xl font-bold hover:text-rose-400 z-20 focus:outline-none">&times;</button>
            
            <!-- Nút Mũi Tên Trái (Trước đó) -->
            <button id="prev-lightbox-btn" class="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 md:p-4 text-xl md:text-2xl backdrop-blur-sm transition z-20 focus:outline-none">
                ❮
            </button>

            <!-- Nút Mũi Tên Phải (Tiếp theo) -->
            <button id="next-lightbox-btn" class="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 md:p-4 text-xl md:text-2xl backdrop-blur-sm transition z-20 focus:outline-none">
                ❯
            </button>

            <!-- Nội dung Media (Drive Image / YouTube Video) -->
            <div id="lightbox-content" class="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center w-full relative z-10"></div>
            
            <!-- Chú thích / Số thứ tự -->
            <div class="text-center mt-3 z-10">
                <p id="lightbox-caption" class="text-white text-sm md:text-base font-medium"></p>
                <p id="lightbox-counter" class="text-gray-400 text-xs mt-1"></p>
            </div>
        `;
        document.body.appendChild(lightboxEl);

        lightboxEl.addEventListener('click', (e) => {
            if (e.target === lightboxEl || e.target.id === 'close-lightbox') {
                closeLightbox();
            } else if (e.target.id === 'prev-lightbox-btn') {
                navigateLightbox(-1);
            } else if (e.target.id === 'next-lightbox-btn') {
                navigateLightbox(1);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightboxEl.classList.contains('hidden')) return;
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'Escape') closeLightbox();
        });
    }

    function openLightboxByIndex(index) {
        if (!currentLightboxList || currentLightboxList.length === 0) return;

        if (index < 0) {
            currentLightboxIndex = currentLightboxList.length - 1;
        } else if (index >= currentLightboxList.length) {
            currentLightboxIndex = 0;
        } else {
            currentLightboxIndex = index;
        }

        const item = currentLightboxList[currentLightboxIndex];
        const contentContainer = document.getElementById('lightbox-content');
        const captionEl = document.getElementById('lightbox-caption');
        const counterEl = document.getElementById('lightbox-counter');

        if (!contentContainer) return;

        // Render Hình từ Google Drive hoặc Video từ YouTube
        if (item.type === 'image') {
            const imgUrl = getDriveImageUrl(item.drive_id || item.src);
            contentContainer.innerHTML = `<img src="${imgUrl}" class="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl transition duration-300" alt="${item.caption || ''}">`;
        } else if (item.type === 'youtube' || item.type === 'video') {
            contentContainer.innerHTML = `
                <div class="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                    <iframe 
                        class="w-full h-full" 
                        src="https://www.youtube.com/embed/${item.youtube_id}?autoplay=1&rel=0" 
                        title="YouTube Video" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        }

        if (captionEl) {
            captionEl.innerText = `${item.display_date || item.date || ''} - ${item.caption || ''}`;
        }

        if (counterEl) {
            counterEl.innerText = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;
        }

        lightboxEl.classList.remove('hidden');
        lightboxEl.classList.add('flex');
    }

    function navigateLightbox(direction) {
        openLightboxByIndex(currentLightboxIndex + direction);
    }

    function closeLightbox() {
        const contentContainer = document.getElementById('lightbox-content');
        if (contentContainer) contentContainer.innerHTML = ''; // Tắt video YouTube khi đóng modal
        lightboxEl.classList.add('hidden');
        lightboxEl.classList.remove('flex');
    }

    // --- 3. HIỆU ỨNG TRÁI TIM BONG BÓNG ---
    function createHeartBurst(originX, originY) {
        const hearts = ['❤️', '💖', '💕', '💗', '💓', '✨'];
        const count = 20;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
            
            heart.style.left = `${originX}px`;
            heart.style.top = `${originY}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rot = (Math.random() - 0.5) * 360;

            heart.style.setProperty('--tx', `${tx}px`);
            heart.style.setProperty('--ty', `${ty}px`);
            heart.style.setProperty('--rot', `${rot}deg`);
            heart.style.fontSize = `${16 + Math.random() * 16}px`;

            fragment.appendChild(heart);
            setTimeout(() => heart.remove(), 1200);
        }
        document.body.appendChild(fragment);
    }

    if (heartBtn) {
        heartBtn.addEventListener('click', (e) => {
            createHeartBurst(e.clientX, e.clientY);
            fadeInAudio(bgMusic);
            if (heartIcon) {
                heartIcon.classList.remove('animate-heartbeat');
                heartIcon.classList.add('heart-explode');
            }
            if (introScreen) introScreen.style.opacity = '0';

            setTimeout(() => {
                if (introScreen) introScreen.classList.add('hidden');
                if (homeScreen) {
                    homeScreen.classList.remove('hidden');
                    homeScreen.classList.add('fade-in');
                }
                if (musicToggle) musicToggle.classList.remove('hidden');

                startRisingHearts();
            }, 800);
        }, { once: true });
    }

    // --- 4. BỘ QUẢN LÝ ÂM THANH ---
    const AUDIO_FADE_DURATION = 1500;
    const MAX_VOLUME = 0.5;
    let fadeAnimationFrame = null;

    function fadeInAudio(audio, targetVolume = MAX_VOLUME, duration = AUDIO_FADE_DURATION) {
        if (!audio) return;
        cancelAnimationFrame(fadeAnimationFrame);
        
        audio.play().catch(err => console.log("Lỗi phát nhạc:", err));
        const startTime = performance.now();
        const startVolume = audio.volume;

        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (progress < 1) {
                fadeAnimationFrame = requestAnimationFrame(step);
            }
        }
        fadeAnimationFrame = requestAnimationFrame(step);
    }

    function fadeOutAudio(audio, duration = AUDIO_FADE_DURATION, callback = null) {
        if (!audio) return;
        cancelAnimationFrame(fadeAnimationFrame);
        
        const startTime = performance.now();
        const startVolume = audio.volume;

        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = startVolume * (1 - progress);

            if (progress < 1) {
                fadeAnimationFrame = requestAnimationFrame(step);
            } else {
                audio.pause();
                if (callback) callback();
            }
        }
        fadeAnimationFrame = requestAnimationFrame(step);
    }

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (bgMusic.paused || bgMusic.volume === 0) {
                fadeInAudio(bgMusic);
                musicToggle.innerText = '🎵';
            } else {
                fadeOutAudio(bgMusic, AUDIO_FADE_DURATION, () => {
                    musicToggle.innerText = '🔇';
                });
            }
        });
    }

    // --- 5. ĐỒNG HỒ ĐẾM THỜI GIAN YÊU NHAU ---
    const startDate = new Date('2026-08-30T00:00:00');

    function updateCounter() {
        const diff = new Date() - startDate;

        if (diff > 0) {
            if (daysEl) daysEl.innerText = Math.floor(diff / 86400000);
            if (hoursEl) hoursEl.innerText = Math.floor((diff / 3600000) % 24);
            if (minsEl) minsEl.innerText = Math.floor((diff / 60000) % 60);
            if (secsEl) secsEl.innerText = Math.floor((diff / 1000) % 60);
        }
    }
    setInterval(updateCounter, 1000);
    updateCounter();

    // --- 6. TRÁI TIM BAY TỪ DƯỚI LÊN ---
    function startRisingHearts() {
        const heartSymbols = ['❤️', '💖', '💕', '💗', '🌸', '✨'];
        const MAX_RISING_HEARTS = 15;

        setInterval(() => {
            if (document.querySelectorAll('.rising-heart').length >= MAX_RISING_HEARTS) return;

            const heart = document.createElement('div');
            heart.className = 'rising-heart';
            heart.innerText = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

            const startX = Math.random() * 100;
            const duration = 6 + Math.random() * 6;
            const size = 14 + Math.random() * 18;
            const maxOpacity = 0.3 + Math.random() * 0.4;
            const rot = (Math.random() - 0.5) * 60;

            heart.style.left = `${startX}vw`;
            heart.style.setProperty('--duration', `${duration}s`);
            heart.style.setProperty('--max-opacity', maxOpacity);
            heart.style.setProperty('--rot', `${rot}deg`);
            heart.style.fontSize = `${size}px`;

            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), duration * 1000);
        }, 800);
    }

    // --- 7. TẢI DỮ LIỆU VÀ RENDER KỶ NIỆM (GOOGLE DRIVE & YOUTUBE) ---
    async function loadData() {
        try {
            const res = await fetch('./static/metadata.json');
            appData = await res.json();
            
            renderRoadmap();
            updateStageData();
            setupBackgroundSlider();
            setupRoadmapEvents();
            setupFilterEvents();
            setupGalleryClickEvents();
        } catch (err) {
            console.error("Lỗi nạp metadata:", err);
        }
    }

    function setupBackgroundSlider() {
        const bgContainer = document.getElementById('home-bg-container');
        if (!bgContainer || !appData || !appData.media) return;

        const imageList = appData.media
            .filter(item => item.type === 'image')
            .map(item => getDriveImageUrl(item.drive_id || item.src));

        if (imageList.length === 0) return;

        let currentIndex = 0;
        bgContainer.style.backgroundImage = `url('${imageList[0]}')`;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % imageList.length;
            bgContainer.style.backgroundImage = `url('${imageList[currentIndex]}')`;
        }, 6000);
    }

    function renderRoadmap() {
        const container = document.getElementById('roadmap-container');
        if (!container || !appData || !appData.stages) return;

        let html = `<div class="roadmap-line"></div>`;

        appData.stages.forEach((stage, idx) => {
            const isUnlocked = stage.unlocked;
            const isActive = stage.key === currentSelectedStage;
            
            const stateClass = !isUnlocked 
                ? 'stage-locked' 
                : (isActive ? 'stage-unlocked stage-active' : 'stage-unlocked');

            const labelText = isUnlocked ? stage.label : '🔒 ???';
            const iconText = isUnlocked ? (idx + 1) : '🔒';

            html += `
                <div class="stage-step ${stateClass}" data-key="${stage.key}" data-unlocked="${isUnlocked}">
                    <div class="stage-icon">${iconText}</div>
                    <span class="stage-label text-xs md:text-sm text-center">${labelText}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function setupRoadmapEvents() {
        const container = document.getElementById('roadmap-container');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const stepEl = e.target.closest('.stage-step');
            if (!stepEl) return;

            const stageKey = stepEl.dataset.key;
            const isUnlocked = stepEl.dataset.unlocked === 'true';

            if (!isUnlocked) {
                alert("Giai đoạn này chưa tới, cùng chờ đón tương lai nhé! ❤️");
                return;
            }

            currentSelectedStage = stageKey;
            currentMediaType = 'all';
            currentSelectedDate = 'all';
            currentPage = 1;

            renderRoadmap();
            updateStageData();
        });
    }

    function setupFilterEvents() {
        const typeFilterContainer = document.getElementById('media-type-filter');
        if (typeFilterContainer) {
            typeFilterContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                typeFilterContainer.querySelectorAll('button').forEach(b => {
                    b.classList.remove('active', 'bg-rose-500', 'text-white');
                    b.classList.add('text-gray-600');
                });
                btn.classList.add('active', 'bg-rose-500', 'text-white');
                btn.classList.remove('text-gray-600');

                currentMediaType = btn.dataset.type || 'all';
                currentPage = 1;
                updateStageData();
            });
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                currentSelectedDate = e.target.value;
                currentPage = 1;
                updateStageData();
            });
        }
    }

    function setupGalleryClickEvents() {
        const gallery = document.getElementById('stage-gallery');
        if (!gallery) return;

        gallery.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.media-card');
            if (!cardEl) return;

            const index = parseInt(cardEl.dataset.index, 10);
            if (!isNaN(index)) {
                openLightboxByIndex(index);
            }
        });
    }

    function updateStageData() {
        if (!appData) return;

        const gallery = document.getElementById('stage-gallery');
        const stageTitle = document.getElementById('current-stage-title');
        const mediaCount = document.getElementById('media-count');
        const dateFilter = document.getElementById('date-filter');

        const stageObj = appData.stages ? appData.stages.find(s => s.key === currentSelectedStage) : null;
        if (stageTitle) stageTitle.innerText = `Kỷ niệm: ${stageObj ? stageObj.label : ''}`;

        const rawMedia = (appData.media || []).filter(item => item.stage === currentSelectedStage);

        if (dateFilter) {
            const dates = [...new Set(rawMedia.map(item => item.display_date || item.date))].filter(Boolean);
            let dateOptions = `<option value="all">📅 Tất cả ngày</option>`;
            dates.forEach(d => {
                dateOptions += `<option value="${d}" ${d === currentSelectedDate ? 'selected' : ''}>${d}</option>`;
            });
            dateFilter.innerHTML = dateOptions;
        }

        const filteredMedia = rawMedia.filter(item => {
            const isMatchYoutube = (currentMediaType === 'video' || currentMediaType === 'youtube') && (item.type === 'youtube' || item.type === 'video');
            const matchType = currentMediaType === 'all' || item.type === currentMediaType || isMatchYoutube;
            const matchDate = currentSelectedDate === 'all' || (item.display_date || item.date) === currentSelectedDate;
            return matchType && matchDate;
        });

        if (mediaCount) mediaCount.innerText = `${filteredMedia.length} kỷ niệm`;

        if (!gallery) return;

        if (filteredMedia.length === 0) {
            gallery.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-400 italic">
                    Chưa có hình ảnh hoặc video kỷ niệm phù hợp.
                </div>
            `;
            renderPagination(0);
            return;
        }

        const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
        currentPage = Math.min(currentPage, totalPages);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageItems = filteredMedia.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        currentLightboxList = pageItems;

        gallery.innerHTML = pageItems.map((item, idx) => {
            const captionText = item.caption || '';
            const displayDate = item.display_date || item.date || '';

            if (item.type === 'image') {
                const imgUrl = getDriveImageUrl(item.drive_id || item.src);
                return `
                    <div class="media-card cursor-pointer bg-white p-3 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md hover:scale-[1.02] transition"
                         data-index="${idx}">
                        <img src="${imgUrl}" alt="${captionText}" loading="lazy" decoding="async" class="w-full h-52 object-cover rounded-xl mb-2 pointer-events-none">
                        <div class="flex justify-between items-center text-xs text-gray-500 px-1">
                            <span>📅 ${displayDate}</span>
                            <span class="font-medium text-gray-700 truncate max-w-[150px]">${captionText}</span>
                        </div>
                    </div>
                `;
            } else if (item.type === 'youtube' || item.type === 'video') {
                const thumbUrl = getYoutubeThumbnail(item.youtube_id);
                return `
                    <div class="media-card cursor-pointer bg-white p-3 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md hover:scale-[1.02] transition"
                         data-index="${idx}">
                        <div class="relative w-full h-52 mb-2 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                            <img src="${thumbUrl}" alt="${captionText}" class="w-full h-full object-cover opacity-80 pointer-events-none">
                            <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span class="w-12 h-12 bg-rose-500/90 text-white rounded-full flex items-center justify-center shadow-lg text-xl pl-1">▶</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center text-xs text-gray-500 px-1">
                            <span>🎬 ${displayDate}</span>
                            <span class="font-medium text-gray-700 truncate max-w-[150px]">${captionText}</span>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = `
            <div class="flex justify-center items-center gap-2 mt-6">
                <button id="prev-page" class="px-3 py-1 text-sm rounded-lg border bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
                    ◀ Trang trước
                </button>
                <span class="text-sm font-medium text-gray-600 px-2">${currentPage} / ${totalPages}</span>
                <button id="next-page" class="px-3 py-1 text-sm rounded-lg border bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>
                    Trang sau ▶
                </button>
            </div>
        `;

        paginationContainer.innerHTML = html;

        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateStageData();
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateStageData();
            }
        });
    }

    // Khởi chạy ứng dụng
    loadData();
=======
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KHAI BÁO BIẾN & ĐIỀU HƯỚNG INTERFACE ---
    const heartBtn = document.getElementById('heart-btn');
    const heartIcon = document.getElementById('heart-icon');
    const introScreen = document.getElementById('intro-screen');
    const homeScreen = document.getElementById('home-screen');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    // Filter & Pagination & Lightbox States
    let appData = null;
    let currentSelectedStage = '2_nguoi_yeu';
    let currentMediaType = 'all'; // 'all' | 'image' | 'youtube'
    let currentSelectedDate = 'all'; // 'all' | 'YYYY-MM-DD'
    let currentPage = 1;
    const ITEMS_PER_PAGE = 6;

    // Quản lý trạng thái Lightbox (Chuyển Next/Prev)
    let currentLightboxList = [];
    let currentLightboxIndex = 0;

    // Cache DOM Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    // Helper: Chuyển Google Drive File ID thành Direct Image URL
    function getDriveImageUrl(driveId) {
        if (!driveId) return '';
        if (driveId.startsWith('http')) return driveId; // Nếu đã lỡ nhập full URL
        return `https://lh3.googleusercontent.com/d/${driveId}`;
    }

    // Helper: Lấy ảnh Thumbnail của Video Youtube
    function getYoutubeThumbnail(youtubeId) {
        if (!youtubeId) return '';
        return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    // --- 2. TẠO LIGHTBOX MODAL ĐIỀU HƯỚNG (MŨI TÊN & PHÍM BÀN PHÍM) ---
    let lightboxEl = document.getElementById('media-lightbox');
    if (!lightboxEl) {
        lightboxEl = document.createElement('div');
        lightboxEl.id = 'media-lightbox';
        lightboxEl.className = 'fixed inset-0 bg-black/90 z-50 hidden flex flex-col justify-center items-center p-4 transition-opacity duration-300 select-none';
        lightboxEl.innerHTML = `
            <!-- Nút đóng Lightbox -->
            <button id="close-lightbox" class="absolute top-4 right-6 text-white text-3xl font-bold hover:text-rose-400 z-20 focus:outline-none">&times;</button>
            
            <!-- Nút Mũi Tên Trái (Trước đó) -->
            <button id="prev-lightbox-btn" class="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 md:p-4 text-xl md:text-2xl backdrop-blur-sm transition z-20 focus:outline-none">
                ❮
            </button>

            <!-- Nút Mũi Tên Phải (Tiếp theo) -->
            <button id="next-lightbox-btn" class="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 md:p-4 text-xl md:text-2xl backdrop-blur-sm transition z-20 focus:outline-none">
                ❯
            </button>

            <!-- Nội dung Media (Drive Image / YouTube Video) -->
            <div id="lightbox-content" class="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center w-full relative z-10"></div>
            
            <!-- Chú thích / Số thứ tự -->
            <div class="text-center mt-3 z-10">
                <p id="lightbox-caption" class="text-white text-sm md:text-base font-medium"></p>
                <p id="lightbox-counter" class="text-gray-400 text-xs mt-1"></p>
            </div>
        `;
        document.body.appendChild(lightboxEl);

        lightboxEl.addEventListener('click', (e) => {
            if (e.target === lightboxEl || e.target.id === 'close-lightbox') {
                closeLightbox();
            } else if (e.target.id === 'prev-lightbox-btn') {
                navigateLightbox(-1);
            } else if (e.target.id === 'next-lightbox-btn') {
                navigateLightbox(1);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightboxEl.classList.contains('hidden')) return;
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'Escape') closeLightbox();
        });
    }

    function openLightboxByIndex(index) {
        if (!currentLightboxList || currentLightboxList.length === 0) return;

        if (index < 0) {
            currentLightboxIndex = currentLightboxList.length - 1;
        } else if (index >= currentLightboxList.length) {
            currentLightboxIndex = 0;
        } else {
            currentLightboxIndex = index;
        }

        const item = currentLightboxList[currentLightboxIndex];
        const contentContainer = document.getElementById('lightbox-content');
        const captionEl = document.getElementById('lightbox-caption');
        const counterEl = document.getElementById('lightbox-counter');

        if (!contentContainer) return;

        // Render Hình từ Google Drive hoặc Video từ YouTube
        if (item.type === 'image') {
            const imgUrl = getDriveImageUrl(item.drive_id || item.src);
            contentContainer.innerHTML = `<img src="${imgUrl}" class="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl transition duration-300" alt="${item.caption || ''}">`;
        } else if (item.type === 'youtube' || item.type === 'video') {
            contentContainer.innerHTML = `
                <div class="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                    <iframe 
                        class="w-full h-full" 
                        src="https://www.youtube.com/embed/${item.youtube_id}?autoplay=1&rel=0" 
                        title="YouTube Video" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        }

        if (captionEl) {
            captionEl.innerText = `${item.display_date || item.date || ''} - ${item.caption || ''}`;
        }

        if (counterEl) {
            counterEl.innerText = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;
        }

        lightboxEl.classList.remove('hidden');
        lightboxEl.classList.add('flex');
    }

    function navigateLightbox(direction) {
        openLightboxByIndex(currentLightboxIndex + direction);
    }

    function closeLightbox() {
        const contentContainer = document.getElementById('lightbox-content');
        if (contentContainer) contentContainer.innerHTML = ''; // Tắt video YouTube khi đóng modal
        lightboxEl.classList.add('hidden');
        lightboxEl.classList.remove('flex');
    }

    // --- 3. HIỆU ỨNG TRÁI TIM BONG BÓNG ---
    function createHeartBurst(originX, originY) {
        const hearts = ['❤️', '💖', '💕', '💗', '💓', '✨'];
        const count = 20;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
            
            heart.style.left = `${originX}px`;
            heart.style.top = `${originY}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rot = (Math.random() - 0.5) * 360;

            heart.style.setProperty('--tx', `${tx}px`);
            heart.style.setProperty('--ty', `${ty}px`);
            heart.style.setProperty('--rot', `${rot}deg`);
            heart.style.fontSize = `${16 + Math.random() * 16}px`;

            fragment.appendChild(heart);
            setTimeout(() => heart.remove(), 1200);
        }
        document.body.appendChild(fragment);
    }

    if (heartBtn) {
        heartBtn.addEventListener('click', (e) => {
            createHeartBurst(e.clientX, e.clientY);
            fadeInAudio(bgMusic);
            if (heartIcon) {
                heartIcon.classList.remove('animate-heartbeat');
                heartIcon.classList.add('heart-explode');
            }
            if (introScreen) introScreen.style.opacity = '0';

            setTimeout(() => {
                if (introScreen) introScreen.classList.add('hidden');
                if (homeScreen) {
                    homeScreen.classList.remove('hidden');
                    homeScreen.classList.add('fade-in');
                }
                if (musicToggle) musicToggle.classList.remove('hidden');

                startRisingHearts();
            }, 800);
        }, { once: true });
    }

    // --- 4. BỘ QUẢN LÝ ÂM THANH ---
    const AUDIO_FADE_DURATION = 1500;
    const MAX_VOLUME = 0.5;
    let fadeAnimationFrame = null;

    function fadeInAudio(audio, targetVolume = MAX_VOLUME, duration = AUDIO_FADE_DURATION) {
        if (!audio) return;
        cancelAnimationFrame(fadeAnimationFrame);
        
        audio.play().catch(err => console.log("Lỗi phát nhạc:", err));
        const startTime = performance.now();
        const startVolume = audio.volume;

        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (progress < 1) {
                fadeAnimationFrame = requestAnimationFrame(step);
            }
        }
        fadeAnimationFrame = requestAnimationFrame(step);
    }

    function fadeOutAudio(audio, duration = AUDIO_FADE_DURATION, callback = null) {
        if (!audio) return;
        cancelAnimationFrame(fadeAnimationFrame);
        
        const startTime = performance.now();
        const startVolume = audio.volume;

        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            audio.volume = startVolume * (1 - progress);

            if (progress < 1) {
                fadeAnimationFrame = requestAnimationFrame(step);
            } else {
                audio.pause();
                if (callback) callback();
            }
        }
        fadeAnimationFrame = requestAnimationFrame(step);
    }

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (bgMusic.paused || bgMusic.volume === 0) {
                fadeInAudio(bgMusic);
                musicToggle.innerText = '🎵';
            } else {
                fadeOutAudio(bgMusic, AUDIO_FADE_DURATION, () => {
                    musicToggle.innerText = '🔇';
                });
            }
        });
    }

    // --- 5. ĐỒNG HỒ ĐẾM THỜI GIAN YÊU NHAU ---
    const startDate = new Date('2026-08-30T00:00:00');

    function updateCounter() {
        const diff = new Date() - startDate;

        if (diff > 0) {
            if (daysEl) daysEl.innerText = Math.floor(diff / 86400000);
            if (hoursEl) hoursEl.innerText = Math.floor((diff / 3600000) % 24);
            if (minsEl) minsEl.innerText = Math.floor((diff / 60000) % 60);
            if (secsEl) secsEl.innerText = Math.floor((diff / 1000) % 60);
        }
    }
    setInterval(updateCounter, 1000);
    updateCounter();

    // --- 6. TRÁI TIM BAY TỪ DƯỚI LÊN ---
    function startRisingHearts() {
        const heartSymbols = ['❤️', '💖', '💕', '💗', '🌸', '✨'];
        const MAX_RISING_HEARTS = 15;

        setInterval(() => {
            if (document.querySelectorAll('.rising-heart').length >= MAX_RISING_HEARTS) return;

            const heart = document.createElement('div');
            heart.className = 'rising-heart';
            heart.innerText = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

            const startX = Math.random() * 100;
            const duration = 6 + Math.random() * 6;
            const size = 14 + Math.random() * 18;
            const maxOpacity = 0.3 + Math.random() * 0.4;
            const rot = (Math.random() - 0.5) * 60;

            heart.style.left = `${startX}vw`;
            heart.style.setProperty('--duration', `${duration}s`);
            heart.style.setProperty('--max-opacity', maxOpacity);
            heart.style.setProperty('--rot', `${rot}deg`);
            heart.style.fontSize = `${size}px`;

            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), duration * 1000);
        }, 800);
    }

    // --- 7. TẢI DỮ LIỆU VÀ RENDER KỶ NIỆM (GOOGLE DRIVE & YOUTUBE) ---
    async function loadData() {
        try {
            const res = await fetch('./static/metadata.json');
            appData = await res.json();
            
            renderRoadmap();
            updateStageData();
            setupBackgroundSlider();
            setupRoadmapEvents();
            setupFilterEvents();
            setupGalleryClickEvents();
        } catch (err) {
            console.error("Lỗi nạp metadata:", err);
        }
    }

    function setupBackgroundSlider() {
        const bgContainer = document.getElementById('home-bg-container');
        if (!bgContainer || !appData || !appData.media) return;

        const imageList = appData.media
            .filter(item => item.type === 'image')
            .map(item => getDriveImageUrl(item.drive_id || item.src));

        if (imageList.length === 0) return;

        let currentIndex = 0;
        bgContainer.style.backgroundImage = `url('${imageList[0]}')`;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % imageList.length;
            bgContainer.style.backgroundImage = `url('${imageList[currentIndex]}')`;
        }, 6000);
    }

    function renderRoadmap() {
        const container = document.getElementById('roadmap-container');
        if (!container || !appData || !appData.stages) return;

        let html = `<div class="roadmap-line"></div>`;

        appData.stages.forEach((stage, idx) => {
            const isUnlocked = stage.unlocked;
            const isActive = stage.key === currentSelectedStage;
            
            const stateClass = !isUnlocked 
                ? 'stage-locked' 
                : (isActive ? 'stage-unlocked stage-active' : 'stage-unlocked');

            const labelText = isUnlocked ? stage.label : '🔒 ???';
            const iconText = isUnlocked ? (idx + 1) : '🔒';

            html += `
                <div class="stage-step ${stateClass}" data-key="${stage.key}" data-unlocked="${isUnlocked}">
                    <div class="stage-icon">${iconText}</div>
                    <span class="stage-label text-xs md:text-sm text-center">${labelText}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function setupRoadmapEvents() {
        const container = document.getElementById('roadmap-container');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const stepEl = e.target.closest('.stage-step');
            if (!stepEl) return;

            const stageKey = stepEl.dataset.key;
            const isUnlocked = stepEl.dataset.unlocked === 'true';

            if (!isUnlocked) {
                alert("Giai đoạn này chưa tới, cùng chờ đón tương lai nhé! ❤️");
                return;
            }

            currentSelectedStage = stageKey;
            currentMediaType = 'all';
            currentSelectedDate = 'all';
            currentPage = 1;

            renderRoadmap();
            updateStageData();
        });
    }

    function setupFilterEvents() {
        const typeFilterContainer = document.getElementById('media-type-filter');
        if (typeFilterContainer) {
            typeFilterContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                typeFilterContainer.querySelectorAll('button').forEach(b => {
                    b.classList.remove('active', 'bg-rose-500', 'text-white');
                    b.classList.add('text-gray-600');
                });
                btn.classList.add('active', 'bg-rose-500', 'text-white');
                btn.classList.remove('text-gray-600');

                currentMediaType = btn.dataset.type || 'all';
                currentPage = 1;
                updateStageData();
            });
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                currentSelectedDate = e.target.value;
                currentPage = 1;
                updateStageData();
            });
        }
    }

    function setupGalleryClickEvents() {
        const gallery = document.getElementById('stage-gallery');
        if (!gallery) return;

        gallery.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.media-card');
            if (!cardEl) return;

            const index = parseInt(cardEl.dataset.index, 10);
            if (!isNaN(index)) {
                openLightboxByIndex(index);
            }
        });
    }

    function updateStageData() {
        if (!appData) return;

        const gallery = document.getElementById('stage-gallery');
        const stageTitle = document.getElementById('current-stage-title');
        const mediaCount = document.getElementById('media-count');
        const dateFilter = document.getElementById('date-filter');

        const stageObj = appData.stages ? appData.stages.find(s => s.key === currentSelectedStage) : null;
        if (stageTitle) stageTitle.innerText = `Kỷ niệm: ${stageObj ? stageObj.label : ''}`;

        const rawMedia = (appData.media || []).filter(item => item.stage === currentSelectedStage);

        if (dateFilter) {
            const dates = [...new Set(rawMedia.map(item => item.display_date || item.date))].filter(Boolean);
            let dateOptions = `<option value="all">📅 Tất cả ngày</option>`;
            dates.forEach(d => {
                dateOptions += `<option value="${d}" ${d === currentSelectedDate ? 'selected' : ''}>${d}</option>`;
            });
            dateFilter.innerHTML = dateOptions;
        }

        const filteredMedia = rawMedia.filter(item => {
            const isMatchYoutube = (currentMediaType === 'video' || currentMediaType === 'youtube') && (item.type === 'youtube' || item.type === 'video');
            const matchType = currentMediaType === 'all' || item.type === currentMediaType || isMatchYoutube;
            const matchDate = currentSelectedDate === 'all' || (item.display_date || item.date) === currentSelectedDate;
            return matchType && matchDate;
        });

        if (mediaCount) mediaCount.innerText = `${filteredMedia.length} kỷ niệm`;

        if (!gallery) return;

        if (filteredMedia.length === 0) {
            gallery.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-400 italic">
                    Chưa có hình ảnh hoặc video kỷ niệm phù hợp.
                </div>
            `;
            renderPagination(0);
            return;
        }

        const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
        currentPage = Math.min(currentPage, totalPages);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageItems = filteredMedia.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        currentLightboxList = pageItems;

        gallery.innerHTML = pageItems.map((item, idx) => {
            const captionText = item.caption || '';
            const displayDate = item.display_date || item.date || '';

            if (item.type === 'image') {
                const imgUrl = getDriveImageUrl(item.drive_id || item.src);
                return `
                    <div class="media-card cursor-pointer bg-white p-3 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md hover:scale-[1.02] transition"
                         data-index="${idx}">
                        <img src="${imgUrl}" alt="${captionText}" loading="lazy" decoding="async" class="w-full h-52 object-cover rounded-xl mb-2 pointer-events-none">
                        <div class="flex justify-between items-center text-xs text-gray-500 px-1">
                            <span>📅 ${displayDate}</span>
                            <span class="font-medium text-gray-700 truncate max-w-[150px]">${captionText}</span>
                        </div>
                    </div>
                `;
            } else if (item.type === 'youtube' || item.type === 'video') {
                const thumbUrl = getYoutubeThumbnail(item.youtube_id);
                return `
                    <div class="media-card cursor-pointer bg-white p-3 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md hover:scale-[1.02] transition"
                         data-index="${idx}">
                        <div class="relative w-full h-52 mb-2 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                            <img src="${thumbUrl}" alt="${captionText}" class="w-full h-full object-cover opacity-80 pointer-events-none">
                            <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span class="w-12 h-12 bg-rose-500/90 text-white rounded-full flex items-center justify-center shadow-lg text-xl pl-1">▶</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center text-xs text-gray-500 px-1">
                            <span>🎬 ${displayDate}</span>
                            <span class="font-medium text-gray-700 truncate max-w-[150px]">${captionText}</span>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = `
            <div class="flex justify-center items-center gap-2 mt-6">
                <button id="prev-page" class="px-3 py-1 text-sm rounded-lg border bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
                    ◀ Trang trước
                </button>
                <span class="text-sm font-medium text-gray-600 px-2">${currentPage} / ${totalPages}</span>
                <button id="next-page" class="px-3 py-1 text-sm rounded-lg border bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>
                    Trang sau ▶
                </button>
            </div>
        `;

        paginationContainer.innerHTML = html;

        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateStageData();
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateStageData();
            }
        });
    }

    // Khởi chạy ứng dụng
    loadData();
>>>>>>> 0ea032681a2ea646a0bcd519c8c9fd3fe285a401
});
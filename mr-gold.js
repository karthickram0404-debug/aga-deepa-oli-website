/* ============================================
   MR GOLD KAVITHAIKAL — JavaScript
   Navigation, Animations, Interactions, API
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // === DOM References ===
    const header = document.getElementById('main-header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const scrollTopBtn = document.getElementById('scroll-top');
    const toast = document.getElementById('toast');
    const particlesContainer = document.getElementById('particles');

    // API base — works when served by server.js
    const API_BASE = window.location.origin;

    // === Navigation ===
    function navigateTo(sectionId) {
        // Hide all sections
        sections.forEach(s => s.classList.remove('active'));

        // Remove active from all nav links
        navLinks.forEach(l => l.classList.remove('active'));

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');

            // Add active to matching nav link
            navLinks.forEach(l => {
                if (l.dataset.section === sectionId) {
                    l.classList.add('active');
                }
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Trigger card animations
            if (sectionId === 'kavithaikal') {
                animatePoemCards();
            }

            // Load saved poems when entering write or kavithaikal page
            if (sectionId === 'ezhuthungal') {
                loadSavedPoems();
            }
            if (sectionId === 'kavithaikal') {
                loadUserPoemsForDisplay();
            }
        }

        // Close mobile menu
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    // Nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) navigateTo(section);
        });
    });

    // Brand click -> home
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('home');
        });
    }

    // CTA button navigation
    document.querySelectorAll('[data-navigate]').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.navigate);
        });
    });

    // === Hamburger Toggle ===
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
        });
    }

    // === Header Scroll Effect ===
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll-to-top visibility
        if (currentScrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    // === Scroll to Top ===
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // === Poem Card Animations ===
    function animatePoemCards() {
        const cards = document.querySelectorAll('#poetry-grid .poem-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 80);
        });
    }

    // === Share Poem ===
    document.addEventListener('click', (e) => {
        if (e.target.closest('.poem-share-btn')) {
            const btn = e.target.closest('.poem-share-btn');
            const card = btn.closest('.poem-card');
            const title = card.querySelector('.poem-title').textContent.trim();
            const body = card.querySelector('.poem-body').textContent.trim();
            const text = `${title}\n\n${body}\n\n— Mr Gold Kavithaikal`;

            if (navigator.share) {
                navigator.share({
                    title: 'Mr Gold Kavithaikal - ' + title,
                    text: text,
                }).catch(() => {
                    copyToClipboard(text);
                });
            } else {
                copyToClipboard(text);
            }
        }
    });

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 கவிதை நகலெடுக்கப்பட்டது! (Copied!)');
        }).catch(() => {
            showToast('❌ நகலெடுக்க முடியவில்லை');
        });
    }

    // === Toast Notification ===
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // === Floating Gold Particles ===
    function createParticles() {
        if (!particlesContainer) return;
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    createParticles();

    // === Intersection Observer for scroll animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.author-highlight-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(el);
    });

    // === Keyboard Navigation ===
    document.addEventListener('keydown', (e) => {
        const sectionIds = ['home', 'author', 'kavithaikal', 'ezhuthungal', 'contact'];
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;

        const currentIndex = sectionIds.indexOf(activeSection.id);

        if (e.key === 'ArrowRight' && currentIndex < sectionIds.length - 1) {
            navigateTo(sectionIds[currentIndex + 1]);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            navigateTo(sectionIds[currentIndex - 1]);
        }
    });

    // === Initial hero animation ===
    const heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
        heroLogo.style.opacity = '0';
        heroLogo.style.transform = 'scale(0.8) translateY(20px)';
        setTimeout(() => {
            heroLogo.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            heroLogo.style.opacity = '1';
            heroLogo.style.transform = 'scale(1) translateY(0)';
        }, 200);
    }

    // ============================================
    // POEM CRUD — Server API Integration
    // ============================================

    const poemForm = document.getElementById('mr-gold-poem-form');
    const myPoemsGrid = document.getElementById('my-poems-grid');
    const noPoemsMsg = document.getElementById('no-poems-msg');
    const userPoemsHeading = document.getElementById('user-poems-heading');
    const userPoemsDivider = document.getElementById('user-poems-divider');
    const userPoetryGrid = document.getElementById('user-poetry-grid');

    // --- Submit New Poem ---
    if (poemForm) {
        poemForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('mg-poem-title').value.trim();
            const body = document.getElementById('mg-poem-body').value.trim();
            const author = document.getElementById('mg-poem-author').value.trim() || 'Mr Gold';

            if (!title || !body) {
                showToast('❌ தலைப்பு மற்றும் கவிதை தேவை!');
                return;
            }

            const submitBtn = poemForm.querySelector('.write-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ சேமிக்கிறது...';

            try {
                const response = await fetch(`${API_BASE}/api/poems`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        body,
                        author,
                        type: 'kavithai',
                        date: new Date().toISOString().split('T')[0]
                    })
                });

                if (!response.ok) throw new Error('Server error');

                const newPoem = await response.json();
                showToast('✅ கவிதை வெற்றிகரமாக சேமிக்கப்பட்டது!');

                // Reset form
                poemForm.reset();
                document.getElementById('mg-poem-author').value = 'Mr Gold';

                // Reload poems
                loadSavedPoems();

            } catch (err) {
                console.error('Error saving poem:', err);
                showToast('❌ சேமிக்க முடியவில்லை. சர்வர் இயங்குகிறதா என சரிபாருங்கள்.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '📤 பதிவேற்று (Publish)';
            }
        });
    }

    // --- Load Saved Poems (for the Write page) ---
    async function loadSavedPoems() {
        if (!myPoemsGrid) return;

        try {
            const response = await fetch(`${API_BASE}/api/poems?type=kavithai`);
            if (!response.ok) throw new Error('Fetch error');

            const poems = await response.json();

            if (poems.length === 0) {
                myPoemsGrid.innerHTML = '';
                if (noPoemsMsg) noPoemsMsg.style.display = 'block';
                return;
            }

            if (noPoemsMsg) noPoemsMsg.style.display = 'none';

            myPoemsGrid.innerHTML = poems.map((poem, i) => `
        <div class="poem-card fade-in" data-id="${poem.id}" style="animation-delay: ${i * 0.08}s">
          <span class="poem-number">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="poem-title"><span class="poem-title-icon">📜</span> ${escapeHtml(poem.title)}</h3>
          <p class="poem-body">${escapeHtml(poem.body)}</p>
          <div class="poem-footer">
            <span class="poem-author-tag">— ${escapeHtml(poem.author)}</span>
            <div class="poem-actions">
              <button class="poem-share-btn" title="பகிர்">📤 பகிர்</button>
              <button class="poem-delete-btn" data-id="${poem.id}" title="நீக்கு">🗑️ நீக்கு</button>
            </div>
          </div>
        </div>
      `).join('');

        } catch (err) {
            console.error('Error loading poems:', err);
            myPoemsGrid.innerHTML = '<p style="color: var(--gold-pale); opacity: 0.6; text-align:center; width:100%;">சர்வரை இணைக்க முடியவில்லை. <code>npm start</code> இயக்கவும்.</p>';
        }
    }

    // --- Load User Poems for Kavithaikal display ---
    async function loadUserPoemsForDisplay() {
        if (!userPoetryGrid) return;

        try {
            const response = await fetch(`${API_BASE}/api/poems?type=kavithai`);
            if (!response.ok) throw new Error('Fetch error');

            const poems = await response.json();

            if (poems.length === 0) {
                if (userPoemsHeading) userPoemsHeading.style.display = 'none';
                if (userPoemsDivider) userPoemsDivider.style.display = 'none';
                userPoetryGrid.innerHTML = '';
                return;
            }

            if (userPoemsHeading) userPoemsHeading.style.display = 'block';
            if (userPoemsDivider) userPoemsDivider.style.display = 'block';

            userPoetryGrid.innerHTML = poems.map((poem, i) => `
        <div class="poem-card fade-in" style="animation-delay: ${i * 0.08}s">
          <span class="poem-number">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="poem-title"><span class="poem-title-icon">📜</span> ${escapeHtml(poem.title)}</h3>
          <p class="poem-body">${escapeHtml(poem.body)}</p>
          <div class="poem-footer">
            <span class="poem-author-tag">— ${escapeHtml(poem.author)}</span>
            <button class="poem-share-btn" title="பகிர்">📤 பகிர்</button>
          </div>
        </div>
      `).join('');

        } catch (err) {
            // Silently fail for kavithaikal display
            console.error('Error loading user poems for display:', err);
        }
    }

    // --- Delete Poem ---
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.poem-delete-btn')) {
            const btn = e.target.closest('.poem-delete-btn');
            const id = btn.dataset.id;

            if (!confirm('இந்த கவிதையை நீக்க விரும்புகிறீர்களா?\nDelete this poem?')) {
                return;
            }

            btn.disabled = true;
            btn.textContent = '⏳';

            try {
                const response = await fetch(`${API_BASE}/api/poems/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Delete error');

                showToast('🗑️ கவிதை நீக்கப்பட்டது!');

                // Remove the card with animation
                const card = btn.closest('.poem-card');
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.remove();
                    // Check if grid is empty
                    if (myPoemsGrid && myPoemsGrid.children.length === 0) {
                        if (noPoemsMsg) noPoemsMsg.style.display = 'block';
                    }
                }, 300);

            } catch (err) {
                console.error('Error deleting poem:', err);
                showToast('❌ நீக்க முடியவில்லை');
                btn.disabled = false;
                btn.textContent = '🗑️ நீக்கு';
            }
        }
    });

    // --- HTML Escape Utility ---
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

});

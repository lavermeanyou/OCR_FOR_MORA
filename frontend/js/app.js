/**
 * App Logic: 페이지 전환, 업로드, 결과 표시, 검색
 */

const API_BASE = window.location.port === '8000'
    ? ''
    : 'http://localhost:8000';

let currentFile = null;

// ===== Page Navigation =====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId.replace('Page', '')) {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLanding() { showPage('landingPage'); }
function showUpload() { showPage('uploadPage'); }
function showResult() { showPage('resultPage'); }
function showSearch() { showPage('searchPage'); }

// ===== Upload Handling =====
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const previewImg = document.getElementById('previewImg');

if (uploadZone) {
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewArea.style.display = 'block';
        uploadZone.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// ===== Process Image =====
async function processImage() {
    if (!currentFile) return;

    const loading = document.getElementById('loading');
    const processBtn = document.getElementById('processBtn');

    loading.style.display = 'block';
    processBtn.disabled = true;
    processBtn.style.opacity = 0.5;

    const formData = new FormData();
    formData.append('file', currentFile);

    try {
        const res = await fetch(`${API_BASE}/process`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        displayResult(data);
        showResult();
    } catch (err) {
        alert(`처리 실패: ${err.message}`);
    } finally {
        loading.style.display = 'none';
        processBtn.disabled = false;
        processBtn.style.opacity = 1;

        // Reset upload state
        previewArea.style.display = 'none';
        uploadZone.style.display = '';
        fileInput.value = '';
        currentFile = null;
    }
}

// ===== Display Result =====
function displayResult(data) {
    const parsed = data.parsed || {};

    document.getElementById('resultName').textContent = parsed.name || '(인식 안 됨)';
    document.getElementById('resultPosition').textContent = parsed.position || '';
    document.getElementById('resultCompany').textContent = parsed.company || '-';
    document.getElementById('resultPhone').textContent = parsed.phone || parsed.fax || '-';
    document.getElementById('resultEmail').textContent = parsed.email || '-';

    // Meta
    const storedBadge = document.getElementById('resultStored');
    storedBadge.textContent = data.stored ? 'Stored' : 'Not Stored';
    storedBadge.style.background = data.stored
        ? 'rgba(255, 138, 61, 0.12)'
        : 'rgba(132, 136, 141, 0.12)';

    document.getElementById('resultVectors').textContent = `${data.total_vectors || 0} vectors`;

    // Raw blocks
    const rawBlocks = document.getElementById('rawBlocks');
    const blocks = data.classified_blocks || [];

    if (blocks.length > 0) {
        let html = '<h3>OCR Detected Blocks</h3><div class="block-list">';
        blocks.forEach(b => {
            html += `
                <div class="block-item">
                    <span class="block-text">${escapeHtml(b.text)}</span>
                    <span class="block-field field-${b.field}">${b.field}</span>
                </div>`;
        });
        html += '</div>';
        rawBlocks.innerHTML = html;
    } else {
        rawBlocks.innerHTML = '';
    }
}

// ===== Search =====
async function doSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    if (!query) return;

    const resultsEl = document.getElementById('searchResults');
    resultsEl.innerHTML = '<div class="loading"><div class="spinner"></div><p>검색 중...</p></div>';

    try {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&top_k=10`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        displaySearchResults(data);
    } catch (err) {
        resultsEl.innerHTML = `<div class="empty-state"><span class="material-icons-outlined">error_outline</span><p>검색 실패: ${escapeHtml(err.message)}</p></div>`;
    }
}

function displaySearchResults(data) {
    const resultsEl = document.getElementById('searchResults');
    const results = data.results || [];

    if (results.length === 0) {
        resultsEl.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-outlined">search_off</span>
                <p>"${escapeHtml(data.query)}"에 대한 결과가 없습니다</p>
            </div>`;
        return;
    }

    let html = `<p class="search-count">"${escapeHtml(data.query)}" - ${results.length}건 발견</p>`;

    results.forEach((r, i) => {
        const meta = r.metadata || {};
        const score = (r.score * 100).toFixed(1);

        html += `
            <div class="search-result-card" style="animation-delay: ${i * 0.08}s">
                <div class="search-result-info">
                    <h3>${escapeHtml(meta.name || '(이름 없음)')}</h3>
                    <p>
                        ${meta.company ? escapeHtml(meta.company) : ''}
                        ${meta.position ? ' &middot; ' + escapeHtml(meta.position) : ''}
                        ${meta.phone ? '<br>' + escapeHtml(meta.phone) : ''}
                        ${meta.email ? ' &middot; ' + escapeHtml(meta.email) : ''}
                    </p>
                </div>
                <div class="search-score">${score}%</div>
            </div>`;
    });

    resultsEl.innerHTML = html;
}

// ===== Utils =====
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

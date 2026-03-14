const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

let selectedFile = null;

// Upload area click
uploadArea.addEventListener('click', () => fileInput.click());

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// File input change
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
    }
});

function handleFile(file) {
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewSection.style.display = 'block';
    };
    reader.readAsDataURL(file);

    submitBtn.style.display = 'block';
    results.style.display = 'none';
}

// Submit
submitBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    submitBtn.disabled = true;
    loading.style.display = 'block';
    results.style.display = 'none';

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await fetch('/api/ocr/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.error) {
            alert('오류: ' + data.error);
        } else {
            renderResults(data);
        }
    } catch (err) {
        alert('서버 연결 실패: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
});

function renderResults(data) {
    // Classified results table
    const classifiedBody = document.querySelector('#classifiedTable tbody');
    classifiedBody.innerHTML = '';

    if (data.result_korean) {
        for (const [label, value] of Object.entries(data.result_korean)) {
            const row = document.createElement('tr');
            row.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td>`;
            classifiedBody.appendChild(row);
        }
    }

    // Raw blocks table
    const rawBody = document.querySelector('#rawTable tbody');
    rawBody.innerHTML = '';

    const blocks = data.classified_blocks || [];
    blocks.forEach((block, i) => {
        const row = document.createElement('tr');
        const conf = (block.confidence * 100).toFixed(1);
        const fieldClass = block.field === 'unknown' ? 'field-unknown' : '';
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${block.text}</td>
            <td class="confidence">${conf}%</td>
            <td class="${fieldClass}">${block.field}</td>
        `;
        rawBody.appendChild(row);
    });

    results.style.display = 'block';
}

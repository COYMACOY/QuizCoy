// =================== SELECTOR ===================
const layarAwal = document.getElementById('start-screen');
const layarKuis = document.getElementById('quiz-screen');
const layarHasil = document.getElementById('result-screen');
const layarPapanSkor = document.getElementById('leaderboard-screen');

const inputNama = document.getElementById('player-name');
const tombolMulai = document.getElementById('btn-start');
const tombolLihatPapan = document.getElementById('btn-view-leaderboard');
const teksPemain = document.getElementById('player-display');
const timerEl = document.getElementById('time-left');
const teksPertanyaan = document.getElementById('question-text');
const wadahJawaban = document.getElementById('answers');
const tombolBerikutnya = document.getElementById('btn-next');
const teksHasil = document.getElementById('result-text');
const skorAkhirEl = document.getElementById('final-score');
const tombolUlang = document.getElementById('btn-restart');
const tombolSimpan = document.getElementById('btn-save');
const tombolKembali = document.getElementById('btn-back');
const tombolHapus = document.getElementById('btn-clear');
const daftarPapanSkor = document.getElementById('leaderboard-list');
const comboContainer = document.getElementById('combo-container');

// Achievement container
let achievementContainer;

// Suara
const suaraBenar = new Audio('benar.mp3');
const suaraSalah = new Audio('salah.mp3');
const suaraTimeout = new Audio('timeout.mp3');

// =================== VARIABLE GLOBAL ===================
let namaPemain = '';
let daftarPertanyaan = [];
let indexSoal = 0;
let skor = 0;
let timer = null;
let sisaWaktu = 15;
let comboStreak = 0;
let totalWaktuJawab = 0;
let totalSoalDijawab = 0;

const WAKTU_PER_SOAL = 15;
const KEY_PENYIMPANAN = 'quizcoy_papan_skor';

// =================== FUNCTION UTILITY ===================
function acakArray(arr) {
  return arr.map(v => ({ v, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map(x => x.v);
}

function tampilkanLayar(layar) {
  [layarAwal, layarKuis, layarHasil, layarPapanSkor].forEach(l => l.classList.add('hidden'));
  layar.classList.remove('hidden');
}

// =================== GAMEPLAY ===================
function mulaiKuis() {
  namaPemain = inputNama.value.trim() || 'Pemain';
  teksPemain.textContent = `Pemain: ${namaPemain}`;
  daftarPertanyaan = acakArray(PERTANYAAN).slice(0, 10);
  indexSoal = 0; skor = 0; comboStreak = 0;
  totalWaktuJawab = 0; totalSoalDijawab = 0;
  tampilkanLayar(layarKuis);
  tampilkanSoal(true);
}

function tampilkanSoal(isFirst = false) {
  clearInterval(timer);
  sisaWaktu = WAKTU_PER_SOAL;
  timerEl.textContent = sisaWaktu;

  const q = daftarPertanyaan[indexSoal];
  wadahJawaban.innerHTML = '';
  teksPertanyaan.textContent = `(${indexSoal + 1}/${daftarPertanyaan.length}) ${q.q}`;

  q.a.forEach((opsi, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.textContent = opsi;
    btn.dataset.index = idx;
    btn.addEventListener('click', jawab);
    wadahJawaban.appendChild(btn);
  });

  tombolBerikutnya.disabled = true;
  if (!isFirst) {
    teksPertanyaan.classList.add('fade-in');
    setTimeout(() => teksPertanyaan.classList.remove('fade-in'), 400);
  }

  timer = setInterval(() => {
    sisaWaktu -= 1;
    timerEl.textContent = sisaWaktu;
    if (sisaWaktu <= 3) {
      timerEl.style.color = 'red';
      timerEl.style.fontWeight = 'bold';
    } else {
      timerEl.style.color = '';
      timerEl.style.fontWeight = '';
    }
    if (sisaWaktu <= 0) {
      clearInterval(timer);
      waktuHabis();
    }
  }, 1000);
}

function jawab(e) {
  clearInterval(timer);
  const pilihan = Number(e.currentTarget.dataset.index);
  const q = daftarPertanyaan[indexSoal];
  const semuaTombol = Array.from(wadahJawaban.children);
  semuaTombol.forEach(b => b.removeEventListener('click', jawab));

  totalWaktuJawab += (WAKTU_PER_SOAL - sisaWaktu);
  totalSoalDijawab++;

  if (pilihan === q.correct) {
    e.currentTarget.classList.add('correct');
    suaraBenar.play();
    comboStreak++;
    if (comboStreak >= 3) tampilkanCombo(comboStreak);
    const bonusWaktu = Math.max(0, Math.floor((sisaWaktu / WAKTU_PER_SOAL) * 5));
    skor += 10 + bonusWaktu;
  } else {
    e.currentTarget.classList.add('wrong');
    suaraSalah.play();
    semuaTombol[q.correct].classList.add('correct');
    comboStreak = 0;
  }
  tombolBerikutnya.disabled = false;
}

function tampilkanCombo(combo) {
  const comboEl = document.createElement('div');
  comboEl.className = 'combo-text';
  comboEl.textContent = `🔥 Combo ${combo}x!`;

  comboContainer.appendChild(comboEl); // append ke header
  comboEl.addEventListener('animationend', () => comboEl.remove());
}

function waktuHabis() {
  suaraTimeout.play();
  const tombol = Array.from(wadahJawaban.children);
  const q = daftarPertanyaan[indexSoal];
  if (tombol[q.correct]) tombol[q.correct].classList.add('correct');
  tombol.forEach(b => b.removeEventListener('click', jawab));
  comboStreak = 0;
  tombolBerikutnya.disabled = false;
}

// =================== NAVIGASI SOAL ===================
tombolBerikutnya.addEventListener('click', () => {
  indexSoal += 1;
  if (indexSoal >= daftarPertanyaan.length) {
    selesaiKuis();
  } else {
    tampilkanSoal();
  }
});

// =================== SELESAI KUIS ===================
function selesaiKuis() {
  clearInterval(timer);
  teksHasil.textContent = `Terima kasih ${namaPemain}! Kamu sudah menyelesaikan kuis.`;
  skorAkhirEl.textContent = skor;
  tampilkanLayar(layarHasil);

  if (skor >= 50) {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
  }

  tampilkanAchievement();
}

function tampilkanAchievement() {
  if (achievementContainer) achievementContainer.remove();
  achievementContainer = document.createElement('div');
  achievementContainer.style.marginTop = '10px';

  if (skor === daftarPertanyaan.length * 10) addAchievement("🏆 Perfect! Semua benar!");
  const avgTime = totalWaktuJawab / totalSoalDijawab;
  if (avgTime < 5) addAchievement("⚡ Cepat Tanggap! Rata-rata jawab < 5 detik!");
  if (skor < 50) addAchievement("💪 Tahan Banting! Tetap main walau banyak salah 😆");

  layarHasil.appendChild(achievementContainer);
}

function addAchievement(text) {
  const div = document.createElement('div');
  div.className = 'achievement';
  div.textContent = text;
  achievementContainer.appendChild(div);
}

// =================== LEADERBOARD ===================
function loadPapanSkor() {
  const raw = localStorage.getItem(KEY_PENYIMPANAN);
  return raw ? JSON.parse(raw) : [];
}

function simpanSkor() {
  const papan = loadPapanSkor();
  papan.push({ nama: namaPemain, skor, tanggal: new Date().toISOString() });
  papan.sort((a, b) => b.skor - a.skor);
  localStorage.setItem(KEY_PENYIMPANAN, JSON.stringify(papan.slice(0, 10)));
}

function renderPapanSkor() {
  const papan = loadPapanSkor();
  daftarPapanSkor.innerHTML = '';
  if (papan.length === 0) {
    daftarPapanSkor.innerHTML = '<li>Belum ada skor. Main dulu!</li>';
    return;
  }
  papan.forEach(entry => {
    const li = document.createElement('li');
    const d = new Date(entry.tanggal);
    li.innerHTML = `<span>${entry.nama}</span> <strong>${entry.skor} poin</strong> <small>(${d.toLocaleString()})</small>`;
    daftarPapanSkor.appendChild(li);
  });
}

function tampilkanPapanSkor() {
  renderPapanSkor();
  tampilkanLayar(layarPapanSkor);
}

// =================== EVENT LISTENER ===================
tombolMulai.addEventListener('click', mulaiKuis);
tombolUlang.addEventListener('click', () => tampilkanLayar(layarAwal));
tombolSimpan.addEventListener('click', () => { simpanSkor(); tampilkanPapanSkor(); });
tombolLihatPapan.addEventListener('click', tampilkanPapanSkor);
tombolKembali.addEventListener('click', () => tampilkanLayar(layarAwal));
tombolHapus.addEventListener('click', () => {
  if (confirm('Hapus semua data papan skor?')) {
    localStorage.removeItem(KEY_PENYIMPANAN);
    renderPapanSkor();
  }
});

inputNama.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') mulaiKuis();
});

document.addEventListener('DOMContentLoaded', () => {
  tampilkanLayar(layarAwal);
});

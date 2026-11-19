/* Body of Work catalog — Arman Mahmoudi.
   Works data taken from armanmahmoudi.ir (gallery page).
   Images are hosted on armanmahmoudi.ir/gallery/ and hotlinked here,
   so this catalog repo stays text-only. */
var BASE = 'https://armanmahmoudi.ir/gallery/';

var WORKS = [
  { file: 'g1-1.jpg', group: 'lev2022', label: 'LEVITATION · 2022' },
  { file: 'g1-2.jpg', group: 'lev2022', label: 'LEVITATION · 2022' },
  { file: 'g1-3.jpg', group: 'lev2022', label: 'LEVITATION · 2022' },
  { file: 'g1-4.jpg', group: 'lev2022', label: 'LEVITATION · 2022' },
  { file: 'g1-5.jpg', group: 'lev2022', label: 'LEVITATION · 2022' },
  { file: 'g2-1.png', group: 'lev2024', label: 'LEVITATION · 2024' },
  { file: 'g2-2.png', group: 'lev2024', label: 'LEVITATION · 2024' },
  { file: 'g2-3.png', group: 'lev2024', label: 'LEVITATION · 2024' },
  { file: 'dr-1.jpg', group: 'dr2025', label: 'DRAWING · 2025' },
  { file: 'dr-2.jpg', group: 'dr2025', label: 'DRAWING · 2025' },
  { file: 'dr-3.jpg', group: 'dr2022', label: 'DRAWING · 2022' },
  { file: 'dr-4.jpg', group: 'dr2022', label: 'DRAWING · 2022' },
  { file: 'dr-5.jpg', group: 'dr2022', label: 'DRAWING · 2022' }
];

var grid = document.getElementById('grid');
var count = document.getElementById('count');
var currentFilter = 'all';
var visible = WORKS.slice();

function render() {
  visible = WORKS.filter(function (w) {
    return currentFilter === 'all' || w.group === currentFilter;
  });
  count.textContent = visible.length + ' WORKS';
  grid.innerHTML = '';
  visible.forEach(function (w, i) {
    var fig = document.createElement('figure');
    var img = document.createElement('img');
    img.src = BASE + w.file;
    img.alt = w.label + ' — Arman Mahmoudi';
    img.loading = 'lazy';
    img.onclick = function () { openLb(i); };
    var cap = document.createElement('figcaption');
    cap.textContent = w.label;
    fig.appendChild(img);
    fig.appendChild(cap);
    grid.appendChild(fig);
  });
}

document.getElementById('filters').addEventListener('click', function (e) {
  var btn = e.target.closest('button');
  if (!btn) return;
  document.querySelectorAll('#filters button').forEach(function (b) {
    b.classList.remove('on');
  });
  btn.classList.add('on');
  currentFilter = btn.getAttribute('data-filter');
  render();
});

/* Lightbox with prev / next across the currently visible works. */
var lb = document.getElementById('lb');
var lbImg = document.getElementById('lbImg');
var lbLabel = document.getElementById('lbLabel');
var lbNum = document.getElementById('lbNum');
var lbIndex = 0;

function openLb(i) {
  lbIndex = i;
  showLb();
  lb.classList.add('open');
}
function showLb() {
  var w = visible[lbIndex];
  lbImg.src = BASE + w.file;
  lbLabel.textContent = w.label;
  lbNum.textContent = (lbIndex + 1) + ' / ' + visible.length;
}
function step(d) {
  lbIndex = (lbIndex + d + visible.length) % visible.length;
  showLb();
}
function closeLb() { lb.classList.remove('open'); }

document.getElementById('lbClose').onclick = closeLb;
document.getElementById('lbPrev').onclick = function (e) { e.stopPropagation(); step(-1); };
document.getElementById('lbNext').onclick = function (e) { e.stopPropagation(); step(1); };
lbImg.onclick = function (e) { e.stopPropagation(); };
lb.onclick = closeLb;
document.addEventListener('keydown', function (e) {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

render();

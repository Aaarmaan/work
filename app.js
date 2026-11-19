/* Body of Work catalog — Arman Mahmoudi.
   Works data: his 13 photos (Levitation 2022/2024, Drawings 2025/2022),
   hosted on armanmahmoudi.ir/gallery/. Per-work details come from the
   caption printed under each photo: Levitation works are Untitled,
   Mixed Media, 50 x 70 cm (2022) and 100 x 70 cm (2024). The drawings
   carry no caption, so they have no title, medium or dimensions here.
   NOTE: the English caption on g1-1 says Year 2024, but its Persian
   caption (1401) and the site's Levitation 2022 grouping say 2022. */
var BASE = 'https://armanmahmoudi.ir/gallery/';

var WORKS = [
  { file: 'g1-1.jpg', series: 'Levitation', title: 'Untitled', year: '2022', group: 'lev2022', medium: 'Mixed Media', dims: '50 × 70 cm', n: 1, of: 5 },
  { file: 'g1-2.jpg', series: 'Levitation', title: 'Untitled', year: '2022', group: 'lev2022', medium: 'Mixed Media', dims: '50 × 70 cm', n: 2, of: 5 },
  { file: 'g1-3.jpg', series: 'Levitation', title: 'Untitled', year: '2022', group: 'lev2022', medium: 'Mixed Media', dims: '50 × 70 cm', n: 3, of: 5 },
  { file: 'g1-4.jpg', series: 'Levitation', title: 'Untitled', year: '2022', group: 'lev2022', medium: 'Mixed Media', dims: '50 × 70 cm', n: 4, of: 5 },
  { file: 'g1-5.jpg', series: 'Levitation', title: 'Untitled', year: '2022', group: 'lev2022', medium: 'Mixed Media', dims: '50 × 70 cm', n: 5, of: 5 },
  { file: 'g2-1.png', series: 'Levitation', title: 'Untitled', year: '2024', group: 'lev2024', medium: 'Mixed Media', dims: '100 × 70 cm', n: 1, of: 3 },
  { file: 'g2-2.png', series: 'Levitation', title: 'Untitled', year: '2024', group: 'lev2024', medium: 'Mixed Media', dims: '100 × 70 cm', n: 2, of: 3 },
  { file: 'g2-3.png', series: 'Levitation', title: 'Untitled', year: '2024', group: 'lev2024', medium: 'Mixed Media', dims: '100 × 70 cm', n: 3, of: 3 },
  { file: 'dr-1.jpg', series: 'Drawing', title: 'Drawing', year: '2025', group: 'dr2025', medium: '', dims: '', n: 1, of: 2 },
  { file: 'dr-2.jpg', series: 'Drawing', title: 'Drawing', year: '2025', group: 'dr2025', medium: '', dims: '', n: 2, of: 2 },
  { file: 'dr-3.jpg', series: 'Drawing', title: 'Drawing', year: '2022', group: 'dr2022', medium: '', dims: '', n: 1, of: 3 },
  { file: 'dr-4.jpg', series: 'Drawing', title: 'Drawing', year: '2022', group: 'dr2022', medium: '', dims: '', n: 2, of: 3 },
  { file: 'dr-5.jpg', series: 'Drawing', title: 'Drawing', year: '2022', group: 'dr2022', medium: '', dims: '', n: 3, of: 3 }
];

var grid = document.getElementById('grid');
var count = document.getElementById('count');
var search = document.getElementById('search');
var currentFilter = 'all';
var currentYear = null;
var query = '';

function visibleWorks() {
  return WORKS.filter(function (w) {
    if (currentFilter !== 'all' && w.group !== currentFilter) return false;
    if (currentYear && w.year !== currentYear) return false;
    if (query) {
      var hay = (w.series + ' ' + w.title + ' ' + w.year).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  });
}

var visible = WORKS.slice();

function render() {
  visible = visibleWorks();
  count.textContent = visible.length + ' WORKS';
  grid.innerHTML = '';
  visible.forEach(function (w, i) {
    var fig = document.createElement('figure');
    var cell = document.createElement('div');
    cell.className = 'cell-img';
    var img = document.createElement('img');
    img.src = BASE + w.file;
    img.alt = w.series + ' ' + w.year + ' — Arman Mahmoudi';
    img.loading = 'lazy';
    cell.appendChild(img);
    cell.onclick = function () { openOverlay(i); };
    var cap = document.createElement('figcaption');
    var ttl = document.createElement('span');
    ttl.className = 'ttl';
    ttl.textContent = w.title.toUpperCase();
    var yr = document.createElement('span');
    yr.className = 'yr';
    yr.textContent = w.dims || w.year;
    cap.appendChild(ttl);
    cap.appendChild(yr);
    fig.appendChild(cell);
    fig.appendChild(cap);
    grid.appendChild(fig);
  });
}

/* Filters panel */
var filtersPanel = document.getElementById('filtersPanel');
document.getElementById('filtersBtn').onclick = function () {
  filtersPanel.hidden = !filtersPanel.hidden;
};
filtersPanel.addEventListener('click', function (e) {
  var btn = e.target.closest('button');
  if (!btn) return;
  if (btn.hasAttribute('data-filter')) {
    document.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.remove('on'); });
    btn.classList.add('on');
    currentFilter = btn.getAttribute('data-filter');
  } else if (btn.hasAttribute('data-year')) {
    var y = btn.getAttribute('data-year');
    if (currentYear === y) {
      currentYear = null;
      btn.classList.remove('on');
    } else {
      document.querySelectorAll('[data-year]').forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      currentYear = y;
    }
  }
  render();
});
search.addEventListener('input', function () {
  query = search.value.trim().toLowerCase();
  render();
});

/* Series pills above the globe also filter the grid. */
document.querySelectorAll('.pills .pill').forEach(function (pill) {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.pills .pill').forEach(function (p) { p.classList.remove('on'); });
    pill.classList.add('on');
    var s = pill.getAttribute('data-series');
    if (s === 'drawings') {
      currentFilter = 'all';
      currentYear = null;
      query = 'drawing';
      search.value = 'drawing';
    } else {
      currentFilter = s;
      currentYear = null;
      query = '';
      search.value = '';
    }
    document.querySelectorAll('[data-filter]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-filter') === currentFilter && s !== 'drawings');
    });
    document.querySelectorAll('[data-year]').forEach(function (b) { b.classList.remove('on'); });
    render();
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  });
});

/* Work detail overlay — a slideshow: view 0 is the whole painting,
   views 1-3 are zoomed detail crops of the same painting. */
var overlay = document.getElementById('overlay');
var ovImg = document.getElementById('ovImg');
var ovTitle = document.getElementById('ovTitle');
var ovSpecs = document.getElementById('ovSpecs');
var ovCount = document.getElementById('ovCount');
var ovPrev = document.getElementById('ovPrev');
var ovNext = document.getElementById('ovNext');
var ovIndex = 0;
var viewIndex = 0;
var VIEWS = 4;
var VIEW_POS = ['', '20% 15%', '50% 45%', '80% 80%'];

function specRow(label, value) {
  if (!value) return '';
  return '<tr><td>' + label + '</td><td>' + value + '</td></tr>';
}

function showOverlay() {
  var w = visible[ovIndex];
  ovImg.src = BASE + w.file;
  ovImg.className = viewIndex === 0 ? '' : 'detail';
  ovImg.style.objectPosition = VIEW_POS[viewIndex];
  ovTitle.textContent = w.title;
  ovSpecs.innerHTML =
    specRow('Title', w.title) +
    specRow('Medium', w.medium) +
    specRow('Year', w.year) +
    specRow('Series', w.series) +
    specRow('Dimensions', w.dims) +
    specRow('Work', w.n + ' of ' + w.of);
  ovCount.textContent = 'image ' + (viewIndex + 1) + ' of ' + VIEWS + ' — ' + (ovIndex + 1) + ' / ' + visible.length;
  ovPrev.disabled = ovIndex === 0;
  ovNext.disabled = ovIndex === visible.length - 1;
}
function openOverlay(i) {
  ovIndex = i;
  viewIndex = 0;
  showOverlay();
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeOverlay() {
  overlay.hidden = true;
  document.body.style.overflow = '';
}
function stepWork(d) {
  var next = ovIndex + d;
  if (next < 0 || next >= visible.length) return;
  ovIndex = next;
  viewIndex = 0;
  showOverlay();
}
function stepView(d) {
  viewIndex = (viewIndex + d + VIEWS) % VIEWS;
  showOverlay();
}
document.getElementById('ovClose').onclick = closeOverlay;
ovPrev.onclick = function () { stepWork(-1); };
ovNext.onclick = function () { stepWork(1); };
document.getElementById('ovEdgePrev').onclick = function () { stepView(-1); };
document.getElementById('ovEdgeNext').onclick = function () { stepView(1); };
overlay.addEventListener('click', function (e) {
  if (e.target === overlay) closeOverlay();
});
document.getElementById('ovTimeline').onclick = function () {
  closeOverlay();
  document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
};
document.addEventListener('keydown', function (e) {
  if (overlay.hidden) return;
  if (e.key === 'Escape') closeOverlay();
  if (e.key === 'ArrowLeft') stepWork(-1);
  if (e.key === 'ArrowRight') stepWork(1);
});

render();

/* Animated dotted globe — "Where the work lives".
   Land dots from LAND_DOTS (world-atlas land-110m, sampled).
   Auto-rotates slowly, drag to turn, pause button, zoom buttons,
   one exhibition marker: Tehran (One Week with the Iranian Society
   of Painters, 9–19 Oct 2026). No invented collector locations. */
(function () {
  var canvas = document.getElementById('globe');
  if (!canvas || typeof LAND_DOTS === 'undefined') return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var CX = W / 2, CY = H / 2;

  var state = {
    rotY: -0.6,        // start facing the Atlantic / Europe-Africa
    rotX: 0.32,        // slight tilt so the north reads well
    targetRotY: -0.6,
    targetRotX: 0.32,
    zoom: 1,
    paused: false,
    dragging: false,
    lastX: 0, lastY: 0,
    idle: 0
  };

  // Precompute 3D points from lat/lon.
  var pts = LAND_DOTS.map(function (d) {
    var lat = d[0] * Math.PI / 180, lon = d[1] * Math.PI / 180;
    return {
      x: Math.cos(lat) * Math.cos(lon),
      y: Math.sin(lat),
      z: Math.cos(lat) * Math.sin(lon)
    };
  });

  var TEHRAN = { lat: 35.7, lon: 51.4 };
  var tehran3 = (function () {
    var lat = TEHRAN.lat * Math.PI / 180, lon = TEHRAN.lon * Math.PI / 180;
    return {
      x: Math.cos(lat) * Math.cos(lon),
      y: Math.sin(lat),
      z: Math.cos(lat) * Math.sin(lon)
    };
  })();

  function rotate(p, rotY, rotX) {
    var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    var x1 = p.x * cosY - p.z * sinY;
    var z1 = p.x * sinY + p.z * cosY;
    var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    var y2 = p.y * cosX - z1 * sinX;
    var z2 = p.y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
  }

  var markerScreen = null;
  var callout = document.getElementById('callout');
  var showExhib = document.getElementById('showExhib');

  function drawMuseum(x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.1);
    ctx.lineTo(0, -r * 0.55);
    ctx.lineTo(r * 0.55, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, r * 0.45);
    ctx.lineTo(r * 0.45, r * 0.45);
    ctx.stroke();
    [-0.32, 0, 0.32].forEach(function (dx) {
      ctx.beginPath();
      ctx.moveTo(dx * r, -r * 0.05);
      ctx.lineTo(dx * r, r * 0.38);
      ctx.stroke();
    });
    ctx.restore();
  }

  function draw() {
    var R = 250 * state.zoom;
    ctx.clearRect(0, 0, W, H);

    // Globe outline
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#2e2e2e';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Land dots
    var i, p, q;
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      q = rotate(p, state.rotY, state.rotX);
      if (q.z < -0.08) continue; // around the back
      var a = 0.25 + 0.75 * Math.max(0, q.z);
      ctx.fillStyle = 'rgba(150,150,150,' + a.toFixed(2) + ')';
      var r = q.z > 0 ? 1.7 : 1.2;
      ctx.beginPath();
      ctx.arc(CX + q.x * R, CY - q.y * R, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exhibition marker: Tehran
    markerScreen = null;
    if (showExhib && showExhib.checked) {
      q = rotate(tehran3, state.rotY, state.rotX);
      if (q.z > 0.03) {
        var mx = CX + q.x * R, my = CY - q.y * R;
        markerScreen = { x: mx, y: my };
        ctx.beginPath();
        ctx.arc(mx, my, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#f2f2f2';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0b0b0b';
        ctx.stroke();
        drawMuseum(mx, my, 11);
      } else {
        callout.hidden = true;
      }
    }
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!state.paused && !state.dragging) {
      state.idle += dt;
      if (state.idle > 2) {
        // Slow auto-rotation: one full turn in ~240 seconds.
        state.rotY += dt * (Math.PI * 2 / 240);
      }
    }
    // Ease toward target after dragging.
    state.rotY += (state.targetRotY - state.rotY) * 0.08;
    state.rotX += (state.targetRotX - state.rotX) * 0.08;
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (W / rect.width);
    var y = (e.clientY - rect.top) * (H / rect.height);
    return { x: x, y: y };
  }

  canvas.addEventListener('pointerdown', function (e) {
    state.dragging = true;
    state.idle = 0;
    var p = pos(e);
    state.lastX = p.x; state.lastY = p.y;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    var p = pos(e);
    if (state.dragging) {
      var dx = p.x - state.lastX, dy = p.y - state.lastY;
      state.targetRotY += dx * 0.005;
      state.targetRotX = Math.max(-0.9, Math.min(0.9, state.targetRotX + dy * 0.003));
      state.rotY = state.targetRotY;
      state.rotX = state.targetRotX;
      state.lastX = p.x; state.lastY = p.y;
      state.idle = 0;
      return;
    }
    // Hover over the marker -> callout.
    if (markerScreen) {
      var d = Math.hypot(p.x - markerScreen.x, p.y - markerScreen.y);
      if (d < 20) {
        callout.innerHTML = 'Exhibition · One Week with the Iranian Society of Painters · Tehran, Iran<em>9–19 October 2026</em>';
        callout.hidden = false;
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    callout.hidden = true;
    canvas.style.cursor = 'grab';
  });
  function endDrag() {
    state.dragging = false;
    state.idle = 0;
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointerleave', function () {
    endDrag();
    callout.hidden = true;
  });
  canvas.addEventListener('click', function (e) {
    if (!markerScreen) return;
    var p = pos(e);
    if (Math.hypot(p.x - markerScreen.x, p.y - markerScreen.y) < 20) {
      document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
    }
  });

  var pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.addEventListener('click', function () {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '▶ Resume rotation' : '⏸ Pause rotation';
  });
  document.getElementById('zoomIn').addEventListener('click', function () {
    state.zoom = Math.min(1.5, state.zoom + 0.15);
  });
  document.getElementById('zoomOut').addEventListener('click', function () {
    state.zoom = Math.max(0.7, state.zoom - 0.15);
  });
})();

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
    rotY: -0.2,        // start facing the Atlantic / Europe-Africa
    rotX: 0.32,        // slight tilt so the north reads well
    targetRotY: -0.2,
    targetRotX: 0.32,
    zoom: 1,
    paused: false,
    dragging: false,
    lastX: 0, lastY: 0,
    idle: 0
  };

  // Precompute 3D points from lat/lon.
  // Correct mapping (east to the right when centred): x = cos(lat) sin(lon),
  // y = sin(lat), z = cos(lat) cos(lon). The previous build had x and z
  // swapped, which mirrored the map east-west and reversed the spin.
  var pts = LAND_DOTS.map(function (d) {
    var lat = d[0] * Math.PI / 180, lon = d[1] * Math.PI / 180;
    return {
      x: Math.cos(lat) * Math.sin(lon),
      y: Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lon)
    };
  });

  var TEHRAN = { lat: 35.7, lon: 51.4 };
  var tehran3 = (function () {
    var lat = TEHRAN.lat * Math.PI / 180, lon = TEHRAN.lon * Math.PI / 180;
    return {
      x: Math.cos(lat) * Math.sin(lon),
      y: Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lon)
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
        // rotY decreases so the surface travels left-to-right, like the Earth.
        state.rotY -= dt * (Math.PI * 2 / 240);
        state.targetRotY = state.rotY;
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

  var markerCard = document.getElementById('markerCard');
  var pointers = new Map();
  var pinchDist = 0;
  var dragDist = 0;

  function nearMarker(p) {
    return markerScreen && Math.hypot(p.x - markerScreen.x, p.y - markerScreen.y) < 22;
  }

  canvas.addEventListener('pointerdown', function (e) {
    var p = pos(e);
    pointers.set(e.pointerId, p);
    dragDist = 0;
    state.idle = 0;
    if (pointers.size === 2) {
      // Two fingers: pinch to zoom, not drag.
      var pts = Array.from(pointers.values());
      pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      state.dragging = false;
    } else {
      state.dragging = true;
      state.lastX = p.x; state.lastY = p.y;
    }
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  canvas.addEventListener('pointermove', function (e) {
    var p = pos(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchDist > 0) {
        state.zoom = Math.max(0.6, Math.min(2.2, state.zoom * d / pinchDist));
      }
      pinchDist = d;
      state.idle = 0;
      return;
    }
    if (state.dragging) {
      var dx = p.x - state.lastX, dy = p.y - state.lastY;
      dragDist += Math.abs(dx) + Math.abs(dy);
      // Dragging right pulls the surface right (effective longitude grows).
      state.targetRotY -= dx * 0.006;
      state.targetRotX = Math.max(-0.9, Math.min(0.9, state.targetRotX + dy * 0.003));
      state.rotY = state.targetRotY;
      state.rotX = state.targetRotX;
      state.lastX = p.x; state.lastY = p.y;
      state.idle = 0;
      return;
    }
    // Hover over the marker -> callout.
    if (nearMarker(p)) {
      callout.innerHTML = 'Made in Tehran · Exhibited: One Week with the Iranian Society of Painters, Tehran, Iran<em>9–19 October 2026</em>';
      callout.hidden = false;
      canvas.style.cursor = 'pointer';
      return;
    }
    callout.hidden = true;
    canvas.style.cursor = 'grab';
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) {
      state.dragging = false;
      state.idle = 0;
    }
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', function (e) {
    endPointer(e);
    callout.hidden = true;
  });
  canvas.addEventListener('click', function (e) {
    // A drag (or pinch) ending over the marker must not open the card.
    if (dragDist > 8 || !markerScreen) return;
    var p = pos(e);
    if (nearMarker(p)) {
      markerCard.hidden = !markerCard.hidden;
    } else if (!markerCard.hidden) {
      markerCard.hidden = true;
    }
  });
  document.getElementById('markerClose').addEventListener('click', function () {
    markerCard.hidden = true;
  });
  document.getElementById('markerLink').addEventListener('click', function () {
    markerCard.hidden = true;
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

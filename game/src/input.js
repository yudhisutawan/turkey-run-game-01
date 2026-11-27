// Gobble Dash — input: keyboard + mouse, with an edge-triggered
// queue so a single key press is never eaten by the frame loop.
export function createInput(canvas) {
  const keys = new Set();
  const pressed = [];
  let mouse = { x: 0, y: 0, clicked: false, down: false };

  function keyName(e) {
    return e.key.length === 1 ? e.key.toLowerCase() : e.key;
  }

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (!e.repeat) pressed.push(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(keyName(e)));

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = canvasPos(e);
    mouse = { x: p.x, y: p.y, clicked: true, down: true };
  });
  window.addEventListener('pointerup', () => { mouse.down = false; });

  return {
    held(k) { return keys.has(k); },
    // Drain the keys pressed since the last frame, in order.
    drainPressed() { const out = pressed.splice(0, pressed.length); return out; },
    takeClick() {
      if (!mouse.clicked) return null;
      mouse.clicked = false;
      return { x: mouse.x, y: mouse.y };
    },
  };
}

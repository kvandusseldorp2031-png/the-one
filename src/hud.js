export function createHud() {
  const root = document.getElementById('hud');

  root.innerHTML = `
    <div class="crosshair"></div>
    <div class="topbar">
      <div class="stat"><span class="label">SCORE</span><span id="hud-score">0</span></div>
      <div class="stat"><span class="label">AMMO</span><span id="hud-ammo">30 / 30</span></div>
    </div>
    <div class="reloading hidden" id="hud-reloading">RELOADING…</div>
    <div class="overlay" id="hud-overlay">
      <div class="panel">
        <h1>THE ONE</h1>
        <p class="tag">Shooting-range prototype — Black Ops 3 inspired</p>
        <ul>
          <li><b>WASD</b> move · <b>Shift</b> sprint · <b>Space</b> jump</li>
          <li><b>Mouse</b> aim · <b>Left click</b> fire · <b>R</b> reload</li>
          <li><b>Esc</b> release the cursor</li>
        </ul>
        <p class="hint">Pop the drones. Smaller targets score more.</p>
        <button id="hud-start" type="button">Click to play</button>
      </div>
    </div>
  `;

  const scoreEl = root.querySelector('#hud-score');
  const ammoEl = root.querySelector('#hud-ammo');
  const overlay = root.querySelector('#hud-overlay');
  const reloadingEl = root.querySelector('#hud-reloading');
  const startButton = root.querySelector('#hud-start');

  let score = 0;

  startButton.addEventListener('click', (event) => {
    event.stopPropagation();
    document.getElementById('game').click();
  });

  return {
    addScore(points) {
      score += points;
      scoreEl.textContent = String(score);
    },

    setAmmo(current, magSize) {
      ammoEl.textContent = `${current} / ${magSize}`;
      ammoEl.classList.toggle('low', current <= 5);
    },

    setPlaying(isPlaying) {
      overlay.classList.toggle('hidden', isPlaying);
    },

    setReloading(isReloading) {
      reloadingEl.classList.toggle('hidden', !isReloading);
    },

    hitMarker(points) {
      reloadingEl.textContent = `+${points}`;
      root.classList.remove('scored');
      void root.offsetWidth;
      root.classList.add('scored');
      setTimeout(() => {
        reloadingEl.textContent = 'RELOADING…';
      }, 260);
    },
  };
}

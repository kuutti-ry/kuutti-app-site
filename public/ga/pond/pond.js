// @ts-check
/**
 * The pond demo of 14/10/2026, over a page: the one script of the site
 * (docs/decisions.md, 17; CLAUDE.md, rule 1). The content security policy
 * allows this file and no other (customHttp.yml), and scripts/check-site.ts
 * holds that only /ga/pond/ loads it. It loads nothing, sends nothing and
 * keeps nothing.
 *
 * The water lies along the bottom of the window, and the page scrolls behind
 * it. Tap the water and the pup swims there; tap a fish and the pup catches
 * it; tilt the phone, or move the slider, and the water tilts. Left alone,
 * the pup comes up to breathe. With reduced motion asked for, the water lies
 * still and the fish wait; the pup still swims where it is sent. The art is
 * the demo's placeholder.
 */
(() => {
  /**
   * @template {Element} T
   * @param {string} id
   * @param {{ new (): T }} type
   * @returns {T}
   */
  const element = (id, type) => {
    const found = document.getElementById(id);
    if (!(found instanceof type)) throw new Error(`the pond has no #${id}`);
    return found;
  };

  const root = element("pond", HTMLElement);
  const panel = element("pond-panel", HTMLElement);
  const off = element("pond-off", HTMLElement);
  const svg = element("pond-svg", SVGSVGElement);
  const water = element("pond-water", SVGPathElement);
  const clip = element("pond-clip-path", SVGPathElement);
  const surface = element("pond-surface", SVGPathElement);
  const fishLayer = element("pond-fish", SVGGElement);
  const bubbleLayer = element("pond-bubbles", SVGGElement);
  const pupAir = element("pond-pup-air", SVGGElement);
  const pupWater = element("pond-pup-water", SVGGElement);
  const slider = element("pond-tilt", HTMLInputElement);
  const sliderOut = element("pond-tilt-out", HTMLOutputElement);
  const phoneButton = element("pond-phone", HTMLButtonElement);
  const startButton = element("pond-start", HTMLButtonElement);
  const timerOut = element("pond-timer", HTMLElement);
  const scoreOut = element("pond-score", HTMLElement);
  const status = element("pond-status", HTMLElement);
  const hud = element("pond-hud", HTMLElement);

  /** @type {Record<string, string>} The page's words (src/i18n/ui.ts, pond.*). */
  const words = JSON.parse(panel.dataset.words ?? "{}");
  /** @param {string} key */
  const word = (key) => words[key] ?? key;

  /** @type {Record<string, string>} The colours the page has no picker for; the pickers add theirs. */
  const palette = {
    airInk: "#2c2c2a",
    waterInk: "#042c53",
    fishTail: "#d85a30",
    bubble: "#e6f1fb",
  };
  /** @param {string} name */
  const colour = (name) => palette[name] ?? "#000000";

  // The pond is 160 units high and as wide as the window makes it. The water
  // lies 40 units down, and at full tilt it stands 30 higher or lower at the
  // edges. The demo's pup and fish are drawn smaller, to fit a band.
  const H = 160;
  const LEVEL = 40;
  const SWING = 30;
  const PUP = 0.55;
  const FISH = 0.75;
  let W = 400;

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const moving = () => (still.matches ? 0 : 1);

  let target = 0;
  let angle = 0;
  let spin = 0;
  let time = 0;
  let playing = false;
  let left = 0;
  let score = 0;
  const pup = { x: W / 2, y: LEVEL, vx: 0, vy: 0, rot: 0, chomp: 0 };
  /** @type {{ x: number, y: number } | null} */
  let goal = null;
  /** @typedef {{ x: number, depth: number, dir: number, phase: number, alive: boolean, back: number }} Fish */
  /** @type {Fish | null} */
  let prey = null;
  /** @type {Fish[]} */
  let fish = [];
  /** @type {{ x: number, y: number, r: number, v: number }[]} */
  let bubbles = [];
  /** @type {Element[]} */
  let heads = [];

  /** The still water's height at x, tilted. @param {number} x */
  const level = (x) => LEVEL + (angle / 40) * SWING * ((x - W / 2) / (W / 2));
  /** The slope of the still water, in degrees. */
  const slope = () => (Math.atan(((angle / 40) * SWING) / (W / 2)) * 180) / Math.PI;
  /** The surface at x, with its waves. @param {number} x */
  const surfaceAt = (x) =>
    level(x) + moving() * (4 * Math.sin(x / 28 + time * 2.2) + 2.5 * Math.sin(x / 13 - time * 3.1));
  /** @param {Fish} f */
  const fishY = (f) =>
    Math.min(H - 10, level(f.x) + f.depth + moving() * 4 * Math.sin(time * 1.5 + f.phase));
  /** @param {number} value @param {number} low @param {number} high */
  const clamp = (value, low, high) => Math.min(Math.max(value, low), high);

  /**
   * The demo's pup: its body, its flippers and its head, in three colours.
   * @param {string} body @param {string} head @param {string} ink
   */
  const seal = (body, head, ink) =>
    `<ellipse cx="0" cy="50" rx="24" ry="40" fill="${body}"/>` +
    `<ellipse cx="-20" cy="34" rx="9" ry="17" fill="${body}" transform="rotate(-30 -20 34)"/>` +
    `<ellipse cx="20" cy="34" rx="9" ry="17" fill="${body}" transform="rotate(30 20 34)"/>` +
    `<g class="pond-head"><circle r="28" fill="${head}"/>` +
    `<circle cx="-11" cy="-6" r="3.5" fill="${ink}"/><circle cx="11" cy="-6" r="3.5" fill="${ink}"/>` +
    `<path d="M0 12 c-3 -5 -8 -3 -7 2 c1 3 4 5 7 8 c3 -3 6 -5 7 -8 c1 -5 -4 -7 -7 -2 z" fill="${ink}"/>` +
    `<g stroke="${ink}" stroke-width="1.2"><line x1="-7" y1="12" x2="-30" y2="7"/>` +
    `<line x1="-7" y1="16" x2="-30" y2="18"/><line x1="7" y1="12" x2="30" y2="7"/>` +
    `<line x1="7" y1="16" x2="30" y2="18"/></g></g>`;

  const paint = () => {
    water.setAttribute("fill", colour("water"));
    surface.setAttribute("stroke", colour("line"));
    pupAir.innerHTML = seal(colour("airBody"), colour("airHead"), colour("airInk"));
    pupWater.innerHTML = seal(colour("waterBody"), colour("waterHead"), colour("waterInk"));
    heads = [...svg.querySelectorAll(".pond-head")];
  };

  // A colour picker gives #rrggbb and nothing else, so it goes into the drawing as it is.
  for (const input of panel.querySelectorAll("input[type=color]")) {
    if (!(input instanceof HTMLInputElement) || input.dataset.colour === undefined) continue;
    const name = input.dataset.colour;
    palette[name] = input.value;
    input.addEventListener("input", () => {
      palette[name] = input.value;
      paint();
    });
  }

  /** As many fish as the width holds, spread along it. */
  const stock = () => {
    const count = clamp(Math.round(W / 160), 3, 8);
    fish = fish.slice(0, count);
    for (let i = fish.length; i < count; i++) {
      fish.push({
        x: ((i + 0.5) * W) / count,
        depth: 25 + ((i * 37) % 70),
        dir: i % 2 === 0 ? 1 : -1,
        phase: i * 2,
        alive: true,
        back: 0,
      });
    }
  };

  /** The pond's units to the window's shape, whenever the window changes. */
  const fit = () => {
    const box = svg.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    W = Math.max(H, Math.round((H * box.width) / box.height));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    stock();
    pup.x = clamp(pup.x, 20, W - 20);
  };

  /** @param {number} n @param {number} x @param {number} y */
  const puff = (n, x, y) => {
    for (let i = 0; i < n; i++) {
      bubbles.push({
        x: x + (Math.random() * 20 - 10),
        y,
        r: 1 + Math.random() * 2,
        v: 0.6 + Math.random() * 0.6,
      });
    }
  };

  // Only the water takes a tap (global.css); a tap anywhere else is the page's.
  svg.addEventListener("pointerup", (event) => {
    const box = svg.getBoundingClientRect();
    const x = ((event.clientX - box.left) * W) / box.width;
    const y = ((event.clientY - box.top) * H) / box.height;
    const hit = fish.find((f) => f.alive && Math.hypot(f.x - x, fishY(f) - y) < 20);
    if (hit) {
      prey = hit;
      goal = null;
    } else {
      goal = { x: clamp(x, 20, W - 20), y: Math.max(y, surfaceAt(x) + 16) };
      prey = null;
    }
  });

  const showTilt = () => {
    sliderOut.textContent = `${Math.round(target)}°`;
  };
  slider.addEventListener("input", () => {
    target = Number(slider.value);
    showTilt();
  });

  startButton.addEventListener("click", () => {
    playing = true;
    left = 30;
    score = 0;
    goal = null;
    prey = null;
    for (const f of fish) f.alive = true;
    status.textContent = word("running");
    startButton.textContent = word("restart");
  });

  const listen = () => {
    addEventListener("deviceorientation", (event) => {
      if (event.gamma === null) return;
      target = clamp(event.gamma, -40, 40);
      slider.value = String(Math.round(target));
      showTilt();
    });
    status.textContent = word("tiltHint");
    phoneButton.textContent = word("phoneOn");
  };
  phoneButton.addEventListener("click", () => {
    if (typeof DeviceOrientationEvent === "undefined") {
      status.textContent = word("noTilt");
      return;
    }
    // Safari asks the person first, and only from a tap; other browsers do not ask.
    const ask = /** @type {{ requestPermission?: () => Promise<string> }} */ (
      /** @type {unknown} */ (DeviceOrientationEvent)
    ).requestPermission;
    if (typeof ask !== "function") {
      listen();
      return;
    }
    ask
      .call(DeviceOrientationEvent)
      .then((state) => {
        if (state === "granted") listen();
        else status.textContent = word("tiltRefused");
      })
      .catch(() => {
        status.textContent = word("tiltRefused");
      });
  });

  /** One step of the pond; `k` is the step in sixtieths of a second, as the demo counted. @param {number} dt @param {number} k */
  const step = (dt, k) => {
    time += dt;
    if (playing) {
      left -= dt;
      if (left <= 0) {
        left = 0;
        playing = false;
        status.textContent = word("over").replace("{score}", String(score));
        startButton.textContent = word("again");
      }
    }
    timerOut.textContent = String(Math.ceil(left));
    scoreOut.textContent = String(score);
    hud.hidden = !playing;
    hud.textContent = `${word("left")} ${Math.ceil(left)} · ${word("caught")} ${score}`;

    spin += (target - angle) * 0.012 * k;
    spin *= 0.86 ** k;
    angle += spin * k;

    let line = `M0 ${surfaceAt(0).toFixed(1)}`;
    for (let x = 8; x < W; x += 8) line += ` L${x} ${surfaceAt(x).toFixed(1)}`;
    line += ` L${W} ${surfaceAt(W).toFixed(1)}`;
    const shape = `${line} L${W} ${H} L0 ${H} Z`;
    water.setAttribute("d", shape);
    clip.setAttribute("d", shape);
    surface.setAttribute("d", line);

    const speed = playing ? Math.min(2.6, 0.5 + score * 0.12) : 0.5 * moving();
    const along = Math.cos((slope() * Math.PI) / 180);
    for (const f of fish) {
      if (f.alive) {
        f.x += f.dir * speed * along * k;
        if (f.x > W + 20) f.dir = -1;
        if (f.x < -20) f.dir = 1;
      } else {
        f.back -= dt;
        if (f.back <= 0) {
          f.alive = true;
          f.x = f.dir > 0 ? -20 : W + 20;
          f.depth = 25 + Math.random() * 70;
        }
      }
    }

    // The pup swims to the fish it was sent after, or to where it was sent,
    // and otherwise comes up to breathe where it is.
    const to =
      prey?.alive === true
        ? { x: prey.x, y: fishY(prey) }
        : (goal ?? { x: pup.x, y: surfaceAt(pup.x) - 5 + moving() * 2 * Math.sin(time * 1.3) });
    pup.vx += (to.x - pup.x) * 0.012 * k;
    pup.vy += (to.y - pup.y) * 0.012 * k;
    pup.vx *= 0.92 ** k;
    pup.vy *= 0.92 ** k;
    const speedOfPup = Math.hypot(pup.vx, pup.vy);
    if (speedOfPup > 3.5) {
      pup.vx *= 3.5 / speedOfPup;
      pup.vy *= 3.5 / speedOfPup;
    }
    pup.x += pup.vx * k;
    pup.y += pup.vy * k;
    const distance = Math.hypot(to.x - pup.x, to.y - pup.y);
    if (prey?.alive === true && distance < 18) {
      prey.alive = false;
      prey.back = playing ? 1.2 : 3.5;
      pup.chomp = 1;
      puff(6, pup.x, pup.y);
      prey = null;
      if (playing) score++;
    }
    if (goal && distance < 5) goal = null;
    if (pup.y > surfaceAt(pup.x) + 25 && Math.random() < 0.04 * k) puff(1, pup.x, pup.y);
    const want = speedOfPup > 0.6 ? (Math.atan2(pup.vx, -pup.vy) * 180) / Math.PI : slope();
    pup.rot += (((want - pup.rot + 540) % 360) - 180) * Math.min(1, 0.12 * k);
    pup.chomp *= 0.92 ** k;
    const place = `translate(${pup.x.toFixed(1)} ${pup.y.toFixed(1)}) rotate(${pup.rot.toFixed(1)}) scale(${PUP})`;
    pupAir.setAttribute("transform", place);
    pupWater.setAttribute("transform", place);
    const bite = `scale(${(1 + pup.chomp * 0.3).toFixed(3)})`;
    for (const head of heads) head.setAttribute("transform", bite);

    const tilt = slope().toFixed(1);
    fishLayer.innerHTML = fish
      .filter((f) => f.alive)
      .map(
        (f) =>
          `<g transform="translate(${f.x.toFixed(1)} ${fishY(f).toFixed(1)}) rotate(${tilt}) scale(${FISH * f.dir} ${FISH})">` +
          `<path d="M-14 0 q14 -10 28 0 q-14 10 -28 0 z" fill="${colour("fish")}"/>` +
          `<path d="M-14 0 l-10 -7 l0 14 z" fill="${colour("fishTail")}"/>` +
          `<circle cx="8" cy="-2" r="1.8" fill="#4a1b0c"/></g>`,
      )
      .join("");
    bubbles = bubbles.filter((b) => {
      b.y -= b.v * k;
      return b.y > surfaceAt(b.x);
    });
    bubbleLayer.innerHTML = bubbles
      .map(
        (b) =>
          `<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r.toFixed(1)}" fill="none" stroke="${colour("bubble")}" stroke-width="1"/>`,
      )
      .join("");
  };

  off.hidden = true;
  panel.hidden = false;
  root.hidden = false;
  paint();
  fit();
  new ResizeObserver(fit).observe(svg);

  let last = performance.now();
  /** @param {number} now */
  const frame = (now) => {
    // Time as it passed, so that a round lasts 30 seconds on any screen; a
    // tab that slept does not jump.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt, dt * 60);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

const ANCHOR_MS = new Date('2026-09-12T02:58:00-03:00').getTime(); // Healthy Enemies, shifted 2min earlier for sync
const SLOT_MS = 2 * 60 * 60 * 1000;
const ANCHOR_INDEX = 12; // Healthy Enemies is the last item below

let specified = null

const TRIALS = [
    { name: "Speedy Enemies", map: "Wrecked Battlefield", effect: "All enemies are Nimble.", color: "#ffd400" },
    { name: "Glass", map: "Stained Temple", effect: "Base health is set to 1.", color: "#4caf50" },
    { name: "Quarantine", map: "Dusty Bridges", effect: "Tower placement footprint increased by 10.", color: "#ff9800" },
    { name: "Fog", map: "Winter Abyss", effect: "Tower range reduced by 35%.", color: "#b0b0b0" },
    { name: "Limitation Makes Creativity", map: "Coral Deep", effect: "Tower placement limits decreased by 50%.", color: "#e6a23c" },
    { name: "Flying Enemies", map: "Sacred Mountains", effect: "All enemies become Flying after Wave 5.", color: "#8fc9ff" },
    { name: "Jailed Towers", map: "Night Station", effect: "A tower is jailed randomly every wave after Wave 5.", color: "#d8d8d8" },
    { name: "Exploding Enemies", map: "Wrecked Battlefield II", effect: "Enemies explode on death.", color: "#8a8a8a" },
    { name: "Inflation", map: "Cyber City", effect: "All prices increased by 50%.", color: "#ff7043" },
    { name: "Committed", map: "Retro Zone", effect: "Towers cannot be sold.", color: "#e53935" },
    { name: "Hidden Enemies", map: "Forgetten Docks", effect: "All enemies become Hidden after Wave 5.", color: "#bdbdbd" },
    { name: "Broke", map: "Medieval Times", effect: "Income reduced by 33%.", color: "#66bb6a" },
    { name: "Healthy Enemies", map: "Four Seasons", effect: "All enemies are Bloated.", color: "#ef5350" },
];

function slotAt(ms) {
    const elapsed = ms - ANCHOR_MS;
    const slots = Math.floor(elapsed / SLOT_MS);
    let idx = (ANCHOR_INDEX + (slots % 13) + 13) % 13;
    const slotStart = ANCHOR_MS + slots * SLOT_MS;
    return { idx, slotStart, slotEnd: slotStart + SLOT_MS };
}

// get timezone first
let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function fmtTime(ms) {
    return new Date(ms).toLocaleTimeString('en-GB', {
        timeZone: userTimeZone,
        hour: '2-digit',
        minute: '2-digit'
    });
}

function fmtClock(ms) {
    return new Date(ms).toLocaleTimeString('en-GB', {
        timeZone: userTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function fmtDur(msLeft) {
    const total = Math.max(0, Math.floor(msLeft / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return h + ":" + m + ":" + s;
}
function fmtEta(msUntil) {
    const totalMin = Math.round(msUntil / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return m + "m";
    return h + "h " + m + "m";
}

let listBuilt = false;

function buildListOnce() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    TRIALS.forEach((t, idx) => {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = 'row-' + idx;
        row.style.setProperty('--accent', t.color);
        row.innerHTML = `
      <div class="row-time" id="time-${idx}">--:--</div>
      <div class="row-body">
        <div class="row-name">${t.name}</div>
        <div class="row-map">${t.map} · ${t.effect}</div>
      </div>
      <div class="row-eta" id="eta-${idx}">—</div>
    `;
        list.appendChild(row);
    });
    listBuilt = true;
}

function updateList(now) {
    if (!listBuilt) buildListOnce();

    const cur = slotAt(now);
    const list = document.getElementById('list');

    // Build the order starting from the current trial
    for (let i = 0; i < TRIALS.length; i++) {
        const idx = (cur.idx + i) % TRIALS.length;
        const row = document.getElementById('row-' + idx);

        const slotStart = cur.slotStart + i * SLOT_MS;
        const isActive = i === 0;

        // Make so trials including tomorrow and AFTER tomorrow are hidden
        const dayTomorrow = new Date(now);
        dayTomorrow.setDate(dayTomorrow.getDate() + 1); // move 1 day
        dayTomorrow.setHours(0, 0, 0, 0);

        // hide tomorrow and after to avoid getting confused
        const isTomorrow =
            new Date(slotStart) >= dayTomorrow;

        // Move row into the correct position
        list.appendChild(row);

        row.classList.toggle('hidden-more', isTomorrow);
        row.classList.toggle('active', isActive);

        document.getElementById('time-' + idx).textContent =
            fmtTime(slotStart);

        document.getElementById('eta-' + idx).textContent =
            isActive ? 'now' : fmtEta(slotStart - now);
    }
}

function tick() {
    let target = Date.now();
    if (specified) { // if we have specified on other js
        target = specified
    }

    const dateObject = new Date(target); 
    const readableDateTime  = dateObject.toLocaleString();

    const cur = slotAt(target);
    const previousIdx = (cur.idx - 1 + TRIALS.length) % TRIALS.length;

    const t = TRIALS[cur.idx];
    document.querySelector('link[rel="icon"]').href = `media/Icons/${t.name}.webp`;

    const newColor = `color-mix(in srgb, ${t.color} 50%, black)`;

    const elapsedInSlot = target - cur.slotStart; // time passed since this slot began
    const sliderPercent = 100 - ((elapsedInSlot / SLOT_MS) * 100);

    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    document.documentElement.style.setProperty('--accent', newColor);
    document.querySelector('.now-card').style.setProperty('--accent', t.color);
    document.getElementById('calendar').textContent = readableDateTime
    document.getElementById('nowName').textContent = t.name;
    document.getElementById('nowMeta').innerHTML = `<b>${t.map}</b> — ${t.effect}`;
    document.getElementById('countdown').textContent = fmtDur(cur.slotEnd - target);
    document.getElementById('previousLabel').textContent = `Previous: ${TRIALS[previousIdx].name}`;

    document.getElementById('progressFill').style.width = sliderPercent + '%';
    updateList(target)
}

tick();
setInterval(tick, 100);
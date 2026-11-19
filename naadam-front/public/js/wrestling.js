import {WrestlingTrackingField} from './field.js';
import {DEFAULT_WRESTLING_PAIR, WRESTLING_BOUT_COUNT, WRESTLING_DURATION, wrestlingLineup, wrestlingPacket} from './wrestling-demo.js';

const STREAM_TIMEOUT = 3500;
const REPLAY_DELAY = 2500;
const PHASES = {
  approach: 'Ойртож байна',
  grapple: 'Барьц авсан',
  separate: 'Барьц салсан',
  finished: 'Демо дахин эхэлнэ',
};
const CROWD_EVENTS = new Map([['move', 'Мэх хийлээ'], ['win', 'Бөх давлаа']]);

export class WrestlingTracker {
  constructor(root, {describe, ranks, onPick, onCheer}) {
    this.root = root;
    this.describe = describe;
    this.ranks = ranks;
    this.onCheer = onCheer;
    this.pair = DEFAULT_WRESTLING_PAIR;
    this.lineup = wrestlingLineup(this.pair);
    this.selected = null;
    this.panel = root.querySelector('#wt-pair-panel');
    this.closeButton = root.querySelector('#wt-close');
    this.time = root.querySelector('#wt-time');
    this.progress = root.querySelector('#wt-progress');
    this.phase = root.querySelector('#wt-phase');
    this.replay = root.querySelector('#wt-replay');
    this.fullscreen = root.querySelector('#wt-fullscreen');
    this.rankLegend = root.querySelector('#wt-rank-legend');
    this.crowdMeter = root.querySelector('#wt-crowd-meter');
    this.crowdBars = this.crowdMeter.querySelector('.wt-crowd-bars');
    this.crowdValue = this.crowdMeter.querySelector('#wt-crowd-value');
    this.crowdEvent = this.crowdMeter.querySelector('#wt-crowd-event');
    this.chantAnnouncement = this.crowdMeter.querySelector('#wt-crowd-chant');
    this.wrestlers = [...root.querySelectorAll('[data-wrestler]')];
    const pick = async slot => {
      const id = this.lineup[this.selected][slot];
      if (!this.describe(id).hasProfile) return;
      if (document.fullscreenElement === this.root) await document.exitFullscreen();
      onPick(id);
    };
    this.field = new WrestlingTrackingField(root.querySelector('#wrestling-field'), WRESTLING_BOUT_COUNT,
      (index, marker) => this.selectBout(index, marker));
    this.wrestlers.forEach((button, index) => button.addEventListener('click', () => pick(index)));
    this.replay.addEventListener('click', () => this.play());
    this.closeButton.addEventListener('click', () => this.closePanel(true));
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || this.panel.hidden) return;
      event.preventDefault();
      this.closePanel(true);
    });
    this.setupFullscreen();
  }

  setupFullscreen() {
    this.fullscreen.hidden = !document.fullscreenEnabled;
    if (this.fullscreen.hidden) return;
    this.fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === this.root) await document.exitFullscreen();
        else await this.root.requestFullscreen();
      } catch (error) {
        console.warn('Could not toggle stadium fullscreen', error);
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const expanded = document.fullscreenElement === this.root;
      const label = expanded ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц';
      this.fullscreen.title = label;
      this.fullscreen.setAttribute('aria-label', label);
      this.fullscreen.querySelector('path').setAttribute('d', expanded
        ? 'M4 9h5V4m11 5h-5V4M4 15h5v5m11-5h-5v5'
        : 'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5');
    });
  }

  sync(pair = DEFAULT_WRESTLING_PAIR, active) {
    const changed = this.pair.join() !== pair.join();
    if (this.active === active && !changed) return;
    if (changed) {
      this.pair = pair;
      this.lineup = wrestlingLineup(pair);
      this.packet = null;
    }
    if (changed || !active) this.closePanel();
    this.active = active;
    if (active) this.play();
    else {
      this.stop();
      this.renderCrowd(null);
    }
  }

  updateNames() {
    const bouts = this.lineup.map(pair => pair.map(this.describe));
    this.field.setWrestlers(bouts);
    if (this.selected !== null) this.updateSelectedNames();
  }

  updateRankLegend() {
    this.rankLegend.replaceChildren(...this.ranks().map(({label, color, symbol}) => {
      const item = document.createElement('li');
      const mark = document.createElement('span');
      mark.className = 'wt-rank-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = symbol;
      item.style.setProperty('--wt-rank', color);
      item.append(mark, label);
      return item;
    }));
  }

  updateSelectedNames() {
    this.wrestlers.forEach((button, i) => {
      const id = this.lineup[this.selected][i];
      const {name, title, rank, hasProfile} = this.describe(id);
      button.disabled = !hasProfile;
      button.style.setProperty('--wt-rank', rank.color);
      button.querySelector('[data-rank-mark]').textContent = rank.symbol;
      button.querySelector('[data-name]').textContent = name;
      button.querySelector('[data-rank-title]').textContent = title;
    });
  }

  selectBout(index, marker) {
    this.selected = index;
    this.trigger = marker;
    this.field.select(index);
    this.updateSelectedNames();
    this.renderSelected();
    this.panel.hidden = false;
    this.closeButton.focus({preventScroll: true});
  }

  closePanel(restoreFocus = false) {
    if (this.panel.hidden) return;
    this.panel.hidden = true;
    this.selected = null;
    this.field.select(null);
    if (restoreFocus) this.trigger?.focus({preventScroll: true});
    this.trigger = null;
  }

  stop() {
    this.stream?.close();
    this.stream = null;
    clearTimeout(this.streamTimer);
    clearInterval(this.timer);
    clearTimeout(this.replayTimer);
  }

  finish() {
    this.stop();
    this.replayTimer = setTimeout(() => this.play(), REPLAY_DELAY);
  }

  setPhase(phase) {
    if (phase === this.currentPhase) return;
    this.currentPhase = phase;
    this.panel.dataset.phase = phase;
    this.phase.textContent = PHASES[phase];
  }

  setTime(second) {
    const mm = String(Math.floor(second / 60)).padStart(2, '0');
    const ss = String(second % 60).padStart(2, '0');
    this.time.textContent = `${mm}:${ss}`;
    this.time.dateTime = `PT${second}S`;
    this.progress.value = second;
  }

  render(packet) {
    const {second, bouts, crowd} = packet;
    const animate = this.second >= 0 && second > this.second;
    this.packet = packet;
    this.second = second;
    this.field.update(bouts, animate);
    this.renderCrowd(crowd);
    this.renderSelected();
  }

  renderCrowd(crowd) {
    const value = crowd?.level;
    const level = Number.isInteger(value) && value >= 1 && value <= 5 ? value : 1;
    if (level !== this.crowdLevel) {
      const rising = level >= 3 && level > (this.crowdLevel ?? level);
      this.crowdLevel = level;
      this.crowdMeter.dataset.level = level;
      this.crowdBars.setAttribute('aria-valuenow', level);
      [...this.crowdBars.children].forEach((bar, i) => bar.classList.toggle('on', i < level));
      this.crowdValue.textContent = `${level} / 5`;
      this.field.setCrowdLevel(level);
      if (rising) this.onCheer?.(level);
    }

    const label = CROWD_EVENTS.get(crowd?.event) ?? '';
    if (label !== this.crowdLabel) {
      this.crowdLabel = label;
      this.crowdEvent.textContent = label;
      this.crowdEvent.hidden = !label;
    }

    const chant = level === 5 && crowd?.event === 'win' && typeof crowd.chant === 'string' ? crowd.chant : '';
    if (chant !== this.chantAnnouncement.textContent) {
      this.chantAnnouncement.textContent = chant;
      this.field.setCrowdChant(chant);
    }
  }

  renderSelected() {
    const bout = this.packet?.bouts[this.selected];
    if (!bout) return;
    const {phase, wrestlers} = bout;
    this.setTime(this.packet.second);
    this.setPhase(phase);
    wrestlers.forEach(({x, y}, i) => {
      this.wrestlers[i].querySelector('[data-position]').textContent = `X ${x.toFixed(1)}% · Y ${y.toFixed(1)}%`;
    });
  }

  play() {
    this.stop();
    this.updateNames();
    this.second = -1;
    this.render(wrestlingPacket(this.lineup, 0));
    if (!location.protocol.startsWith('http') || !('EventSource' in window)) {
      this.playLocally();
      return;
    }

    const [red, blue] = this.pair;
    const stream = this.stream = new EventSource(`./api/wrestling/events?red=${red}&blue=${blue}`);
    const fallback = () => {
      if (this.stream !== stream) return;
      this.stop();
      this.playLocally();
    };
    const expectFrame = () => {
      clearTimeout(this.streamTimer);
      this.streamTimer = setTimeout(fallback, STREAM_TIMEOUT);
    };
    let latest = -1;
    stream.onmessage = event => {
      if (this.stream !== stream) return;
      let packet;
      try { packet = JSON.parse(event.data); } catch { fallback(); return; }
      if (!this.isNextPacket(packet, latest)) return;
      latest = packet.second;
      this.render(packet);
      if (latest === WRESTLING_DURATION) this.finish();
      else expectFrame();
    };
    stream.onerror = fallback;
    expectFrame();
  }

  isNextPacket(packet, latest) {
    return packet?.type === 'wrestling'
      && Number.isInteger(packet.second) && packet.second > latest && packet.second <= WRESTLING_DURATION
      && Array.isArray(packet.bouts) && packet.bouts.length === WRESTLING_BOUT_COUNT
      && packet.bouts.every((bout, i) => typeof PHASES[bout?.phase] === 'string'
        && Array.isArray(bout.wrestlers) && bout.wrestlers.length === 2
        && bout.wrestlers.every((wrestler, side) => wrestler?.id === this.lineup[i][side]
          && [wrestler.x, wrestler.y].every(value => Number.isFinite(value) && value >= 0 && value <= 100)));
  }

  playLocally() {
    this.timer = setInterval(() => {
      this.render(wrestlingPacket(this.lineup, this.second + 1));
      if (this.second === WRESTLING_DURATION) this.finish();
    }, 1000);
  }
}

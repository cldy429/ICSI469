import {loadFeaturedWrestlers} from './wrestlers.js';

const status = document.createElement('div');
status.className = 'app-data-status';
status.setAttribute('role', 'status');
document.body.append(status);

async function start() {
  status.textContent = 'Бөхчүүдийн мэдээллийг татаж байна…';
  try {
    await loadFeaturedWrestlers();
    await import('./app.js');
    await import('./live.js');
    status.remove();
  } catch (error) {
    console.warn('Could not start Naadam', error);
    status.textContent = 'Бөхчүүдийн мэдээллийг татаж чадсангүй. ';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Дахин оролдох';
    retry.onclick = () => location.reload();
    status.append(retry);
  }
}
start();

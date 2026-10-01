// Module loading failures must not leave an empty app with no way to recover.
// No automatic reload: an explicit retry starts a new in-memory fixture session.
const status = document.querySelector('#preview-startup-status');
try {
  await import('./app.mjs?v=p05-micro-r11');
} catch (error) {
  console.error('Không tải được prototype:', error);
  if (status) {
    status.hidden = false;
    status.querySelector('button').addEventListener('click', () => location.reload());
  }
}

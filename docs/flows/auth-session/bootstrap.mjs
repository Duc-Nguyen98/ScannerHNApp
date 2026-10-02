// Module loading failures must not leave an empty app with no way to recover.
// No automatic reload: an explicit retry starts a new in-memory fixture session.
const status = document.querySelector('#preview-startup-status');
// Reload is wired in HTML so recovery also works before this module arrives.
function showStartup(message, failed = false) {
  if (!status) return;
  status.querySelector('p').textContent = message;
  status.setAttribute('role', failed ? 'alert' : 'status');
  status.hidden = false;
}
// A pending import is not a rejected import. Provide feedback for both, without
// restarting a partially loaded fixture session or claiming the network is down.
const loading = setTimeout(() => showStartup('Đang mở giao diện Hoa Nam Scanner… Vui lòng chờ.'), 1200);
const slow = setTimeout(() => showStartup('Giao diện đang tải lâu hơn dự kiến. Bạn có thể chờ hoặc tải lại preview; tải lại sẽ đặt lại dữ liệu thử trong trang.'), 8000);
try {
  await import('./app.mjs?v=motion-M05-r01');
  if (status) status.hidden = true;
} catch (error) {
  console.error('Không tải được prototype:', error);
  showStartup('Chưa tải được giao diện prototype. Kiểm tra máy chủ preview rồi tải lại trang; dữ liệu thử sẽ được đặt lại.', true);
} finally {
  clearTimeout(loading);
  clearTimeout(slow);
}

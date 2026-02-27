(function () {
  document.querySelectorAll('.brique-progress[data-baseurl]').forEach(function (el) {
    var baseurl = el.getAttribute('data-baseurl');
    var steps = parseInt(el.getAttribute('data-steps'), 10);
    if (!steps) return;

    var raw = localStorage.getItem('brique-progress-' + baseurl);
    if (!raw) return;

    try {
      var data = JSON.parse(raw);
      var visited = Array.isArray(data.visited) ? data.visited.length : 0;
      if (visited === 0) return;

      var pct = Math.min(Math.round((visited / steps) * 100), 100);
      el.querySelector('.brique-progress-fill').style.width = pct + '%';
      el.querySelector('.brique-progress-text').textContent = visited + '/' + steps + ' étapes';
      el.removeAttribute('hidden');
      el.closest('.brique-card').setAttribute('data-in-progress', 'true');
    } catch (e) {
      // invalid JSON, keep bar hidden
    }
  });
})();

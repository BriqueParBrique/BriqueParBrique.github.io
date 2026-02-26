(function () {
  var searchInput = document.getElementById('search');
  var levelButtons = document.querySelectorAll('.level-btn');
  var cards = document.querySelectorAll('.brique-card');
  var countEl = document.getElementById('count');
  var noResults = document.querySelector('.no-results');
  var activeLevel = 'all';

  function fuzzyMatch(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();
    var ti = 0;
    for (var qi = 0; qi < query.length; qi++) {
      var found = false;
      while (ti < text.length) {
        if (text[ti] === query[qi]) {
          ti++;
          found = true;
          break;
        }
        ti++;
      }
      if (!found) return false;
    }
    return true;
  }

  function applyFilters() {
    var query = searchInput.value.trim();
    var visible = 0;

    cards.forEach(function (card) {
      var name = card.getAttribute('data-name') || '';
      var level = card.getAttribute('data-level') || '';

      var matchesLevel = activeLevel === 'all' || level === activeLevel;
      var matchesSearch = query === '' || fuzzyMatch(name, query);

      if (matchesLevel && matchesSearch) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    countEl.textContent = visible;
    if (visible === 0) {
      noResults.classList.add('visible');
    } else {
      noResults.classList.remove('visible');
    }
  }

  searchInput.addEventListener('input', applyFilters);

  levelButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      levelButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeLevel = btn.getAttribute('data-level');
      applyFilters();
    });
  });
})();

(function () {
  var searchInput = document.getElementById('search');
  var levelButtons = document.querySelectorAll('[data-level]');
  var progressButtons = document.querySelectorAll('[data-progress]');
  var cards = document.querySelectorAll('.brique-card');
  var countEl = document.getElementById('count');
  var noResults = document.querySelector('.no-results');
  var activeLevel = 'all';
  var activeProgress = 'all';

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

  var rickrollLines = [
    'Never gonna give you up',
    'Never gonna let you down',
    'Never gonna run around and desert you',
    'Never gonna make you cry',
    'Never gonna say goodbye',
    'Never gonna tell a lie and hurt you'
  ];
  var rickrollColors = ['orange', 'teal', 'blue'];
  var grid = document.querySelector('.briques-grid');
  var rickrollCards = [];

  function clearRickroll() {
    rickrollCards.forEach(function (el) { el.remove(); });
    rickrollCards = [];
  }

  function showRickroll() {
    clearRickroll();
    rickrollLines.forEach(function (line, i) {
      var card = document.createElement('div');
      card.className = 'brique-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', line);
      var color = rickrollColors[i % rickrollColors.length];
      var level = (i % 3) + 1;
      card.innerHTML =
        '<div class="brique-stack" aria-hidden="true">' +
          '<div class="brique-shape level-1 brique-' + color + (level >= 1 ? ' active' : '') + '"></div>' +
          '<div class="brique-shape level-2 brique-' + color + (level >= 2 ? ' active' : '') + '"></div>' +
          '<div class="brique-shape level-3 brique-' + color + (level >= 3 ? ' active' : '') + '"></div>' +
        '</div>' +
        '<span class="brique-level-label">Niveau ' + level + '</span>' +
        '<span class="brique-name">' + line + '</span>' +
        '<span class="brique-status">Rick Astley</span>';
      grid.insertBefore(card, grid.querySelector('.no-results'));
      rickrollCards.push(card);
    });
  }

  function applyFilters() {
    var query = searchInput.value.trim();
    var visible = 0;
    var q = query.toLowerCase();
    var isRickroll = q === 'konami' || q === 'never' || q === 'rick';

    if (isRickroll) {
      showRickroll();
      cards.forEach(function (card) { card.classList.add('hidden'); });
      countEl.textContent = rickrollLines.length;
      noResults.classList.remove('visible');
      return;
    }

    clearRickroll();

    cards.forEach(function (card) {
      var name = card.getAttribute('data-name') || '';
      var level = card.getAttribute('data-level') || '';

      var matchesLevel = activeLevel === 'all' || level === activeLevel;
      var matchesSearch = query === '' || fuzzyMatch(name, query);
      var matchesProgress = activeProgress === 'all' || card.hasAttribute('data-in-progress');

      if (matchesLevel && matchesSearch && matchesProgress) {
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

  progressButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      progressButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeProgress = btn.getAttribute('data-progress');
      applyFilters();
    });
  });
})();

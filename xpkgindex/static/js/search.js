(function () {
    "use strict";

    var searchInput = document.getElementById("search-input");
    var navSearchInput = document.getElementById("nav-search-input");
    var grid = document.getElementById("package-grid");
    var noResults = document.getElementById("no-results");
    var filterBtns = document.querySelectorAll(".filter-btn");
    var cards = grid ? grid.querySelectorAll(".package-card") : [];
    var activeCategory = "all";
    var debounceTimer = null;

    function filterCards() {
        var query = (searchInput ? searchInput.value : "").toLowerCase().trim();
        var visibleCount = 0;

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var name = card.getAttribute("data-name") || "";
            var desc = card.getAttribute("data-description") || "";
            var keywords = card.getAttribute("data-keywords") || "";
            var categories = card.getAttribute("data-categories") || "";

            var matchesSearch = !query ||
                name.indexOf(query) !== -1 ||
                desc.indexOf(query) !== -1 ||
                keywords.indexOf(query) !== -1;

            var matchesCategory = activeCategory === "all" ||
                categories.split(" ").indexOf(activeCategory) !== -1;

            if (matchesSearch && matchesCategory) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        }

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? "" : "none";
        }
    }

    function onSearchInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filterCards, 200);
    }

    // Sync both search inputs
    function syncInputs(source, target) {
        if (target) {
            target.value = source.value;
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            syncInputs(searchInput, navSearchInput);
            onSearchInput();
        });
    }

    if (navSearchInput) {
        navSearchInput.addEventListener("input", function () {
            syncInputs(navSearchInput, searchInput);
            onSearchInput();
        });
    }

    // Category filter buttons
    for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].addEventListener("click", function () {
            for (var j = 0; j < filterBtns.length; j++) {
                filterBtns[j].classList.remove("active");
            }
            this.classList.add("active");
            activeCategory = this.getAttribute("data-category");
            filterCards();
        });
    }
})();

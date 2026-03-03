(function () {
    "use strict";

    var searchInput = document.getElementById("search-input");
    var navSearchInput = document.getElementById("nav-search-input");
    var grid = document.getElementById("package-grid");
    var noResults = document.getElementById("no-results");
    var filterBtns = document.querySelectorAll(".filter-btn");
    var platformBtns = document.querySelectorAll(".platform-btn");
    var cards = grid ? grid.querySelectorAll(".package-card") : [];
    var activeCategory = "all";
    var activePlatform = "all";
    var debounceTimer = null;
    var isHomePage = !!grid;

    // --- Install tab switching ---
    var installTabs = document.querySelectorAll(".install-tab");
    var installCmdUnix = document.getElementById("install-cmd-unix");
    var installCmdWindows = document.getElementById("install-cmd-windows");
    var copyBtn = document.querySelector(".install-section .btn-copy");

    for (var t = 0; t < installTabs.length; t++) {
        installTabs[t].addEventListener("click", function () {
            for (var j = 0; j < installTabs.length; j++) {
                installTabs[j].classList.remove("active");
            }
            this.classList.add("active");
            var tab = this.getAttribute("data-install-tab");
            if (installCmdUnix && installCmdWindows && copyBtn) {
                if (tab === "windows") {
                    installCmdUnix.style.display = "none";
                    installCmdWindows.style.display = "";
                    copyBtn.setAttribute("data-target", "install-cmd-windows");
                } else {
                    installCmdUnix.style.display = "";
                    installCmdWindows.style.display = "none";
                    copyBtn.setAttribute("data-target", "install-cmd-unix");
                }
            }
        });
    }

    // --- Homepage card filtering ---
    function filterCards() {
        if (!isHomePage) return;
        var query = (searchInput ? searchInput.value : "").toLowerCase().trim();
        var visibleCount = 0;

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var name = card.getAttribute("data-name") || "";
            var desc = card.getAttribute("data-description") || "";
            var keywords = card.getAttribute("data-keywords") || "";
            var categories = card.getAttribute("data-categories") || "";
            var platforms = card.getAttribute("data-platforms") || "";

            var matchesSearch = !query ||
                name.indexOf(query) !== -1 ||
                desc.indexOf(query) !== -1 ||
                keywords.indexOf(query) !== -1;

            var matchesCategory = activeCategory === "all" ||
                categories.split(" ").indexOf(activeCategory) !== -1;

            var matchesPlatform = activePlatform === "all" ||
                platforms.split(" ").indexOf(activePlatform) !== -1;

            if (matchesSearch && matchesCategory && matchesPlatform) {
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
        debounceTimer = setTimeout(function () {
            filterCards();
            if (isHomePage) updateDropdown(navSearchInput);
        }, 200);
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
            if (!isHomePage) updateDropdown(navSearchInput);
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

    // Platform filter buttons
    for (var p = 0; p < platformBtns.length; p++) {
        platformBtns[p].addEventListener("click", function () {
            for (var j = 0; j < platformBtns.length; j++) {
                platformBtns[j].classList.remove("active");
            }
            this.classList.add("active");
            activePlatform = this.getAttribute("data-platform");
            filterCards();
        });
    }

    // --- Global dropdown search ---
    var dropdown = document.getElementById("search-dropdown");
    var packagesData = null;
    var loadingPackages = false;

    function loadPackages(callback) {
        if (packagesData) { callback(packagesData); return; }
        if (loadingPackages) return;
        loadingPackages = true;

        // Determine base path for packages.json
        var base = ".";
        var scripts = document.getElementsByTagName("script");
        for (var s = 0; s < scripts.length; s++) {
            var src = scripts[s].src || "";
            if (src.indexOf("search.js") !== -1) {
                // Extract base from script src path
                var idx = src.indexOf("/static/js/search.js");
                if (idx !== -1) {
                    base = src.substring(0, idx);
                }
                break;
            }
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", base + "/packages.json", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                loadingPackages = false;
                if (xhr.status === 200) {
                    try {
                        packagesData = JSON.parse(xhr.responseText);
                        callback(packagesData);
                    } catch (e) {
                        packagesData = [];
                    }
                }
            }
        };
        xhr.send();
    }

    function platformIcons(platforms) {
        var html = "";
        if (!platforms) return html;
        for (var i = 0; i < platforms.length; i++) {
            var p = platforms[i];
            if (p === "linux") html += '<svg class="platform-icon" width="12" height="12" viewBox="0 0 448 512" fill="currentColor"><path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.6-2.6-3-3.7-1.5-.8-3.1-1.5-4.7-1.5-2.4 0-4.6 1.9-4.6 4.3 0 2 2.4 3.4 4.6 2.7.3-.1 1-.8 1.8-2z"/></svg>';
            if (p === "windows") html += '<svg class="platform-icon" width="12" height="12" viewBox="0 0 448 512" fill="currentColor"><path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"/></svg>';
            if (p === "macosx") html += '<svg class="platform-icon" width="12" height="12" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
        }
        return html;
    }

    function updateDropdown(inputEl) {
        if (!dropdown || !inputEl) return;
        var query = inputEl.value.toLowerCase().trim();

        if (!query) {
            dropdown.style.display = "none";
            dropdown.innerHTML = "";
            return;
        }

        loadPackages(function (pkgs) {
            var results = [];
            for (var i = 0; i < pkgs.length && results.length < 10; i++) {
                var pkg = pkgs[i];
                var name = (pkg.name || "").toLowerCase();
                var desc = (pkg.description || "").toLowerCase();
                var kw = (pkg.keywords || []).join(" ").toLowerCase();
                if (name.indexOf(query) !== -1 || desc.indexOf(query) !== -1 || kw.indexOf(query) !== -1) {
                    results.push(pkg);
                }
            }

            if (results.length === 0) {
                dropdown.style.display = "none";
                dropdown.innerHTML = "";
                return;
            }

            // Determine base URL for links
            var base = ".";
            var link = document.querySelector('.nav-logo');
            if (link) {
                var href = link.getAttribute('href') || '.';
                base = href.replace('/index.html', '');
            }

            var html = "";
            for (var r = 0; r < results.length; r++) {
                var pkg = results[r];
                var safeName = pkg.name.replace(/\//g, "_").replace(/\\/g, "_").replace(/ /g, "-").toLowerCase();
                html += '<a class="search-result" href="' + base + '/packages/' + safeName + '.html">';
                html += '<span class="search-result-name">' + escapeHtml(pkg.name) + '</span>';
                html += '<span class="search-result-icons">' + platformIcons(pkg.platforms) + '</span>';
                if (pkg.description) {
                    var shortDesc = pkg.description.length > 60 ? pkg.description.substring(0, 60) + "..." : pkg.description;
                    html += '<span class="search-result-desc">' + escapeHtml(shortDesc) + '</span>';
                }
                html += '</a>';
            }
            dropdown.innerHTML = html;
            dropdown.style.display = "block";
        });
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Show dropdown on nav search focus (non-home pages)
    if (navSearchInput) {
        navSearchInput.addEventListener("focus", function () {
            if (navSearchInput.value.trim()) {
                updateDropdown(navSearchInput);
            }
        });
    }

    // Close dropdown on click outside or Escape
    document.addEventListener("click", function (e) {
        if (dropdown && !dropdown.contains(e.target) && e.target !== navSearchInput) {
            dropdown.style.display = "none";
        }
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && dropdown) {
            dropdown.style.display = "none";
        }
    });
})();

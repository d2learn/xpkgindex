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
    var copyBtn = document.querySelector(".install-cmd-box .btn-copy");

    for (var t = 0; t < installTabs.length; t++) {
        installTabs[t].addEventListener("click", function () {
            for (var j = 0; j < installTabs.length; j++) {
                installTabs[j].classList.remove("active");
                installTabs[j].setAttribute("aria-selected", "false");
            }
            this.classList.add("active");
            this.setAttribute("aria-selected", "true");
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

    // Bootstrap Icons SVG paths for dropdown results
    var iconSvgs = {
        linux: '<svg class="platform-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8.996 4.497c.104-.076.1-.168.186-.158s.022.102-.098.207c-.12.104-.308.243-.46.323-.291.152-.631.336-.993.336s-.647-.167-.853-.33c-.102-.082-.186-.162-.248-.221-.11-.086-.096-.207-.052-.204.075.01.087.109.134.153.064.06.144.137.241.214.195.154.454.304.778.304s.702-.19.932-.32c.13-.073.297-.204.433-.304"/><path fill-rule="evenodd" d="M8.446.019c2.521.003 2.38 2.66 2.364 4.093-.01.939.509 1.574 1.04 2.244.474.56 1.095 1.38 1.45 2.32.29.765.402 1.613.115 2.465a.8.8 0 0 1 .254.152l.001.002c.207.175.271.447.329.698.058.252.112.488.224.615.344.382.494.667.48.922-.015.254-.203.43-.435.57-.465.28-1.164.491-1.586 1.002-.443.527-.99.83-1.505.871a1.25 1.25 0 0 1-1.256-.716v-.001a1 1 0 0 1-.078-.21c-.67.038-1.252-.165-1.718-.128-.687.038-1.116.204-1.506.206-.151.331-.445.547-.808.63-.5.114-1.126 0-1.743-.324-.577-.306-1.31-.278-1.85-.39-.27-.057-.51-.157-.626-.384-.116-.226-.095-.538.07-.988.051-.16.012-.398-.026-.648a2.5 2.5 0 0 1-.037-.369c0-.133.022-.265.087-.386v-.002c.14-.266.368-.377.577-.451s.397-.125.53-.258c.143-.15.27-.374.443-.56q.036-.037.073-.07c-.081-.538.007-1.105.192-1.662.393-1.18 1.223-2.314 1.811-3.014.502-.713.65-1.287.701-2.016.042-.997-.705-3.974 2.112-4.2q.168-.015.321-.013"/></svg>',
        windows: '<svg class="platform-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M6.555 1.375 0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4.026 6.378L16 16V8.395zM16 0 7.33 1.244v6.414H16z"/></svg>',
        macosx: '<svg class="platform-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/></svg>'
    };

    function platformIcons(platforms) {
        var html = "";
        if (!platforms) return html;
        for (var i = 0; i < platforms.length; i++) {
            if (iconSvgs[platforms[i]]) html += iconSvgs[platforms[i]];
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
            var link = document.querySelector(".nav-logo");
            if (link) {
                var href = link.getAttribute("href") || ".";
                base = href.replace("/index.html", "");
            }

            var html = "";
            for (var r = 0; r < results.length; r++) {
                var pkg = results[r];
                var safeName = pkg.name.replace(/\//g, "_").replace(/\\/g, "_").replace(/ /g, "-").toLowerCase();
                html += '<a class="search-result" href="' + base + '/packages/' + safeName + '.html">';
                html += '<span class="search-result-name">' + escapeHtml(pkg.name) + '</span>';
                html += '<span class="search-result-icons">' + platformIcons(pkg.platforms) + '</span>';
                if (pkg.description) {
                    var shortDesc = pkg.description.length > 60 ? pkg.description.substring(0, 60) + "\u2026" : pkg.description;
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

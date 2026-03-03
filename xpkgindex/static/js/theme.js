(function () {
    "use strict";

    var STORAGE_KEY = "xpkgindex-theme";
    var html = document.documentElement;
    var toggleBtn = document.getElementById("theme-toggle");

    // Apply stored preference or default to dark
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light") {
        html.setAttribute("data-theme", "light");
    } else if (stored === "dark") {
        html.setAttribute("data-theme", "dark");
    }
    // If no stored preference, respect the data-theme set in HTML (from config.style)

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            var current = html.getAttribute("data-theme");
            var next = current === "light" ? "dark" : "light";
            html.setAttribute("data-theme", next);
            localStorage.setItem(STORAGE_KEY, next);
        });
    }
})();

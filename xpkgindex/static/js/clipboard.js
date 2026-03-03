(function () {
    "use strict";

    var copyBtns = document.querySelectorAll(".btn-copy");

    for (var i = 0; i < copyBtns.length; i++) {
        copyBtns[i].addEventListener("click", function () {
            var btn = this;
            var targetId = btn.getAttribute("data-target");
            var target = document.getElementById(targetId);
            if (!target) return;

            var text = target.textContent || target.innerText;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    showFeedback(btn);
                });
            } else {
                // Fallback for older browsers
                var textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                showFeedback(btn);
            }
        });
    }

    function showFeedback(btn) {
        var original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(function () {
            btn.textContent = original;
        }, 2000);
    }
})();

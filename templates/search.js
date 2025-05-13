document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search");
  const dropdown = document.getElementById("package-list");

  if (!input || !dropdown) {
    console.warn("❗️search.js: 搜索输入框或结果容器未找到，可能当前页面不需要该功能");
    return;
  }

  const items = Array.from(dropdown.querySelectorAll(".package-item"));

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    let matchedCount = 0;
    items.forEach(item => {
      const text = item.dataset.search;
      const isMatch = text.includes(query);
      if (isMatch && matchedCount < 10) {
        item.style.display = "block";
        matchedCount++;
      } else {
        item.style.display = "none";
      }
    });

    dropdown.style.display = matchedCount > 0 ? "block" : "none";
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const visibleItems = Array.from(dropdown.querySelectorAll(".package-item"))
        .filter(item => item.offsetParent !== null);
      if (visibleItems.length > 0) {
        window.location.href = visibleItems[0].href;
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== input) {
      dropdown.style.display = "none";
    }
  });
});

function handleLogoClick(event) {
    event.preventDefault();
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && currentPage !== '') {
      window.location.href = '../index.html';
    }
}

function copyInstall(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    button.classList.add('copied');
    button.textContent = 'Copied!';

    setTimeout(() => {
      button.classList.remove('copied');
      button.textContent = 'Copy';
    }, 1500);
  });
}
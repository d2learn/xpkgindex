const translations = {
    en: {
        logo: "XIM Package Index",
        welcome: "Welcome to XIM Package Index...",
        language: "中", // Button text to switch to Chinese
        pkg_activity: "🔍 Package Activity",
        featured_pkg: "🔥 Featured Package",
        copy: "Copy",
    },
    zh: {
        logo: "XIM 包索引",
        welcome: "欢迎使用 XIM 包索引...",
        language: "En", // Button text to switch to English
        pkg_activity: "🔍 预览",
        featured_pkg: "🔥 随机推荐",
        copy: "复制",
    },
};

// 当前语言，默认从 localStorage 获取或使用英文
let currentLang = localStorage.getItem('lang') || 'zh';

// ⬇️ 渲染页面文本
function renderTexts() {
    if (document.getElementById('welcome-text') !== null) {
        document.getElementById('welcome-text').textContent = translations[currentLang].welcome;
    }
    if (document.getElementById('logo-text') !== null) {
        document.getElementById('logo-text').textContent = translations[currentLang].logo;
    }
    if (document.getElementById('pkg-activity') !== null) {
        document.getElementById('pkg-activity').textContent = translations[currentLang].pkg_activity;
    }
    if (document.getElementById('featured-pkg') !== null) {
        document.getElementById('featured-pkg').textContent = translations[currentLang].featured_pkg;
    }
    if (document.getElementById('copy-text') !== null) {
        document.getElementById('copy-text').textContent = translations[currentLang].copy;
    }
    document.getElementById('language-toggle').textContent = translations[currentLang].language;
}

// 🌐 切换语言
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    localStorage.setItem('lang', currentLang);
    renderTexts();
}

document.addEventListener("DOMContentLoaded", () => {

    console.log('Current language:', currentLang);

    // 页面加载时初始化
    renderTexts();
});
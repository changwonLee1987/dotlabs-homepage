document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle (placeholder)
    const mobileMenu = document.querySelector('.mobile-menu');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    
    if (mobileMenu && hamburger) {
        mobileMenu.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }

    /*
     * 메뉴별 화면 전환 (2026-11-05)
     * 예전엔 한 페이지를 위아래로 스크롤해 각 섹션으로 갔다. 지금은 메뉴를 누르면
     * 그 섹션 하나만 보이고 나머지는 숨긴다.
     *  - 주소의 #이름 이 곧 화면이다(#company 등). 링크 공유·뒤로가기가 그대로 된다.
     *  - #이 없거나 모르는 이름이면 첫 화면(#hero).
     *  - html 에 views-on 을 붙여야 CSS 가 섹션을 숨긴다. 스크립트가 안 돌면
     *    예전처럼 전부 보이는 한 페이지로 남는다.
     *  - pushState 를 쓰지 않고 location.hash 만 바꾼다. 정적 호스팅(GitHub Pages)
     *    에서는 경로를 바꾸면 새로고침 때 404 가 나기 때문이다.
     */
    const root = document.documentElement;
    const views = Array.from(document.querySelectorAll('main > section[id]'));
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const DEFAULT_VIEW = 'hero';

    // 고정 헤더 높이만큼 각 화면 위를 비워 둔다. 로고 크기가 화면 폭마다 달라
    // 숫자로 박지 않고 잰다. 스크롤 축소(.scrolled) 전 높이를 기준으로 한다.
    const setHeaderHeight = () => {
        if (!header.classList.contains('scrolled')) {
            root.style.setProperty('--header-h', header.offsetHeight + 'px');
        }
    };

    const showView = (id) => {
        const target = views.find(v => v.id === id) || views.find(v => v.id === DEFAULT_VIEW);
        views.forEach(v => {
            const on = v === target;
            v.classList.toggle('is-active', on);
            // 나타날 때마다 원래의 떠오르는 효과를 다시 준다
            v.classList.remove('visible');
            if (on) { void v.offsetWidth; v.classList.add('visible'); }
        });
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + target.id));
        // html 의 smooth 스크롤을 타지 않도록 즉시 맨 위로
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
    };

    const currentId = () => decodeURIComponent(location.hash.replace(/^#/, ''));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href').slice(1);
            if (!id) { e.preventDefault(); return; }
            // 이미 보고 있는 화면을 다시 누르면 hashchange 가 안 생기므로 직접 처리
            if (id === currentId() || (id === DEFAULT_VIEW && !currentId())) {
                e.preventDefault();
                showView(id);
            }
        });
    });

    window.addEventListener('hashchange', () => showView(currentId()));
    window.addEventListener('resize', setHeaderHeight);

    setHeaderHeight();
    root.classList.add('views-on');
    showView(currentId());
});

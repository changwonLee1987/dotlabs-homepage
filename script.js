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
    const footer = document.querySelector('.footer');
    const setHeaderHeight = () => {
        if (!header.classList.contains('scrolled')) {
            root.style.setProperty('--header-h', header.offsetHeight + 'px');
        }
        // 화면 높이와 푸터 높이: 각 화면 = (보이는 높이 - 푸터) 로 잡아 푸터까지 한 화면에 든다.
        // iPad·iPhone Safari 는 100vh 가 주소창 높이를 빼지 않아 innerHeight 를 쓴다.
        root.style.setProperty('--app-h', window.innerHeight + 'px');
        if (footer) root.style.setProperty('--footer-h', footer.offsetHeight + 'px');
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
        // 첫 화면에서만 헤더를 투명하게 둔다(배경 그림 위). 나머지 화면은 CSS 가 바탕을 채운다
        root.classList.toggle('at-hero', target.id === DEFAULT_VIEW);
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + target.id));
        // html 의 smooth 스크롤을 타지 않도록 즉시 맨 위로
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        fitView();
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
    };

    /*
     * 화면 맞춤: 내용이 헤더 아래 남은 높이보다 길면 그 화면의 .container 를 zoom 으로
     * 줄여 한 화면에 담는다. 0.7 배 아래로는 줄이지 않는다(글자가 너무 작아짐) —
     * 그보다 길면 그 화면만 아래로 스크롤된다. 휴대폰(폭 768px 이하)은 줄이지 않고
     * 세로 스크롤로 읽는다. zoom 은 Safari·Chrome·Firefox(126+) 모두 지원한다.
     */
    const MIN_ZOOM = 0.7;
    const fitView = () => {
        const v = views.find(x => x.classList.contains('is-active'));
        if (!v || !v.classList.contains('section-padding')) return;
        const box = v.querySelector(':scope > .container');
        if (!box) return;
        box.style.zoom = '';
        if (window.innerWidth <= 768) return;
        const cs = getComputedStyle(v);
        const footerH = footer ? footer.offsetHeight : 0;
        const avail = window.innerHeight - footerH - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const need = box.offsetHeight;
        if (need > avail) box.style.zoom = Math.max(MIN_ZOOM, avail / need).toFixed(3);
    };

    // Technology 안의 Gbus / procman 전환
    const techTabs = document.querySelectorAll('.tech-tab');
    techTabs.forEach(btn => btn.addEventListener('click', () => {
        const part = btn.dataset.part;
        techTabs.forEach(b => {
            const on = b === btn;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        document.querySelectorAll('.tech-part').forEach(el => el.classList.toggle('is-on', el.dataset.part === part));
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        fitView();
    }));

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
    window.addEventListener('resize', () => { setHeaderHeight(); fitView(); });
    // 웹폰트가 늦게 오면 글자 폭·높이가 바뀌므로 한 번 더 맞춘다
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitView);
    window.addEventListener('load', fitView);

    // views-on 을 먼저 붙여야 얇아진 푸터 높이를 잰다(순서를 바꾸면 예전 푸터 165px 로 잡힌다)
    root.classList.add('views-on');
    setHeaderHeight();
    showView(currentId());
});

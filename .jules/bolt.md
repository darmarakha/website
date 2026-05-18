## 2026-05-18 - Scroll Event Throttling and Layout Thrashing in `app.js`
**Learning:** Found a performance bottleneck in `app.js` where the scroll event listener was synchronously reading layout properties (`window.scrollY`, `s.offsetTop`) and querying the DOM (`document.querySelectorAll('.nav-link')`) on every scroll tick.
**Action:** Implemented a `requestAnimationFrame` throttle, cached the static `.nav-link` DOM collection, and cached `window.scrollY` inside the rAF callback to avoid layout thrashing and reduce main-thread blocking during scroll.

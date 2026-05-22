// Utility functions for Partikel Module
function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function shuffleArray(array) {
    let a = [...array], i = a.length, j;
    while (i) { j = Math.floor(Math.random() * i); i--; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

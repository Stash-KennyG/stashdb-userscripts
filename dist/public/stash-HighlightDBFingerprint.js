// ==UserScript==
// @name         Highlight Fingerprints
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights the div containing fingerprints
// @author       KennyG
// @match        http://mini01.shannabower.com:9999/scenes*
// @grant        none
// @run-at       document-end
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function () {
    'use strict';

    const COLOR_RULES = [
        {
            range: [0, 10],
            colors: [
                { threshold: 0.45, color: '#B71C1C' }, //Crimson
                { threshold: 0.60, color: '#FF6F00' }, //Orange800
                { threshold: 1.00, color: '#00796B' } //Pine Green
            ]
        },
        {
            range: [11, 50],
            colors: [
                { threshold: 0.30, color: '#B71C1C' }, //Crimson
                { threshold: 0.50, color: '#FF6F00' }, //Orange800
                { threshold: 0.75, color: '#BBBE64' }, //Citron
                { threshold: 1.00, color: '#00796B' } //Pine Green
            ]
        },
        {
            range: [51, Infinity],
            colors: [
                { threshold: 0.20, color: '#B71C1C' }, //Crimson
                { threshold: 0.40, color: '#FF6F00' }, //Orange800
                { threshold: 0.75, color: '#BBBE64' }, //Citron
                { threshold: 1.00, color: '#00796B' } //Pine Green
            ]
        }
    ];

    function getColor(total, percent) {
        for (let rule of COLOR_RULES) {
            if (total >= rule.range[0] && total <= rule.range[1]) {
                for (let i = 0; i < rule.colors.length; i++) {
                    if (percent <= rule.colors[i].threshold) {
                        return rule.colors[i].color;
                    }
                }
            }
        }
        return '';
    }

    function highlightMatches() {
        const matchDivs = document.querySelectorAll('div.font-weight-bold');

        matchDivs.forEach(div => {
            const text = div.textContent || '';
            const match = text.match(/(\d+)\s*\/\s*(\d+)\s*fingerprints/i);

            if (match) {
                const matched = parseInt(match[1], 10);
                const total = parseInt(match[2], 10);

                if (total > 0) {
                    const percent = matched / total;
                    const color = getColor(total, percent);
                    const percentText = ` (${Math.round(percent * 100)}%)`;

                    // Only append percentage if it hasn’t already been added
                    if (!text.includes(percentText)) {
                        div.textContent = text + percentText;
                    }

                    div.style.backgroundColor = color;
                    div.style.color = '#FFFFFF'; //Text White
                }
            }
        });
    }

    window.addEventListener('load', highlightMatches);
    new MutationObserver(highlightMatches).observe(document.body, { childList: true, subtree: true });
})();

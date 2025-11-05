// ==UserScript==
// @name         Toggle Stashed Scenes
// @namespace    http://tampermonkey.net/
// @version      1.13
// @description  Hide/show stashed scenes (✓ in <h6>) with stable count, pagination aware
// @match        https://stashdb.org/performers/*
// @match        https://stashdb.org/studios/*
// @grant        none
// @icon         https://raw.githubusercontent.com/stashapp/stash/develop/ui/v2.5/public/favicon.png
// ==/UserScript==

(function () {
    'use strict';

    let toggleButton = null;
    let stashedCount = 0;
    let updateQueued = false;

    // ---------- Utilities ----------
    function $(sel, root = document) { return root.querySelector(sel); }
    function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

    function getSceneCards() {
        // Keep original selector, but be tolerant if Stash changes markup
        // Try common bootstrap grid cards first, then any known scene card container
        const cards = $all('div.col-3');
        return cards.length ? cards : $all('.scene-card, .scenes .col, .results-grid .col');
    }

    function cardSignature() {
        const cards = getSceneCards();
        const first = cards[0]?.innerText?.slice(0, 80) || '';
        const last = cards[cards.length - 1]?.innerText?.slice(0, 80) || '';
        return `${cards.length}::${first}::${last}`;
    }

    function computeStashedCount() {
        return getSceneCards().reduce((acc, card) => {
            const chk = card.querySelector('h6 span.stashCheckerSymbol');
            return acc + ((chk && chk.textContent.includes('✓')) ? 1 : 0);
        }, 0);
    }

    function setButtonLabel() {
        if (!toggleButton) return;
        if (stashedCount === 0) {
            toggleButton.textContent = 'Not Stashed';
            toggleButton.disabled = true;
            toggleButton.classList.remove('btn-primary');
            toggleButton.classList.add('btn-secondary');
        } else {
            toggleButton.textContent = `Filter Stashed [${stashedCount}]`;
            toggleButton.disabled = false;
            toggleButton.classList.remove('btn-secondary');
            toggleButton.classList.add('btn-primary');
        }
    }

    function recalcAndUpdate() {
        stashedCount = computeStashedCount();
        setButtonLabel();
    }

    function queueUpdate() {
        if (updateQueued) return;
        updateQueued = true;
        requestAnimationFrame(() => {
            updateQueued = false;
            recalcAndUpdate();
        });
    }

    // Wait until the set of cards actually changes after a pagination action
    function waitForCardsChange(timeoutMs = 5000, intervalMs = 120) {
        return new Promise(resolve => {
            const startSig = cardSignature();
            const start = Date.now();
            const iv = setInterval(() => {
                const changed = cardSignature() !== startSig;
                const timedOut = (Date.now() - start) > timeoutMs;
                if (changed || timedOut) {
                    clearInterval(iv);
                    resolve(changed);
                }
            }, intervalMs);
        });
    }

    // ---------- Behavior ----------
    function toggleStashedScenes() {
        // Only hide/show. Do not change the count here.
        getSceneCards().forEach(card => {
            const chk = card.querySelector('h6 span.stashCheckerSymbol');
            if (chk && chk.textContent.includes('✓')) {
                card.style.display = (card.style.display === 'none') ? '' : 'none';
            }
        });
    }

    function insertToggleButton() {
        const filterRow = $('.d-flex.mt-2.align-items-start.flex-wrap');
        if (!filterRow || $('#toggleStashedBtn')) return;

        const sceneSort = filterRow.querySelector('.scene-sort');
        if (!sceneSort) {
            console.warn('Scene sort section not found.');
            return;
        }

        toggleButton = document.createElement('button');
        toggleButton.id = 'toggleStashedBtn';
        toggleButton.className = 'btn btn-primary ms-2 rounded';
        toggleButton.type = 'button';
        toggleButton.textContent = 'Filter Stashed [...]';
        toggleButton.addEventListener('click', toggleStashedScenes);

        sceneSort.appendChild(toggleButton);
    }

    function hookPagination() {
        // Clicks on page links
        document.addEventListener('click', async (e) => {
            const a = e.target.closest('a.page-link[data-page]');
            if (!a) return;
            // After the site handles the click and fetches new content, wait for cards to change
            // Use short staggered checks to cover animation/render timing
            setTimeout(() => queueUpdate(), 200);
            setTimeout(() => queueUpdate(), 600);
            // Also do a definitive recount when the card signature actually changes
            waitForCardsChange().then(changed => {
                if (changed) recalcAndUpdate();
            });
        });

        // Keyboard activation support (Enter/Space on role=button)
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const a = e.target.closest('a.page-link[data-page]');
            if (!a) return;
            setTimeout(() => queueUpdate(), 200);
            setTimeout(() => queueUpdate(), 600);
            waitForCardsChange().then(changed => {
                if (changed) recalcAndUpdate();
            });
        });
    }

    function observeForPageChanges() {
        // Catch large DOM swaps
        const obs = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) {
                    queueUpdate();
                    break;
                }
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    function hookFetch() {
        // Nudge recounts after async content loads
        const origFetch = window.fetch;
        window.fetch = function (...args) {
            return origFetch.apply(this, args).then(resp => {
                // After response resolves, schedule recounts
                setTimeout(queueUpdate, 200);
                setTimeout(queueUpdate, 700);
                return resp;
            });
        };
        // Also hook XHR for older code paths
        const OrigXHR = window.XMLHttpRequest;
        function PatchedXHR() {
            const xhr = new OrigXHR();
            xhr.addEventListener('loadend', () => {
                setTimeout(queueUpdate, 200);
                setTimeout(queueUpdate, 700);
            });
            return xhr;
        }
        window.XMLHttpRequest = PatchedXHR;
        PatchedXHR.prototype = OrigXHR.prototype;
    }

    function init() {
        insertToggleButton();
        recalcAndUpdate();
        hookPagination();
        observeForPageChanges();
        hookFetch();

        // Safety pass in case content lands late
        setTimeout(recalcAndUpdate, 1200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 600);
    }
})();

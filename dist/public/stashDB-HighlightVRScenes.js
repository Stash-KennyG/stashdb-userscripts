// ==UserScript==
// @name         StashDB Highlighting
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Highlights scene tag blocks in cyan if they include "Virtual Reality"
// @match        https://stashdb.org/scenes*
// @grant        none
// @run-at       document-end
// @icon        https://raw.githubusercontent.com/stashapp/stash/develop/ui/v2.5/public/favicon.png
// ==/UserScript==


(function () {
    'use strict';

    const COLORS = {
        divBackground: '#00bcd4',
        tagBackground: '#ff9100',
        tagText: '#000000',
        cardHeaderHighlight: '#004d00'
    };

    function applyVRStyles(sceneTagsDiv) {
        sceneTagsDiv.style.backgroundColor = COLORS.divBackground;
        const tagItems = sceneTagsDiv.querySelectorAll('.tag-item');
        tagItems.forEach(tag => {
            tag.style.backgroundColor = COLORS.tagBackground;
            const link = tag.querySelector('a');
            if (link) link.style.color = COLORS.tagText;
        });
    }

    function checkAndStyleVRTags() {
        const tagSections = document.querySelectorAll('.scene-tags');
        tagSections.forEach(section => {
            const tags = Array.from(section.querySelectorAll('.tag-item a'));
            const tagTexts = tags.map(tag => tag.textContent.trim().toLowerCase());

            const hasVR = tagTexts.includes('virtual reality');
            const hasSolo = tagTexts.some(t => t === 'solo female' || t === 'solo');

            if (hasVR && hasSolo) {
                section.style.backgroundColor = '#a3d400'; // Both VR + Solo Female
            } else if (hasSolo) {
                section.style.backgroundColor = '#a3d400'; // Solo Female only
            } else if (hasVR) {
                section.style.backgroundColor = COLORS.divBackground; // VR only
            } else {
                return; // Skip rest if no match
            }

            // Common tag styling
            const tagItems = section.querySelectorAll('.tag-item');
            tagItems.forEach(tag => {
                tag.style.backgroundColor = COLORS.tagBackground;
                const link = tag.querySelector('a');
                if (link) link.style.color = COLORS.tagText;
            });
        });
    }

    function highlightCardHeadersWithCheck() {
        const headers = document.querySelectorAll('.card-header');
        headers.forEach(header => {
            const checkSpan = header.querySelector('.stashCheckerSymbol[data-target="scene"][data-symbol="check"]');
            if (checkSpan) {
                header.style.backgroundColor = COLORS.cardHeaderHighlight;
            }
        });
    }

    function runAllHighlighting() {
        checkAndStyleVRTags();
        highlightCardHeadersWithCheck();
    }

    window.addEventListener('load', runAllHighlighting);
    setTimeout(runAllHighlighting, 1500);
})();

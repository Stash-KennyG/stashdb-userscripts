// ==UserScript==
// @name         Highlight VR Tags
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlights scene tag blocks in cyan if they include "Virtual Reality"
// @match        https://stashdb.org/scenes*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const COLORS = {
    divBackground: '#00bcd4',
    tagBackground: '#ff9100',
    tagText: '#000000'
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

  // Look for .scene-tags blocks and check their tags
  function checkAndStyleVRTags() {
    const tagSections = document.querySelectorAll('.scene-tags');
    tagSections.forEach(section => {
      const tags = Array.from(section.querySelectorAll('.tag-item a'));
      const hasVR = tags.some(tag => tag.textContent.trim().toLowerCase() === 'virtual reality');
      if (hasVR) applyVRStyles(section);
    });
  }

  // Run on page load and if the page updates dynamically
  window.addEventListener('load', checkAndStyleVRTags);
  setTimeout(checkAndStyleVRTags, 1500); // handle late rendering
})();

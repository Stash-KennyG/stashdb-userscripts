// ==UserScript==
// @name         Convert Measurements
// @namespace    https://github.com/Stash-KennyG
// @version      1.0
// @description  Allows the conversion of measurements
// @author       KennyG
// @match        http://localhost:9999/performers*
// @grant        none
// @run-at       document-end
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function () {

    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            throw new Error("The given element does not have a value setter");
        }

        const eventName = element instanceof HTMLSelectElement ? "change" : "input";
        element.dispatchEvent(new Event(eventName, { bubbles: true }));
    }


    'use strict';

    function cmToIn(cm) {
        return Math.round(parseFloat(cm) / 2.54);
    }
    function inchesToCm(inches) {
        return Math.round(parseFloat(inches) * 2.54);
    }
    function lbsToKg(lbs) {
    return Math.round(parseFloat(lbs) * 0.453592);
    }

    function parseAndConvert(value) {
        // Split on dash or assume single value
        let parts = value.split('-');
        return parts.map(part => {
            const match = part.match(/^(\d+)([A-Z]*)$/i); // digits + optional letters
            if (!match) return part;
            const [, num, cup] = match;
            const inches = cmToIn(num);
            return `${inches}${cup || ''}`;
        }).join('-');
    }
    function parseHeightToCm(value) {
        value = value.trim();

        // Case: 58" or just 58 (assume inches)
        const inchOnlyMatch = value.match(/^(\d+)(\"?)$/);
        if (inchOnlyMatch) {
            const totalInches = parseInt(inchOnlyMatch[1], 10);
            return inchesToCm(totalInches);
        }

        return null; // fallback
    }
    function injectWeightButton() {
        const input = document.querySelector('input#weight');
        if (!input || input.dataset.buttonAdded === 'true') return;

        const parent = input.closest('.col-xl-7.col-sm-9');
        if (!parent) return;

        // Wrap input and button in a new input group
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const append = document.createElement('div');
        append.className = 'input-group-append';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mr-2 btn btn-secondary';
        button.title = 'Convert lbs to kg';
        button.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="weight" class="svg-inline--fa fa-weight fa-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M416 64H96C78.3 64 64 78.3 64 96v352c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zM256 128a64 64 0 1 1 0 128 64 64 0 0 1 0-128z"/></svg>`;

        button.addEventListener('click', () => {
        const original = input.value.trim();
        if (!original) return;
        const converted = lbsToKg(original);
        setNativeValue(input, converted);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        append.appendChild(button);
        wrapper.appendChild(append);

        input.dataset.buttonAdded = 'true';
    }

    function injectMeasurementsButton() {
        const input = document.querySelector('input#measurements');
        if (!input || input.dataset.buttonAdded === 'true') return;

        const parent = input.closest('.col-xl-7.col-sm-9');
        if (!parent) return;

        // Wrap input and button in a new input group
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const append = document.createElement('div');
        append.className = 'input-group-append';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mr-2 btn btn-secondary';
        button.title = 'Convert Metric to U.S. Measurements';
        button.innerHTML = `
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ruler" class="svg-inline--fa fa-ruler fa-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 128v256c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32h448c17.7 0 32 14.3 32 32zM128 224c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16v-64zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16v-64zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16v-64z"/></svg>
        `;

        button.addEventListener('click', () => {
        const original = input.value.trim();
        if (!original) return;
        const converted = parseAndConvert(original);
        setNativeValue(input, converted);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        });

        append.appendChild(button);
        wrapper.appendChild(append);

        input.dataset.buttonAdded = 'true';
    }
    function injectHeightButton() {
    const input = document.querySelector('input#height_cm');
    if (!input || input.dataset.buttonAdded === 'true') return;

    const parent = input.closest('.col-xl-7.col-sm-9');
    if (!parent) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'input-group';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const append = document.createElement('div');
    append.className = 'input-group-append';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mr-2 btn btn-secondary';
    button.title = 'Convert U.S. height to cm';
    button.innerHTML = `
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ruler" class="svg-inline--fa fa-ruler fa-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 128v256c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32h448c17.7 0 32 14.3 32 32zM128 224c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16v-64zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16v-64zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16v-64z"/></svg>
`;

    button.addEventListener('click', () => {
        const original = input.value.trim();
        if (!original) return;
        const converted = parseHeightToCm(original);
        if (converted !== null) {
        setNativeValue(input, converted);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    append.appendChild(button);
    wrapper.appendChild(append);

    input.dataset.buttonAdded = 'true';
}

    function injectAll() {
        injectMeasurementsButton();
        injectWeightButton();
        injectHeightButton();
    }

    // Run once on page load and also on DOM changes
    window.addEventListener('load', injectAll);
    new MutationObserver(injectAll).observe(document.body, { childList: true, subtree: true });
})();

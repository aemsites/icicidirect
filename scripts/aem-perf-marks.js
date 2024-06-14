/**
 * AEM Performance Marks.
 * @type {object}
 */
window.PerfMarks = window.PerfMarks || {};

/**
 * Track block loading.
 * @type {boolean}
 */
window.PerfMarks.isTrackingBlockTiming = window.PerfMarks.isTrackingBlockTiming || true;

/**
 * Create a performance mark.
 * @param {string} name The name of the performance mark.
 * @param {any} detail The detail to pass to the performance mark.
 */
window.PerfMarks.create = (name, detail = undefined) => {
    performance.mark(`perf-start-${name}`, detail ? { detail } : undefined);
    // eslint-disable-next-line no-console
    console.debug(`perf-${name} started at ${performance.now()} + ms`);
};

/**
 * Measure the time between two performance marks.
 * @param {string} name The name of the performance mark.
 * @param {string[]} labels The labels to add to the performance mark.
 */
window.PerfMarks.measure = (name, labels = []) => {
    performance.mark(`perf-stop-${name}`);
    const customLabels = labels.map((label) => `[${label}]`).join('');
    const measureName = `[perf]${customLabels} ${name}`;
    const duration = performance.measure(measureName, `perf-start-${name}`, `perf-stop-${name}`);
    // eslint-disable-next-line no-console
    console.debug(`perf-${name} stopped at ${performance.now()} ms`);
    // eslint-disable-next-line no-console
    console.debug(`perf-${name} took ${duration.duration} ms`);
};

const markNames = new Set();

/**
 * Get a unique mark name.
 * @param blockName
 * @returns {string}
 */
function getMarkName(blockName) {
    let markName = blockName;
    let i = 0;
    while (markNames.has(markName)) {
        i += 1;
        markName = `${blockName}_${i}`;
    }
    return markName;
}

/**
 * Track block timing.
 */
function trackBlockTiming() {
    const config = {
        attributes: true,
        attributeFilter: ['data-block-status'],
        attributeOldValue: true,
        subtree: true,
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const { target, oldValue } = mutation;
            console.debug('MutationObserver', target); // eslint-disable-line no-console
            if (target.dataset.blockStatus) {
                const name = target.dataset.blockName;
                const status = target.dataset.blockStatus;
                if (status === 'loading' && oldValue) {
                    const markName = getMarkName(name);
                    markNames.add(markName);
                    target.dataset.perfMarkName = markName;
                    console.debug('creating performance mark', markName, oldValue, status); // eslint-disable-line no-console
                    window.PerfMarks.create(markName);
                } else if (status === 'loaded') {
                    console.debug('measuring performance mark', target.dataset.perfMarkName, oldValue, status); // eslint-disable-line no-console
                    window.PerfMarks.measure(target.dataset.perfMarkName);
                    delete target.dataset.perfMarkName;
                }
            }
        });
    });

    console.debug('Attaching performance observer...'); // eslint-disable-line no-console
    observer.observe(document.body, config);

    setTimeout(() => {
        console.debug('Detaching performance observer...'); // eslint-disable-line no-console
        observer.disconnect();
    }, 10000);
}

if (window?.PerfMarks.isTrackingBlockTiming) {
    trackBlockTiming();
}
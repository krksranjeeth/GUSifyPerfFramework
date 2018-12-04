function getMedianRunMS(run, median, base) {
    // Check if URL has iteration override
    const params = location.search.replace('?', '').split('&');

    for (const p of params) {
        if (p.indexOf('iterations') !== -1) {
            // iteration=7-4
            return p.split('=')[1].split('-')[base ? 0 : 1];
        }
    }

    // Use EPT to get run closest to the median
    let minDiff = run.data.iterations[0].data.EPT;
    let minIdx = -1;

    for (let i = 0; i < run.data.iterations.length; i++) {
        if (
            run.data.iterations[i].status.state === 'success' &&
            Math.abs(run.data.iterations[i].data.EPT - median) < minDiff
        ) {
            minDiff = Math.abs(run.data.iterations[i].data.EPT - median);
            minIdx = i;
        }
    }
    return minIdx;
}

function getMedianRunCPUProfile(run, median, base) {
    // Check if URL has iteration override
    const params = location.search.replace('?', '').split('&');

    for (const p of params) {
        if (p.indexOf('iterations') !== -1) {
            // iteration=7-4
            return p.split('=')[1].split('-')[base ? 0 : 1];
        }
    }

    // Use BPT to get run closest to the median
    let minDiff = run.data.iterations[0].data.BPT;
    let minIdx = -1;

    for (let i = 0; i < run.data.iterations.length; i++) {
        if (
            run.data.iterations[i].status.state === 'success' &&
            Math.abs(run.data.iterations[i].data.BPT - median) < minDiff
        ) {
            minDiff = Math.abs(run.data.iterations[i].data.BPT - median);
            minIdx = i;
        }
    }
    return minIdx;
}

function getPercent(left, right) {
    return Math.round((right - left) / left * 100);
}

function percentBar(percent) {
    var barColor = '';

    barColor = percent > 0 ? '#F44336' : '#4CAF50';

    return `-webkit-linear-gradient(0deg, ${barColor} ${Math.abs(percent)}%, transparent ${Math.abs(percent)}%, transparent ${Math.abs(percent)}%, transparent ${100 - Math.abs(percent)}%)`;
}

// Swap percent/value of a cell
// To force switch instead of toggle, set force to true and use toValue
function swapOne(obj, force, toValue) {
    if (obj.dataset.values) {
        var switchToValue = false;
        var values = obj.dataset.values.split(' ');

        if (parseFloat(values[0]) === 0.00 || parseFloat(values[2]) === 0.00) {
            switchToValue = true;
        } else if (force) {
            switchToValue = toValue;
        } else {
            switchToValue = !obj.dataset.mode || obj.dataset.mode === 'percent';
        }

        var values = obj.dataset.values.split(' ');

        if (switchToValue) {
            var color = '';

            if (values[0] !== '-' && values[2] !== '-') {
                var percent = getPercent(values[0], values[2]);

                color = percent !== 0 ? (percent > 0 ? '#F44336' : '#4CAF50') : '#000';
            }

            obj.getElementsByTagName('DIV')[0].innerHTML = `${obj.dataset.values}`;
            obj.getElementsByTagName('DIV')[0].style.color = color;
            obj.getElementsByTagName('DIV')[0].style.background = 'none';
            obj.dataset.mode = 'value';
        } else {
            if (values[0] === '-' || values[2] === '-') {
                obj.getElementsByTagName('DIV')[0].innerHTML = `N/A`;
            } else {
                var percent = getPercent(values[0], values[2]);

                obj.getElementsByTagName('DIV')[0].style.background = percentBar(percent);
                obj.getElementsByTagName('DIV')[0].style.color = '#000';
                obj.getElementsByTagName('DIV')[0].innerHTML = `${percent}%`;
            }
            obj.dataset.mode = 'percent';
        }
    }
}

function swapAll(obj) {
    obj.parentNode.querySelectorAll('[data-values]').forEach((node) => swapOne(node, true, obj.dataset.mode === 'percent'));
    obj.dataset.mode = obj.dataset.mode === 'percent' ? 'values' : 'percent';
}
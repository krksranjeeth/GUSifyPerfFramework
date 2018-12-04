function prettyActionName(actionDescriptor) {
    let [className, actionName] = actionDescriptor.split('/ACTION$');

    if (actionName === undefined) {
        return actionDescriptor;
    } else {
        const shortClassName = className.split('.').pop();
        const splitNames = actionName.split('_');

        let suffix = '';

        if (splitNames.length > 1) {
            suffix = '_' + splitNames.pop();
        }
        let shortActionName = splitNames.join('_');

        return `${shortClassName}.<span class="post-action">${shortActionName}</span>${suffix}`;
    }
}
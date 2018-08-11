/* global ngapp, moduleUrl, fh */

// == BEGIN SOURCE FILES
//= require src/reproccerConverter.js
//= require src/reproccerConverterController.js
// == END SOURCE FILES

let createToolsItem = function(items) {
    let index = items.findIndex(item => item.id === 'Automate');
    let toolsBuilders = [];
    let toolsItem = {
        id: 'Tools',
        toolBuilders: toolsBuilders,
        visible: () => true,
        build: (scope, items) => {
            let tools = [];
            toolsBuilders.forEach(toolBuilder => {
                let tool = toolBuilder(scope, items);
                if (tool) tools.push(tool);
            });
            if (tools.length === 0) return;
            items.push({
                label: 'Tools',
                children: tools
            });
        }
    };
    items.splice(index, 0, toolsItem);
    return toolsItem;
};

let getToolsItem = function(items) {
    return items.find(item => item.id === 'Tools') || createToolsItem(items);
};

ngapp.run(function(contextMenuFactory) {
    let toolsItem = getToolsItem(contextMenuFactory.treeViewItems);
    toolsItem.toolBuilders.push(scope => ({
        label: 'Reproccer Converter',
        callback: () => scope.$emit('openModal', 'reproccerConverter', {
            templateUrl: `${moduleUrl}/partials/modal.html`,
            controller: 'reproccerConverterController'
        })
    }));
});
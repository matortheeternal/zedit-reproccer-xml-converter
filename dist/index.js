/* global ngapp, moduleUrl, fh */

// == BEGIN SOURCE FILES
ngapp.service('reproccerConverter', function() {
    let {reduce, map} = Array.prototype;

    this.convert = function(inputPath, outputPath) {
        let parser = new DOMParser(),
            text = fh.loadTextFile(inputPath),
            xml = parser.parseFromString(text, 'text/xml');

        let getters = {
            "s": child => child.textContent,
            "i": child => parseInt(child.textContent),
            "f": child => parseFloat(child.textContent)
        };

        let buildSimpleArray = tagName => {
            let tags = xml.getElementsByTagName(tagName);
            return map.call(tags, tag => tag.textContent);
        };

        let applyValue = (obj, child, schema) => {
            let mapping = schema[child.tagName];
            if (!mapping) return;
            let getValue = getters[child.tagName[0]] || getters["s"];
            obj[mapping] = getValue(child);
        };

        let parseTag = (tag, schema) => {
            return reduce.call(tag.childNodes, (obj, child) => {
                applyValue(obj, child, schema);
                return obj;
            }, {});
        };

        let buildArray = (tagName, schema) => {
            if (!schema) return buildSimpleArray(tagName);
            let tags = xml.getElementsByTagName(tagName);
            return map.call(tags, tag => parseTag(tag, schema));
        };

        let buildEffectsArray = () => {
            return []; // TODO
        };

        let output = {
            "weapons": {
                "typeDefinitions": buildArray('weapon_type_definition', {
                    "sSkyReWeaponTypeBinding": "binding",
                    "sWeaponSubstring": "substring"
                }),
                "materials": buildArray('weapon_material', {
                    "iDamage": "damage",
                    "sMaterialName": "name"
                }),
                "materialOverrides": buildArray('weapon_material_overrides', {
                    "weaponSubstring": "substring",
                    "materialOverride": "material"
                }),
                "types": buildArray('weapon_type', {
                    "fReach": "reach",
                    "fSpeed": "speed",
                    "iDamage": "damage",
                    "sTypeName": "type"
                }),
                "typeOverrides": buildArray('weapon_type_override', {
                    "weaponName": "name",
                    "weaponType": "type"
                }),
                "excludedWeapons": buildArray('weapon_exclusion_string'),
                "excludedCrossbows": buildArray('crossbow_exclusion_string')
            },
            "armor": {
                "materials": buildArray('armor_material', {
                    "iArmor": "armor",
                    "sMaterialName": "name"
                }),
                "materialOverrides": buildArray('armor_material_overrides', {
                    "armorSubstring": "substring",
                    "materialOverride": "material"
                }),
                "excludedDreamcloth": buildArray('dreamcloth_exclusion_string')
            },
            "alchemy": {
                "effects": buildEffectsArray(),
                "excludedEffects": buildArray('alchemy_exclusion_string')
            },
            "projectiles": {
                "baseStats": buildArray('base_stats_projectile', {
                    "fRangeBase": "range",
                    "fSpeedBase": "speed",
                    "fGravityBase": "gravity",
                    "iDamageBase": "damage",
                    "sIdentifier": "identifier",
                    "sType": "type"
                }),
                "modifierStats": buildArray('modifier_stats_projectile', {
                    "sModifierName": "name",
                    "fGravityModifier": "gravity",
                    "fSpeedModifier": "speed",
                    "iDamageModifier": "damage"
                }),
                "materialStats": buildArray('material_stats_projectile', {
                    "sMaterialName": "name",
                    "fGravityModifier": "gravity",
                    "fSpeedModifier": "speed",
                    "iDamageModifier": "damage"
                }),
                "excludedAmmunitionVariants": buildArray('ammunition_multiply_exclusion_string'),
                "excludedAmmunition": buildArray('ammunition_exclusion_string')
            }
        };

        fh.saveTextFile(outputPath, JSON.stringify(output, null, 2));
    };
});
ngapp.controller('reproccerConverterController', function($scope, reproccerConverter) {
    $scope.inputPath = fh.jetpack.path('Stats.xml');
    $scope.outputPath = fh.jetpack.path('output.json');

    $scope.browseForInput = function() {
        let label = 'Select Reproccer XML File';
        let inputPath = fh.selectFile(label, $scope.inputPath, [
            { name: 'XML document', extensions: 'xml' }
        ]);
        if (inputPath) $scope.inputPath = inputPath;
    };

    $scope.browseForOutput = function() {
        let label = 'Specify output path';
        let outputPath = fh.saveFile(label, $scope.outputPath, [
            { name: 'JSON file', extensions: 'json' }
        ]);
        if (outputPath) $scope.outputPath = outputPath;
    };

    $scope.convert = function() {
        if (fh.jetpack.exists($scope.inputPath) !== 'file')
            throw new Error(`${$scope.inputPath} does not exist.`);
        reproccerConverter.convert($scope.inputPath, $scope.outputPath);
        alert(`Converted "${$scope.inputPath}" successfully.`);
    };
});
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
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
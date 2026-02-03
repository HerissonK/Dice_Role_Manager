export function getAttackAbilityMod(weapon, abilities) {
    if (weapon.rangeType === 'ranged') {
        return abilityModifier(abilities.dexterity);
    }

    if (weapon.properties?.includes('finesse')) {
        return Math.max(
            abilityModifier(abilities.strength),
            abilityModifier(abilities.dexterity)
        );
    }

    return abilityModifier(abilities.strength);
}

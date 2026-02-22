export {
    character,
    currentUserCharacters,
} from "./character/queries";

export {
    createCharacter,
    updateCharacter,
    deleteCharacter,
    toggleInspiration,
} from "./character/lifecycleMutations";

export {
    updateAbilityScores,
    updateHP,
    updateDeathSaves,
    updateHitDice,
    updateSkillProficiencies,
    updateTraits,
    updateCurrency,
    updateSavingThrowProficiencies,
} from "./character/statsMutations";

export {
    characterStats,
    characterAttacks,
    characterInventory,
    characterFeatures,
    characterSpellSlots,
    characterSpellbook,
} from "./character/fieldResolvers";

export {
    learnSpell,
    forgetSpell,
    prepareSpell,
    unprepareSpell,
    toggleSpellSlot,
} from "./character/spellbookMutations";

export {
    addAttack,
    removeAttack,
    addInventoryItem,
    removeInventoryItem,
    addFeature,
    removeFeature,
} from "./character/gearAndFeaturesMutations";

export {
    spendHitDie,
    shortRest,
    longRest,
} from "./character/restMutations";

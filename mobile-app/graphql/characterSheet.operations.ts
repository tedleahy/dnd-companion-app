import { gql } from '@apollo/client';

export const GET_CURRENT_USER_CHARACTERS = gql`
    query CurrentUserCharacters {
        currentUserCharacters {
            id
            name
            race
            class
            subclass
            level
            alignment
            proficiencyBonus
            inspiration
            ac
            speed
            initiative
            spellSaveDC
            conditions
            stats {
                id
                abilityScores {
                    strength
                    dexterity
                    constitution
                    intelligence
                    wisdom
                    charisma
                }
                hp {
                    current
                    max
                    temp
                }
                deathSaves {
                    successes
                    failures
                }
                hitDice {
                    total
                    remaining
                    die
                }
                savingThrowProficiencies
                skillProficiencies {
                    acrobatics
                    animalHandling
                    arcana
                    athletics
                    deception
                    history
                    insight
                    intimidation
                    investigation
                    medicine
                    nature
                    perception
                    performance
                    persuasion
                    religion
                    sleightOfHand
                    stealth
                    survival
                }
            }
        }
    }
`;

export const TOGGLE_INSPIRATION = gql`
    mutation ToggleInspiration($characterId: ID!) {
        toggleInspiration(characterId: $characterId) {
            id
            inspiration
        }
    }
`;

export const UPDATE_DEATH_SAVES = gql`
    mutation UpdateDeathSaves($characterId: ID!, $input: DeathSavesInput!) {
        updateDeathSaves(characterId: $characterId, input: $input) {
            id
            deathSaves {
                successes
                failures
            }
        }
    }
`;

export const UPDATE_SKILL_PROFICIENCIES = gql`
    mutation UpdateSkillProficiencies($characterId: ID!, $input: SkillProficienciesInput!) {
        updateSkillProficiencies(characterId: $characterId, input: $input) {
            id
            skillProficiencies {
                acrobatics
                animalHandling
                arcana
                athletics
                deception
                history
                insight
                intimidation
                investigation
                medicine
                nature
                perception
                performance
                persuasion
                religion
                sleightOfHand
                stealth
                survival
            }
        }
    }
`;

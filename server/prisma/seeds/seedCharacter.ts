import prisma from '../prisma';

type SeedSpell = {
    name: string;
    prepared: boolean;
};

const OWNER_USER_ID = 'demo-user';
const CHARACTER_NAME = 'Vaelindra';

const SPELLBOOK: SeedSpell[] = [
    { name: 'Fire Bolt', prepared: true },
    { name: 'Mage Hand', prepared: true },
    { name: 'Shield', prepared: true },
    { name: 'Magic Missile', prepared: true },
    { name: 'Misty Step', prepared: true },
    { name: 'Counterspell', prepared: true },
    { name: 'Fireball', prepared: true },
    { name: 'Lightning Bolt', prepared: false },
    { name: 'Dimension Door', prepared: true },
    { name: 'Greater Invisibility', prepared: false },
    { name: 'Wall of Force', prepared: true },
    { name: 'Teleportation Circle', prepared: false },
];

export default async function seedCharacter() {
    try {
        await prisma.character.deleteMany({
            where: {
                ownerUserId: OWNER_USER_ID,
                name: CHARACTER_NAME,
            },
        });

        const createdCharacter = await prisma.character.create({
            data: {
                ownerUserId: OWNER_USER_ID,
                name: CHARACTER_NAME,
                race: 'High Elf',
                class: 'Wizard',
                subclass: 'School of Evocation',
                level: 12,
                alignment: 'Chaotic Good',
                background: 'Sage',
                proficiencyBonus: 4,
                inspiration: false,
                ac: 17,
                speed: 35,
                initiative: 3,
                spellcastingAbility: 'intelligence',
                spellSaveDC: 17,
                spellAttackBonus: 9,
                conditions: [],
                notes: 'Phase 3 seed character for character sheet UI and backend flows.',
                stats: {
                    create: {
                        abilityScores: {
                            strength: 8,
                            dexterity: 16,
                            constitution: 14,
                            intelligence: 20,
                            wisdom: 13,
                            charisma: 11,
                        },
                        hp: {
                            current: 76,
                            max: 76,
                            temp: 0,
                        },
                        deathSaves: {
                            successes: 0,
                            failures: 0,
                        },
                        hitDice: {
                            total: 12,
                            remaining: 12,
                            die: 'd6',
                        },
                        savingThrowProficiencies: ['intelligence', 'wisdom'],
                        skillProficiencies: {
                            acrobatics: 'none',
                            animalHandling: 'none',
                            arcana: 'expert',
                            athletics: 'none',
                            deception: 'none',
                            history: 'expert',
                            insight: 'proficient',
                            intimidation: 'none',
                            investigation: 'expert',
                            medicine: 'none',
                            nature: 'proficient',
                            perception: 'proficient',
                            performance: 'none',
                            persuasion: 'none',
                            religion: 'proficient',
                            sleightOfHand: 'none',
                            stealth: 'proficient',
                            survival: 'none',
                        },
                        traits: {
                            personality: 'Quietly curious and always taking notes.',
                            ideals: 'Knowledge should be preserved and shared responsibly.',
                            bonds: 'My spellbook contains my life\'s work.',
                            flaws: 'I overestimate my ability to control dangerous magic.',
                        },
                        currency: {
                            cp: 0,
                            sp: 14,
                            ep: 0,
                            gp: 847,
                            pp: 3,
                        },
                    },
                },
                attacks: {
                    create: [
                        {
                            name: 'Dagger',
                            attackBonus: '+7',
                            damage: '1d4+3 P',
                            type: 'melee',
                        },
                        {
                            name: 'Fire Bolt',
                            attackBonus: '+9',
                            damage: '3d10 F',
                            type: 'spell',
                        },
                    ],
                },
                inventory: {
                    create: [
                        {
                            name: 'Arcane Focus Wand',
                            quantity: 1,
                            equipped: true,
                            magical: true,
                        },
                        {
                            name: 'Spellbook',
                            quantity: 1,
                            weight: 3,
                            description: 'Leather-bound spellbook with silver filigree.',
                            equipped: true,
                            magical: false,
                        },
                        {
                            name: 'Healing Potion',
                            quantity: 3,
                            magical: true,
                            equipped: false,
                        },
                    ],
                },
                features: {
                    create: [
                        {
                            name: 'Arcane Recovery',
                            source: 'Wizard 1',
                            description: 'Recover expended spell slots on a short rest.',
                            usesMax: 1,
                            usesRemaining: 1,
                            recharge: 'long',
                        },
                        {
                            name: 'Sculpt Spells',
                            source: 'Wizard 2',
                            description: 'Protect allies from your evocation spells.',
                        },
                        {
                            name: 'Darkvision',
                            source: 'High Elf',
                            description: 'Can see in dim light within 60 feet as if it were bright light.',
                        },
                    ],
                },
                spellSlots: {
                    create: [
                        { level: 1, total: 4, used: 0 },
                        { level: 2, total: 3, used: 0 },
                        { level: 3, total: 3, used: 0 },
                        { level: 4, total: 3, used: 0 },
                        { level: 5, total: 2, used: 0 },
                        { level: 6, total: 1, used: 0 },
                        { level: 7, total: 0, used: 0 },
                        { level: 8, total: 0, used: 0 },
                        { level: 9, total: 0, used: 0 },
                    ],
                },
            },
        });

        const spellNames = SPELLBOOK.map((item) => item.name);
        const spells = await prisma.spell.findMany({
            where: { name: { in: spellNames } },
            select: { id: true, name: true },
        });

        const spellIdByName = new Map(spells.map((spell) => [spell.name, spell.id]));

        const characterSpellRows = SPELLBOOK
            .map((seedSpell) => {
                const spellId = spellIdByName.get(seedSpell.name);
                if (!spellId) return null;
                return {
                    characterId: createdCharacter.id,
                    spellId,
                    prepared: seedSpell.prepared,
                };
            })
            .filter((row): row is { characterId: string; spellId: string; prepared: boolean } => row !== null);

        if (characterSpellRows.length > 0) {
            await prisma.characterSpell.createMany({
                data: characterSpellRows,
                skipDuplicates: true,
            });
        }

        const missingSpellCount = SPELLBOOK.length - characterSpellRows.length;
        if (missingSpellCount > 0) {
            console.warn(
                `Character seeded, but ${missingSpellCount} spell(s) were not found in Spell table and were skipped.`,
            );
        }

        console.log(`Seeded character '${CHARACTER_NAME}' with ${characterSpellRows.length} spellbook entries.`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

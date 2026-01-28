import { Prisma, SpellSource } from '@prisma/client';
import prisma from '../prisma';

type Spell = {
    index: string;
    name: string;
    desc: string[];
    higher_level?: string[];
    range: string;
    components: string[];
    material?: string;
    ritual: boolean;
    duration: string;
    concentration: boolean;
    casting_time: string;
    level: number;
    attack_type?: string;
    damage?: {
        damage_type?: {
            index?: string;
        };
        damage_at_slot_level?: Record<string, string>;
        damage_at_character_level?: Record<string, string>;
    };
    school: {
        index: string;
    };
    classes: Array<{ index: string }>;
    subclasses: Array<{ index: string }>;
};

function toSpellRecord(spell: Spell) {
    return {
        source: SpellSource.SRD,
        srdIndex: spell.index,
        name: spell.name,
        description: spell.desc,
        higherLevel: spell.higher_level ?? [],
        range: spell.range,
        components: spell.components,
        material: spell.material ?? null,
        ritual: spell.ritual,
        duration: spell.duration,
        concentration: spell.concentration,
        castingTime: spell.casting_time,
        level: spell.level,
        damageAtSlotLevel:
            spell.damage?.damage_at_slot_level ??
            spell.damage?.damage_at_character_level ??
            Prisma.JsonNull,
        damageTypeIndex: spell.damage?.damage_type?.index ?? null,
        attackType: spell.attack_type ?? null,
        schoolIndex: spell.school.index,
        classIndexes: spell.classes.map((item) => item.index),
        subclassIndexes: spell.subclasses.map((item) => item.index),
        raw: spell ?? Prisma.JsonNull,
    };
}

export default async function seedSpells() {
    try {
        const relativeFilePath = '../../../srd-json-files/5e-SRD-Spells.json';
        const filePath = new URL(relativeFilePath, import.meta.url).pathname;
        const spells = (await Bun.file(filePath).json()) as Spell[];

        console.log(`Loaded ${spells.length} spells from SRD JSON.`);

        const records = spells.map(toSpellRecord);

        const result = await prisma.spell.createMany({
            data: records,
            skipDuplicates: true,
        });

        console.log(`Seeded ${result.count} spells (skipDuplicates=true).`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

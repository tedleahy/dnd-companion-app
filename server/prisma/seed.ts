import 'dotenv/config';
import { Prisma, PrismaClient, SpellSource } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });

type SrdSpell = {
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

function chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

function getSpellsPath(): string {
    return new URL('../../srd-json-files/5e-SRD-Spells.json', import.meta.url).pathname;
}

async function main() {
    try {
        const spellsText = await Bun.file(getSpellsPath()).text();
        const spells = JSON.parse(spellsText) as SrdSpell[];

        console.log(`Loaded ${spells.length} spells from SRD JSON.`);

        const records = spells.map((spell) => ({
            source: SpellSource.SRD,
            srdIndex: spell.index,
            name: spell.name,
            desc: spell.desc,
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
        }));

        const batches = chunk(records, 200);
        let total = 0;

        console.log(`Seeding ${records.length} spells in ${batches.length} batches...`);

        for (const [index, batch] of batches.entries()) {
            const result = await prisma.spell.createMany({
                data: batch,
                skipDuplicates: true,
            });
            total += result.count;
            console.log(
                `Batch ${index + 1}/${batches.length} inserted ${result.count} (total ${total}).`
            );
        }

        console.log(`Seeded ${total} spells (skipDuplicates=true).`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

void main();

import seedAbilityScores from './seeds/seedAbilityScores';
import seedRaces from './seeds/seedRaces';
import seedCustomSpells from './seeds/seedCustomSpells';
import seedSpells from './seeds/seedSpells';

const srdSpellNames = await seedSpells();
await seedCustomSpells(srdSpellNames);
await seedAbilityScores();
await seedRaces();

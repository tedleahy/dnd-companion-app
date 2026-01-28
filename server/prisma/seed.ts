import seedAbilityScores from './seeds/seedAbilityScores';
import seedRaces from './seeds/seedRaces';
import seedSpells from './seeds/seedSpells';

await seedSpells();
await seedAbilityScores();
await seedRaces();

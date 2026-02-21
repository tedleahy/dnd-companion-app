import { schoolAndLevelLabel } from '../spellUtils';

describe('schoolAndLevelLabel', () => {
    it('formats a cantrip', () => {
        expect(schoolAndLevelLabel({ level: 0, schoolIndex: 'evocation' }))
            .toBe('Evocation Cantrip');
    });

    it('formats 1st level', () => {
        expect(schoolAndLevelLabel({ level: 1, schoolIndex: 'abjuration' }))
            .toBe('1st level Abjuration');
    });

    it('formats 2nd level', () => {
        expect(schoolAndLevelLabel({ level: 2, schoolIndex: 'conjuration' }))
            .toBe('2nd level Conjuration');
    });

    it('formats 3rd level', () => {
        expect(schoolAndLevelLabel({ level: 3, schoolIndex: 'necromancy' }))
            .toBe('3rd level Necromancy');
    });

    it('formats 4th level and above with "th"', () => {
        expect(schoolAndLevelLabel({ level: 4, schoolIndex: 'divination' }))
            .toBe('4th level Divination');
        expect(schoolAndLevelLabel({ level: 9, schoolIndex: 'transmutation' }))
            .toBe('9th level Transmutation');
    });

    it('capitalises multi-word school names', () => {
        expect(schoolAndLevelLabel({ level: 5, schoolIndex: 'illusion' }))
            .toBe('5th level Illusion');
    });
});

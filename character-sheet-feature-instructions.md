# Character Sheet Feature

This document describes the design and implementation requirements for the **Character Sheet** feature — a mobile-first digital replacement for a paper D&D 5e character sheet.

## Overview

The character sheet is a full-screen mobile view composed of:
- A **sticky header** with character name, subtitle, and a **tab bar**
- A **scrollable content area** that changes based on the active tab
- A **fixed bottom navigation bar** for top-level app sections

The reference HTML prototype (`character-sheet.html`) should be used as the design source of truth for colors, typography, spacing, and component structure.

---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--parchment` | `#f5e6c8` | Light parchment tone |
| `--parchment-dark` | `#e8d4a8` | Slightly deeper parchment |
| `--card-bg` | `#f0e0bc` | Card background |
| `--ink` | `#1a0f00` | Primary text |
| `--ink-light` | `#3d2b1f` | Secondary text |
| `--crimson` | `#8b1a1a` | Danger, HP, negative values |
| `--gold` | `#c9922a` | Accents, labels, highlights |
| `--gold-light` | `#e8b84b` | Brightest gold |
| `--bg` | `#0d0906` | App background (near-black) |
| `--divider` | `rgba(139,90,43,0.3)` | Horizontal rules inside cards |
| `--shadow` | `0 4px 20px rgba(0,0,0,0.6)` | Card drop shadow |

**Typography:**
- **Display / labels:** `Cinzel` (Google Fonts) — all caps, letter-spaced, used for section labels, stat names, nav items
- **Body / descriptions:** `Crimson Text` (Google Fonts) — serif, used for descriptions, values, spell metadata

---

## Data Model

All character data should be typed. Suggested top-level shape:

```ts
interface Character {
  id: string
  name: string
  race: string
  class: string
  subclass?: string
  level: number
  alignment: string
  background: string

  // Core stats
  abilityScores: AbilityScores
  proficiencyBonus: number
  inspiration: boolean

  // Vitals
  hp: { current: number; max: number; temp: number }
  ac: number
  speed: number
  initiative: number // usually DEX mod, but can be overridden
  conditions: string[]

  // Combat
  deathSaves: { successes: number; failures: number }
  hitDice: { total: number; remaining: number; die: string } // e.g. "d6"

  // Proficiencies
  savingThrowProficiencies: AbilityKey[]
  skillProficiencies: Record<SkillName, 'none' | 'proficient' | 'expert'>

  // Spells
  spellcastingAbility: AbilityKey
  spellSaveDC: number
  spellAttackBonus: number
  spellSlots: SpellSlot[]        // one entry per spell level 1–9
  preparedSpells: Spell[]

  // Gear
  attacks: Attack[]
  inventory: InventoryItem[]
  currency: Currency

  // Features & traits
  features: Feature[]
  traits: { personality: string; ideals: string; bonds: string; flaws: string }
  notes: string
}

interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

type AbilityKey = keyof AbilityScores

interface SpellSlot {
  level: number   // 1–9
  total: number
  used: number
}

interface Spell {
  id: string
  name: string
  level: number   // 0 = cantrip
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
  damage?: string  // e.g. "8d6"
  prepared: boolean
}

interface Attack {
  name: string
  attackBonus: string  // e.g. "+7"
  damage: string       // e.g. "1d4+3 P"
  type: 'melee' | 'ranged' | 'spell'
}

interface InventoryItem {
  name: string
  quantity: number
  weight?: number
  description?: string
  equipped?: boolean
  magical?: boolean
}

interface Currency {
  cp: number; sp: number; ep: number; gp: number; pp: number
}

interface Feature {
  name: string
  source: string   // e.g. "Wizard 2", "High Elf"
  description: string
  usesMax?: number
  usesRemaining?: number
  recharge?: 'short' | 'long' | 'dawn'
}
```

---

## Tab Structure

The header tab bar has five tabs. Each tab replaces the scrollable content area below the sticky header.

### Tab 1 — Core

The default/landing tab. Contains:

1. **Vitals card**
   - HP display: `current / max` in crimson, with a progress bar fill
   - Temp HP shown as a subscript below
   - AC, Speed in same row, divided by vertical rules
   - HP bar: filled proportionally to `current/max`
   - Active conditions as pill tags below bar (show "No conditions" placeholder if empty)

2. **Quick stats card**
   - Four pills in a row: Proficiency Bonus, Initiative, Inspiration (gold `✦` icon when active, greyed out when not), Spell Save DC
   - Tapping Inspiration should toggle it on/off

3. **Ability scores card**
   - 3×2 grid
   - Each cell: ability name (label), score (large), modifier (pill, crimson). Highest score gets gold-coloured modifier pill.
   - Modifier is calculated: `Math.floor((score - 10) / 2)`

4. **Saving throws + Skills card** (combined, with a divider)
   - Each row: proficiency dot · skill name · modifier · ability abbreviation
   - Dot states: hollow (none), filled crimson (proficient), double-ring gold (expertise)
   - Saving throw modifier = ability mod + (proficient ? proficiencyBonus : 0)
   - Skill modifier = ability mod + (proficient ? proficiencyBonus : 0) + (expert ? proficiencyBonus : 0)
   - Legend at bottom: `● Proficient  ◎ Expertise`

5. **Death saves card**
   - Success and failure rows with 3 tappable circles each
   - Tapping fills/unfills a circle
   - Successes: filled green; Failures: filled crimson

---

### Tab 2 — Skills

A focused, full-list view of all skills (not just a subset). Same row structure as the Core tab skill section, but showing all 18 skills, grouped or sorted alphabetically. Include a search/filter input at the top to quickly find a skill.

Also show:
- **Passive Perception** prominently at the top: `10 + Perception modifier`
- **Passive Investigation** and **Passive Insight** as secondary callouts

---

### Tab 3 — Spells

1. **Spell slots tracker** — horizontal scrollable row of slot groups (levels 1–9). Each group shows the level label and a row of pips (filled = available, hollow = used). Tapping a pip toggles used/available.

2. **Spellcasting stats bar** — Spellcasting Ability · Spell Save DC · Spell Attack Bonus, shown as three inline pills.

3. **Spell list** — grouped by level (Cantrips first, then 1st through 9th). Within each group:
   - Level header (e.g. "3rd Level") with a count badge
   - Each spell row: level badge · spell name + school/casting time meta · optional tag (damage dice / Conc. / Ritual)
   - Tapping a spell opens a bottom sheet (or navigates) to the full Spell Codex detail view (the existing design)
   - Long-press or swipe to mark a spell as unprepared

4. **Add spell button** at the bottom of the list.

---

### Tab 4 — Gear

1. **Attacks section** — each attack shows weapon name, attack bonus, and damage/type. Tappable for detail.

2. **Inventory list** — grouped into: Equipped, Backpack, Other. Each item: icon (emoji or category icon) · name · quantity. Swipe to equip/unequip or delete. Magical items get a gold dot indicator.

3. **Encumbrance bar** (optional) — current weight / carrying capacity (15 × STR score).

4. **Currency row** — CP / SP / EP / GP / PP. Each denomination tappable to edit the amount inline.

5. **Add item button**.

---

### Tab 5 — Features

1. **Class features** — sourced from `character.features` where `source` starts with the class name. Each entry: icon · name · description. Features with limited uses show a pip tracker (similar to spell slots) for `usesRemaining / usesMax`, with a recharge label.

2. **Racial traits** — same layout, features from racial source.

3. **Feats** — same layout, features from feat source.

4. **Personality & Background** — four text blocks: Personality Traits, Ideals, Bonds, Flaws. Each is tappable to edit inline.

5. **Proficiencies & Languages** — a simple comma-separated or tag-style list of armor, weapon, tool proficiencies and known languages.

---

## Shared Components

These components are reused across tabs:

### `SectionLabel`
Small all-caps Cinzel label in crimson, used above each card section.
```
font: Cinzel 8.5px, letter-spacing 2.5px, crimson, 0.8 opacity
padding: 14px 18px 0
```

### `Card`
Parchment background (`--card-bg`), `border-radius: 14px`, drop shadow, subtle noise texture overlay (CSS SVG filter). Cards stagger-animate in on tab load with `fadeUp` keyframe (translate Y 16px → 0, opacity 0 → 1, 0.35s ease, staggered delay).

### `CardDivider`
1px horizontal rule at `--divider` color, `margin: 0 18px`.

### `ProficiencyDot`
Three visual states:
- `none` — hollow circle, `--divider` border
- `proficient` — filled `--crimson`
- `expert` — double-ring: gold outer, card-bg inner, gold fill

### `SpellLevelBadge`
Circle with level number. Cantrips use "C" and muted styling. Higher levels use gold border + gold text.

### `StatPill`
Rounded rect, slightly darker background, centered Cinzel value + small label underneath.

### `ConditionTag`
Rounded pill, crimson border + crimson text for active conditions. Muted styling for placeholder.

### `SpellSlotPip`
Small circle (10px). Filled gold = available. Hollow = expended. Tappable.

---

## Interactions & State

- **Tab switching** — instant content swap, cards re-animate on each tab change
- **HP editing** — tapping the HP value opens an inline numeric input or a +/− stepper sheet
- **Inspiration toggle** — tapping the inspiration pill in Quick Stats toggles `character.inspiration`
- **Death save tapping** — tapping a circle increments successes or failures; tapping a filled circle decrements
- **Spell slot pips** — tapping toggles used/available state
- **Spell tap** — navigates to the Spell Codex detail view (existing screen)
- **Feature use tracker** — tapping a use pip marks it as used; long rest / short rest button should restore appropriate features
- **Long rest / Short rest buttons** — can live in a floating action button or in the header overflow menu (⋯). Long rest: restore all HP, all spell slots, long-rest features. Short rest: restore short-rest features, allow hit dice spending.

---

## Notes

- The design is **mobile-first**, max-width 420px, centered on larger screens.
- All cards should support **dark mode** gracefully — the dark background is already `#0d0906`; the parchment cards provide contrast.
- Use the **existing Spell Codex detail screen** design for individual spell views; the character sheet links into it, it is not duplicated here.
- Avoid inline styles where possible; use the CSS variable tokens defined above.
- The bottom nav is app-level (Sheet / Spellbook / Inventory / Notes / Settings) and persists across all tabs.

# Project Context: D&D Companion App

Goal
- Build a Dungeons & Dragons companion app to use during play.
- Features: browse/search/filter spells, create custom spells, manage characters (HP, inventory, etc).
- Learn: React Native + GraphQL (Apollo Server), all in TypeScript.

App (Mobile)
- Expo React Native + TypeScript
- UI: react-native-paper (Material Design components)
- GraphQL client: Apollo Client

Backend (API)
- Node.js + TypeScript + Bun
- Using Bun, not node/npm
- Apollo Server (GraphQL)
- Database: PostgreSQL + Prisma ORM
- Prisma commands (migrate, generate, seed) must be run via root package.json scripts (e.g. `bun db:migrate -- <name>`, `bun db:generate`). Running `bunx prisma` directly won't find the schema due to the prisma.config.ts setup.

Data strategy
- Day 1: import SRD JSON files (e.g. 5e-SRD-Spells.json, in the srd-json-files directory) into Postgres.
- Unified spells list: includes SRD + user-created spells.
- Store full SRD objects as JSONB (`raw`) plus extracted/indexed fields for search/filter (name, level, schoolIndex, classIndexes, ritual, concentration).
- Custom spells stored in same table with `source=CUSTOM` and `ownerUserId`.

GraphQL API shape
- Query: `spells(filter, pagination)` returns SRD + current user custom spells (default).
- Query: `spell(id)` for details.
- Mutations: create/update custom spells; character management mutations later.

Coding conventions
- TypeScript everywhere.
- Keep components simple and modern; use react-native-paper patterns.
- Prefer small, composable modules; avoid overengineering early.
- Use function foo() {} instead of const foo = () => {}, except for one-liners
- Use async/await in a try/catch block instead of .then(), .catch(), etc., where possible

UI style
- Give the app a fantasy-style look and feel to it.

General instructions
- The main goal in making this app is learning React Native and GraphQL. Explain new concepts relating to these technologies. You can assume React web knowledge and REST API knowledge, but assume no knowledge of graphql or native-specific things. So when you tell me how to do something graphql or react native specific, use it as a teaching opportunity.
- If you encounter any particular pain points when executing tasks, reflect on them afterwards and make changes to this file to help you navigate the same issues more quickly in future.

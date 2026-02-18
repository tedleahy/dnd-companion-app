export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addSpellToList: SpellList;
  createSpellList: SpellList;
  deleteSpellList: Scalars['Boolean']['output'];
  removeSpellFromList: SpellList;
  renameSpellList: Scalars['Boolean']['output'];
};


export type MutationAddSpellToListArgs = {
  spellId: Scalars['ID']['input'];
  spellListId: Scalars['ID']['input'];
};


export type MutationCreateSpellListArgs = {
  name: Scalars['String']['input'];
};


export type MutationDeleteSpellListArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveSpellFromListArgs = {
  spellId: Scalars['ID']['input'];
  spellListId: Scalars['ID']['input'];
};


export type MutationRenameSpellListArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  currentUserSpellLists: Array<SpellList>;
  spell?: Maybe<Spell>;
  spells: Array<Spell>;
};


export type QuerySpellArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpellsArgs = {
  filter?: InputMaybe<SpellFilter>;
};

export type Spell = {
  __typename?: 'Spell';
  castingTime: Scalars['String']['output'];
  classIndexes: Array<Scalars['String']['output']>;
  components: Array<Scalars['String']['output']>;
  concentration: Scalars['Boolean']['output'];
  description: Array<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  higherLevel: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  material?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  range?: Maybe<Scalars['String']['output']>;
  ritual: Scalars['Boolean']['output'];
  schoolIndex: Scalars['String']['output'];
};

export type SpellFilter = {
  classes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  levels?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SpellList = {
  __typename?: 'SpellList';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  spells: Array<Spell>;
};

export type CurrentUserSpellListsQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserSpellListsQuery = { __typename?: 'Query', currentUserSpellLists: Array<{ __typename?: 'SpellList', id: string, name: string }> };

export type CreateSpellListMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateSpellListMutation = { __typename?: 'Mutation', createSpellList: { __typename?: 'SpellList', id: string, name: string } };

export type SpellsQueryVariables = Exact<{
  filter?: InputMaybe<SpellFilter>;
}>;


export type SpellsQuery = { __typename?: 'Query', spells: Array<{ __typename?: 'Spell', id: string, name: string }> };

export type SpellListQueryVariables = Exact<{ [key: string]: never; }>;


export type SpellListQuery = { __typename?: 'Query', currentUserSpellLists: Array<{ __typename?: 'SpellList', id: string, name: string, spells: Array<{ __typename?: 'Spell', id: string, name: string }> }> };

export type RenameSpellListMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type RenameSpellListMutation = { __typename?: 'Mutation', renameSpellList: boolean };

export type DeleteSpellListMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSpellListMutation = { __typename?: 'Mutation', deleteSpellList: boolean };

export type SpellDetailListsQueryVariables = Exact<{ [key: string]: never; }>;


export type SpellDetailListsQuery = { __typename?: 'Query', currentUserSpellLists: Array<{ __typename?: 'SpellList', id: string, name: string }> };

export type AddSpellToListMutationVariables = Exact<{
  spellListId: Scalars['ID']['input'];
  spellId: Scalars['ID']['input'];
}>;


export type AddSpellToListMutation = { __typename?: 'Mutation', addSpellToList: { __typename?: 'SpellList', id: string, spells: Array<{ __typename?: 'Spell', id: string, name: string }> } };

export type SpellQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SpellQuery = { __typename?: 'Query', spell?: { __typename?: 'Spell', id: string, name: string, level: number, schoolIndex: string, classIndexes: Array<string>, description: Array<string>, higherLevel: Array<string>, range?: string | null, components: Array<string>, material?: string | null, ritual: boolean, duration?: string | null, concentration: boolean, castingTime: string } | null };

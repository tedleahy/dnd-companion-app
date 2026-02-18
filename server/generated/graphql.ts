import { type GraphQLResolveInfo } from 'graphql';
import { type SpellList as PrismaSpellList } from '@prisma/client';
import { type Context } from '..';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  ritual?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SpellList = {
  __typename?: 'SpellList';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  spells: Array<Spell>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Spell: ResolverTypeWrapper<Spell>;
  SpellFilter: SpellFilter;
  SpellList: ResolverTypeWrapper<PrismaSpellList>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  Spell: Spell;
  SpellFilter: SpellFilter;
  SpellList: PrismaSpellList;
  String: Scalars['String']['output'];
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addSpellToList?: Resolver<ResolversTypes['SpellList'], ParentType, ContextType, RequireFields<MutationAddSpellToListArgs, 'spellId' | 'spellListId'>>;
  createSpellList?: Resolver<ResolversTypes['SpellList'], ParentType, ContextType, RequireFields<MutationCreateSpellListArgs, 'name'>>;
  deleteSpellList?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSpellListArgs, 'id'>>;
  removeSpellFromList?: Resolver<ResolversTypes['SpellList'], ParentType, ContextType, RequireFields<MutationRemoveSpellFromListArgs, 'spellId' | 'spellListId'>>;
  renameSpellList?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRenameSpellListArgs, 'id' | 'name'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  currentUserSpellLists?: Resolver<Array<ResolversTypes['SpellList']>, ParentType, ContextType>;
  spell?: Resolver<Maybe<ResolversTypes['Spell']>, ParentType, ContextType, RequireFields<QuerySpellArgs, 'id'>>;
  spells?: Resolver<Array<ResolversTypes['Spell']>, ParentType, ContextType, Partial<QuerySpellsArgs>>;
};

export type SpellResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Spell'] = ResolversParentTypes['Spell']> = {
  castingTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  classIndexes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  components?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  concentration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  higherLevel?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  material?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  range?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ritual?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  schoolIndex?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SpellListResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SpellList'] = ResolversParentTypes['SpellList']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  spells?: Resolver<Array<ResolversTypes['Spell']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Spell?: SpellResolvers<ContextType>;
  SpellList?: SpellListResolvers<ContextType>;
};


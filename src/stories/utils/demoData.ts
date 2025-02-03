import { PromptFile, Suggestions } from '../../types';

// Helper to get random items from array
const getRandomItems = (items: string[], count: number = 4) => {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const sqlApi = {
  getCodeAssistSuggestions: async (data: PromptFile[]): Promise<Suggestions> => {
    const beforeCursor = data[0]?.fragments?.[0]?.text || '';
    const lastWord = beforeCursor.split(/[\s.()[\]{}"'`]+/).pop() || '';
    const firstChar = lastWord[0];
    const restChars = lastWord.slice(1);
    const isTitleCase =
      firstChar?.toUpperCase() === firstChar && restChars?.toLowerCase() === restChars;
    const isUpperCase = lastWord === lastWord.toUpperCase();
    const getCase = (word: string) => {
      if (isUpperCase) return word.toUpperCase();
      if (isTitleCase) return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
      return word.toLowerCase();
    };

    const allSuggestions = {
      s: [
        'elect distinct',
        'elect count(*) from',
        'elect row_number() over (partition by',
        'elect first_value(column) over (partition by',
        'elect json_agg(column) from',
        'et transaction isolation level serializable',
        'um(case when condition then value end)',
        'tring_agg(column, delimiter) within group (order by)',
        'ession_user',
        "ys_context('current_schema')",
        'elect coalesce(column, default_value)',
        'elect extract(epoch from timestamp)',
        "elect to_char(date, 'YYYY-MM-DD')",
        'elect generate_series(1, 100)',
      ],
      w: [
        'ith recursive cte as (',
        'here exists (',
        'here column_name in (select',
        'indow w as (partition by',
        'hen matched then update set',
        'hen not matched then insert',
        'here column @> array[',
        'here column_name between symmetric',
        'here column_name similar to',
        "here column_name ~ '^[0-9]+$'",
        'ith data',
        'ith check option',
      ],
      c: [
        'reate materialized view if not exists',
        'reate unique index concurrently',
        'oalesce(column, default_value)',
        'ount(distinct column)',
        'reate extension if not exists',
        'reate trigger before insert',
        'ross join lateral',
        'ast(column as type)',
        'urrent_timestamp',
        'urrent_database()',
        'ase when condition then result',
        'onstraint check (condition)',
      ],
      j: [
        'oin lateral',
        'son_build_object(',
        'son_agg(column)',
        'son_array_elements(',
        'son_populate_record(',
        'son_strip_nulls(',
        'son_typeof(',
      ],
      i: [
        'nsert into table (columns)',
        'nner join table using (column)',
        'ntersect',
        'n (select column from',
        'index column using gin',
        'is not null and',
        'is distinct from',
        'into strict',
      ],
      g: [
        'roup by cube (',
        'roup by rollup (',
        'roup by grouping sets',
        'reatest(value1, value2)',
        'enerate_series(',
        'rant select, insert',
      ],
    } as const;

    const defaultSuggestions = [
      'select * from table',
      'create table if not exists',
      'insert into values',
      'update set where',
      'delete from where',
      'alter table add column',
      'drop table cascade',
      'grant all privileges',
    ];

    const key = lastWord.toLowerCase()[0] || '';
    const suggestions =
      key in allSuggestions
        ? allSuggestions[key as keyof typeof allSuggestions]
        : defaultSuggestions;

    return {
      items: getRandomItems([...suggestions], 6).map(text => getCase(text)),
      requestId: 'demo-request',
    };
  },
};

export const javaApi = {
  getCodeAssistSuggestions: async (data: PromptFile[]): Promise<Suggestions> => {
    const beforeCursor = data[0]?.fragments?.[0]?.text || '';
    const lastWord = beforeCursor.split(/[\s.()[\]{}"'`]+/).pop() || '';
    const firstChar = lastWord[0];
    const restChars = lastWord.slice(1);
    const isTitleCase =
      firstChar?.toUpperCase() === firstChar && restChars?.toLowerCase() === restChars;
    const isUpperCase = lastWord === lastWord.toUpperCase();
    const getCase = (word: string) => {
      if (isUpperCase) return word.toUpperCase();
      if (isTitleCase) return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
      return word.toLowerCase();
    };

    const allSuggestions = {
      p: [
        'ublic static void main(String[] args)',
        'rivate final Map<String, List<T>>',
        'rotected override void onDestroy()',
        'ublic CompletableFuture<Response>',
        'rivate static final Logger logger',
        'ublic Stream<T> filter(Predicate<T>)',
        'ackage com.example.project',
        'arseInt(String value)',
        'ath.of("directory", "file")',
        'attern.compile("[a-z]+").matcher()',
      ],
      s: [
        'tatic <T> List<T> of(T... elements)',
        'tream.of(elements).filter(predicate)',
        'tring.format("Hello %s", name)',
        'ystem.getProperty("user.home")',
        'wingUtilities.invokeLater(() ->',
        'upplier<T> factory = () ->',
        'tringBuilder buffer = new',
        'ynchronized(lock) {',
      ],
      c: [
        'lass MyClass implements Interface',
        'ollectors.groupingBy(Function<T,R>)',
        'ollections.unmodifiableList(',
        'oncurrentHashMap<K,V>(',
        'ompletableFuture.supplyAsync(',
        'opyOf(Collection<T> coll)',
        'ompare(Object o1, Object o2)',
        'onfiguration.getDefault()',
      ],
      a: [
        'rrayList<String> list = new',
        'ssertNotNull(object, message)',
        'sync CompletableFuture<T>',
        'tomic Reference<T> ref =',
        'utoCloseable resource =',
        'rrayDeque<E> deque = new',
        'nnotation @interface',
      ],
      i: [
        'nterface Functional<T> {',
        'mplementing class must override',
        'nstanceof String str)',
        'ntStream.range(0, size)',
        'terables.transform(input,',
        'mmutableList.copyOf(',
        'nputStream.read(buffer)',
      ],
      t: [
        'ry (Resource res = new Resource())',
        'hrow new IllegalArgumentException',
        'hrowingSupplier<T, E> supplier',
        'ype inference in generic method',
        'imeUnit.SECONDS.sleep(1)',
        'estNG.createFakeContext()',
      ],
    } as const;

    const defaultSuggestions = [
      'public class Main',
      'private static final',
      'protected void method',
      'interface Functional',
      'abstract class Base',
      'implements Interface',
      'extends BaseClass',
      '@Override',
    ];

    const key = lastWord.toLowerCase()[0] || '';
    const suggestions =
      key in allSuggestions
        ? allSuggestions[key as keyof typeof allSuggestions]
        : defaultSuggestions;

    return {
      items: getRandomItems([...suggestions], 6).map(text => getCase(text)),
      requestId: 'demo-request',
    };
  },
};

const baseConfig = {
  debounceTime: 200,
  textLimits: {
    beforeCursor: 8000,
    afterCursor: 1000,
  },
  suggestionCache: {
    enabled: true,
  },
};

export const sqlConfig = {
  ...baseConfig,
  language: 'sql',
};

export const javaConfig = {
  ...baseConfig,
  language: 'java',
};

export const demoConfig = sqlConfig;

export const demoLanguages = {
  sql: {
    code: `-- Type any letter to see context-aware SQL suggestions
-- Examples (works in any case: lowercase/Titlecase/UPPERCASE):
-- SELECT: Complex queries, window functions, aggregations
-- WITH: Common table expressions, recursive queries
-- CREATE: Tables, views, indexes, extensions
-- JOIN: Various join types and conditions
-- INSERT/UPDATE: Data manipulation
-- GROUP: Advanced grouping and analytics

S`,
    api: sqlApi,
    config: sqlConfig,
  },
  java: {
    code: `// Type any letter to see context-aware Java suggestions
// Examples (works in any case: lowercase/Titlecase/UPPERCASE):
// PUBLIC: Method declarations, class definitions
// STATIC: Utility methods, factory methods
// CLASS: Class definitions, implementations
// INTERFACE: Functional interfaces, default methods
// TRY: Exception handling, resources
// STREAM: Collection processing, filters

P`,
    api: javaApi,
    config: javaConfig,
  },
};

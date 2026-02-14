const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Language = require("./models/Language");
const Topic = require("./models/Topic");
const Subtopic = require("./models/Subtopic");
const Question = require("./models/Question");
const Counter = require("./models/Counter");
const { slugify } = require("./utils/slugify");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      Language.deleteMany({}),
      Topic.deleteMany({}),
      Subtopic.deleteMany({}),
      Question.deleteMany({}),
      Counter.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // --- Languages ---
    const languages = await Language.insertMany([
      {
        name: "JavaScript",
        slug: "javascript",
        description:
          "Core JavaScript fundamentals, ES6+, async patterns, and advanced concepts.",
      },
      {
        name: "Node.js",
        slug: "nodejs",
        description:
          "Server-side JavaScript runtime, Express, APIs, and backend patterns.",
      },
      {
        name: "React",
        slug: "react",
        description:
          "React library, hooks, state management, and component patterns.",
      },
      {
        name: "MongoDB",
        slug: "mongodb",
        description:
          "NoSQL database, Mongoose ODM, aggregation, and data modeling.",
      },
      {
        name: "TypeScript",
        slug: "typescript",
        description:
          "Typed superset of JavaScript, generics, utility types, and best practices.",
      },
    ]);

    const [js, node, react, mongo, ts] = languages;
    console.log(`Created ${languages.length} languages`);

    // --- Topics ---
    const topicsData = [
      // JavaScript
      {
        languageId: js._id,
        name: "Variables & Data Types",
        slug: "variables-data-types",
        order: 1,
      },
      { languageId: js._id, name: "Functions", slug: "functions", order: 2 },
      {
        languageId: js._id,
        name: "Async Programming",
        slug: "async-programming",
        order: 3,
      },
      {
        languageId: js._id,
        name: "Objects & Prototypes",
        slug: "objects-prototypes",
        order: 4,
      },
      {
        languageId: js._id,
        name: "Error Handling",
        slug: "error-handling",
        order: 5,
      },
      // Node.js
      {
        languageId: node._id,
        name: "Core Modules",
        slug: "core-modules",
        order: 1,
      },
      { languageId: node._id, name: "Express.js", slug: "expressjs", order: 2 },
      {
        languageId: node._id,
        name: "File System",
        slug: "file-system",
        order: 3,
      },
      { languageId: node._id, name: "Streams", slug: "streams", order: 4 },
      // React
      {
        languageId: react._id,
        name: "Components",
        slug: "components",
        order: 1,
      },
      { languageId: react._id, name: "Hooks", slug: "hooks", order: 2 },
      {
        languageId: react._id,
        name: "State Management",
        slug: "state-management",
        order: 3,
      },
      { languageId: react._id, name: "Routing", slug: "routing", order: 4 },
      // MongoDB
      {
        languageId: mongo._id,
        name: "CRUD Operations",
        slug: "crud-operations",
        order: 1,
      },
      {
        languageId: mongo._id,
        name: "Aggregation",
        slug: "aggregation",
        order: 2,
      },
      { languageId: mongo._id, name: "Indexing", slug: "indexing", order: 3 },
      // TypeScript
      {
        languageId: ts._id,
        name: "Type System",
        slug: "type-system",
        order: 1,
      },
      { languageId: ts._id, name: "Generics", slug: "generics", order: 2 },
      {
        languageId: ts._id,
        name: "Utility Types",
        slug: "utility-types",
        order: 3,
      },
    ];

    const topics = await Topic.insertMany(topicsData);
    console.log(`Created ${topics.length} topics`);

    // Build a lookup
    const topicMap = {};
    topics.forEach((t) => {
      topicMap[`${t.languageId}-${t.slug}`] = t;
    });

    // --- Subtopics ---
    const jsVars = topicMap[`${js._id}-variables-data-types`];
    const jsFuncs = topicMap[`${js._id}-functions`];
    const jsAsync = topicMap[`${js._id}-async-programming`];
    const nodeExpress = topicMap[`${node._id}-expressjs`];
    const reactHooks = topicMap[`${react._id}-hooks`];

    const subtopicsData = [
      {
        topicId: jsVars._id,
        name: "var vs let vs const",
        slug: "var-let-const",
        order: 1,
      },
      {
        topicId: jsVars._id,
        name: "Type Coercion",
        slug: "type-coercion",
        order: 2,
      },
      {
        topicId: jsFuncs._id,
        name: "Arrow Functions",
        slug: "arrow-functions",
        order: 1,
      },
      { topicId: jsFuncs._id, name: "Closures", slug: "closures", order: 2 },
      { topicId: jsAsync._id, name: "Promises", slug: "promises", order: 1 },
      {
        topicId: jsAsync._id,
        name: "Async/Await",
        slug: "async-await",
        order: 2,
      },
      {
        topicId: nodeExpress._id,
        name: "Middleware",
        slug: "middleware",
        order: 1,
      },
      { topicId: nodeExpress._id, name: "Routing", slug: "routing", order: 2 },
      { topicId: reactHooks._id, name: "useState", slug: "usestate", order: 1 },
      {
        topicId: reactHooks._id,
        name: "useEffect",
        slug: "useeffect",
        order: 2,
      },
      {
        topicId: reactHooks._id,
        name: "Custom Hooks",
        slug: "custom-hooks",
        order: 3,
      },
    ];

    const subtopics = await Subtopic.insertMany(subtopicsData);
    console.log(`Created ${subtopics.length} subtopics`);

    const subMap = {};
    subtopics.forEach((s) => {
      subMap[`${s.topicId}-${s.slug}`] = s;
    });

    // --- Questions ---
    const questionsData = [
      // JavaScript - Variables
      {
        lang: js,
        topic: jsVars,
        sub: subMap[`${jsVars._id}-var-let-const`],
        title: "What is the difference between var, let, and const?",
        questionText:
          "Explain the differences between var, let, and const in JavaScript. When would you use each one?",
        answerText:
          "`var` is function-scoped and hoisted. `let` and `const` are block-scoped. `const` cannot be reassigned after initialization, while `let` can. Use `const` by default, `let` when reassignment is needed, and avoid `var` in modern code.",
        difficulty: "Easy",
        type: "Theory",
        tags: ["variables", "scope", "hoisting"],
      },
      {
        lang: js,
        topic: jsVars,
        sub: subMap[`${jsVars._id}-type-coercion`],
        title: "What is type coercion in JavaScript?",
        questionText:
          "Explain type coercion in JavaScript with examples. What is the difference between == and ===?",
        answerText:
          'Type coercion is the automatic conversion of values from one type to another. `==` performs type coercion before comparison (loose equality), while `===` does not (strict equality). Example: `"5" == 5` is true, but `"5" === 5` is false.',
        difficulty: "Easy",
        type: "Theory",
        tags: ["coercion", "equality"],
      },
      {
        lang: js,
        topic: jsVars,
        sub: null,
        title: "What are the primitive data types in JavaScript?",
        questionText:
          "List and explain all primitive data types in JavaScript.",
        answerText:
          "JavaScript has 7 primitive types: String, Number, BigInt, Boolean, undefined, null, and Symbol. Primitives are immutable and compared by value.",
        difficulty: "Easy",
        type: "Theory",
        tags: ["primitives", "data-types"],
      },

      // JavaScript - Functions
      {
        lang: js,
        topic: jsFuncs,
        sub: subMap[`${jsFuncs._id}-closures`],
        title: "What is a closure in JavaScript?",
        questionText:
          "Explain closures in JavaScript. Provide a practical example where closures are useful.",
        answerText:
          "A closure is a function that retains access to its outer (enclosing) function's variables even after the outer function has returned. Closures are commonly used for data privacy, factory functions, and event handlers.",
        difficulty: "Medium",
        type: "Both",
        tags: ["closures", "scope"],
      },
      {
        lang: js,
        topic: jsFuncs,
        sub: subMap[`${jsFuncs._id}-arrow-functions`],
        title: "Arrow functions vs regular functions",
        questionText:
          "What are the key differences between arrow functions and regular functions in JavaScript?",
        answerText:
          "Arrow functions: 1) No own `this` binding (inherits from enclosing scope), 2) Cannot be used as constructors, 3) No `arguments` object, 4) Cannot be used as generators, 5) Shorter syntax for simple functions.",
        difficulty: "Medium",
        type: "Theory",
        tags: ["functions", "arrow-functions", "this"],
      },
      {
        lang: js,
        topic: jsFuncs,
        sub: null,
        title: "What is a higher-order function?",
        questionText:
          "Define higher-order functions and give examples of built-in higher-order functions in JavaScript.",
        answerText:
          "A higher-order function is a function that takes one or more functions as arguments or returns a function. Examples: map(), filter(), reduce(), forEach(), sort().",
        difficulty: "Easy",
        type: "Both",
        tags: ["higher-order", "functional"],
      },

      // JavaScript - Async
      {
        lang: js,
        topic: jsAsync,
        sub: subMap[`${jsAsync._id}-promises`],
        title: "What is a Promise in JavaScript?",
        questionText:
          "Explain Promises in JavaScript. What are the three states of a Promise?",
        answerText:
          "A Promise represents a value that may be available now, in the future, or never. The three states are: Pending (initial), Fulfilled (resolved successfully), and Rejected (failed). You can chain `.then()` for success and `.catch()` for errors.",
        difficulty: "Medium",
        type: "Theory",
        tags: ["promises", "async"],
      },
      {
        lang: js,
        topic: jsAsync,
        sub: subMap[`${jsAsync._id}-async-await`],
        title: "Explain async/await",
        questionText:
          "What is async/await in JavaScript? How does it differ from using .then() chains?",
        answerText:
          "async/await is syntactic sugar over Promises. An `async` function always returns a Promise. `await` pauses execution until the Promise settles. It provides cleaner, more readable code compared to `.then()` chains, especially for sequential async operations.",
        difficulty: "Medium",
        type: "Both",
        tags: ["async", "await", "promises"],
      },
      {
        lang: js,
        topic: jsAsync,
        sub: null,
        title: "What is the Event Loop?",
        questionText:
          "Explain the JavaScript Event Loop. How does it handle asynchronous operations?",
        answerText: "",
        difficulty: "Hard",
        type: "Theory",
        tags: ["event-loop", "async", "runtime"],
      },

      // Node.js
      {
        lang: node,
        topic: topicMap[`${node._id}-core-modules`],
        sub: null,
        title: "What is the Node.js event loop?",
        questionText:
          "How does the Node.js event loop work? How is it different from the browser event loop?",
        answerText:
          "Node.js uses libuv for its event loop with multiple phases: timers, pending callbacks, idle/prepare, poll, check, close callbacks. It processes I/O asynchronously using a thread pool for operations like file system access.",
        difficulty: "Hard",
        type: "Theory",
        tags: ["event-loop", "libuv"],
      },
      {
        lang: node,
        topic: nodeExpress,
        sub: subMap[`${nodeExpress._id}-middleware`],
        title: "What is middleware in Express.js?",
        questionText:
          "Explain middleware in Express.js. What are the different types of middleware?",
        answerText:
          "Middleware functions have access to req, res, and next. Types: Application-level, Router-level, Error-handling, Built-in (express.json, express.static), Third-party (cors, helmet).",
        difficulty: "Easy",
        type: "Theory",
        tags: ["express", "middleware"],
      },
      {
        lang: node,
        topic: nodeExpress,
        sub: subMap[`${nodeExpress._id}-routing`],
        title: "Explain Express routing",
        questionText:
          "How does routing work in Express.js? Explain route parameters, query strings, and route grouping.",
        answerText: "",
        difficulty: "Medium",
        type: "Both",
        tags: ["express", "routing"],
      },
      {
        lang: node,
        topic: topicMap[`${node._id}-streams`],
        sub: null,
        title: "What are Node.js Streams?",
        questionText:
          "Explain streams in Node.js. What are the different types of streams?",
        answerText:
          "Streams are collections of data that might not be available all at once. Types: Readable, Writable, Duplex, Transform. They are memory-efficient for processing large amounts of data.",
        difficulty: "Hard",
        type: "Theory",
        tags: ["streams", "performance"],
      },

      // React
      {
        lang: react,
        topic: topicMap[`${react._id}-components`],
        sub: null,
        title: "Functional vs Class Components",
        questionText:
          "What are the differences between functional and class components in React?",
        answerText:
          "Functional components are simpler, use hooks for state/lifecycle, and are the recommended approach. Class components use lifecycle methods and this.state. Functional components are easier to test, read, and compose.",
        difficulty: "Easy",
        type: "Theory",
        tags: ["components", "functional", "class"],
      },
      {
        lang: react,
        topic: reactHooks,
        sub: subMap[`${reactHooks._id}-usestate`],
        title: "How does useState work?",
        questionText:
          "Explain the useState hook in React. How do you update state correctly?",
        answerText:
          "useState returns a state variable and setter function. For primitive values, call the setter with the new value. For updates based on previous state, use the callback form: setState(prev => prev + 1). State updates are batched and asynchronous.",
        difficulty: "Easy",
        type: "Both",
        tags: ["hooks", "state"],
      },
      {
        lang: react,
        topic: reactHooks,
        sub: subMap[`${reactHooks._id}-useeffect`],
        title: "Explain useEffect hook",
        questionText:
          "What is the useEffect hook? Explain its dependency array and cleanup function.",
        answerText: "",
        difficulty: "Medium",
        type: "Theory",
        tags: ["hooks", "effects", "lifecycle"],
      },
      {
        lang: react,
        topic: topicMap[`${react._id}-state-management`],
        sub: null,
        title: "Context API vs Redux",
        questionText:
          "Compare React Context API and Redux. When would you choose one over the other?",
        answerText:
          "Context is built-in and good for low-frequency updates (theme, auth). Redux offers middleware, dev tools, and time-travel debugging for complex state. Use Context for simple, infrequent updates; Redux for complex, frequently changing global state.",
        difficulty: "Medium",
        type: "Theory",
        tags: ["context", "redux", "state"],
      },

      // MongoDB
      {
        lang: mongo,
        topic: topicMap[`${mongo._id}-crud-operations`],
        sub: null,
        title: "MongoDB CRUD Operations",
        questionText:
          "Explain the basic CRUD operations in MongoDB with examples.",
        answerText:
          "Create: insertOne/insertMany. Read: find/findOne with query filters. Update: updateOne/updateMany with $set, $inc, etc. Delete: deleteOne/deleteMany. All operations use document-based query syntax.",
        difficulty: "Easy",
        type: "Both",
        tags: ["crud", "basics"],
      },
      {
        lang: mongo,
        topic: topicMap[`${mongo._id}-aggregation`],
        sub: null,
        title: "What is the Aggregation Pipeline?",
        questionText:
          "Explain the MongoDB aggregation pipeline. What are common stages?",
        answerText:
          "The aggregation pipeline processes documents through stages. Common stages: $match (filter), $group (aggregate), $sort, $project (reshape), $lookup (join), $unwind (deconstruct arrays), $limit, $skip.",
        difficulty: "Medium",
        type: "Both",
        tags: ["aggregation", "pipeline"],
      },
      {
        lang: mongo,
        topic: topicMap[`${mongo._id}-indexing`],
        sub: null,
        title: "MongoDB Indexing Strategies",
        questionText:
          "What are indexes in MongoDB? What types of indexes are available?",
        answerText: "",
        difficulty: "Hard",
        type: "Theory",
        tags: ["indexes", "performance"],
      },

      // TypeScript
      {
        lang: ts,
        topic: topicMap[`${ts._id}-type-system`],
        sub: null,
        title: "Interface vs Type Alias",
        questionText:
          "What is the difference between interface and type alias in TypeScript?",
        answerText:
          "Interfaces support declaration merging and extends. Type aliases support unions, intersections, tuples, and mapped types. Both can describe object shapes. Use interfaces for object shapes that may be extended; types for unions/complex types.",
        difficulty: "Medium",
        type: "Theory",
        tags: ["interface", "type-alias"],
      },
      {
        lang: ts,
        topic: topicMap[`${ts._id}-generics`],
        sub: null,
        title: "What are Generics in TypeScript?",
        questionText:
          "Explain generics in TypeScript. When and why would you use them?",
        answerText:
          "Generics allow creating reusable components that work with multiple types while maintaining type safety. They act as type variables: function identity<T>(arg: T): T. Use them for reusable functions, classes, and interfaces that should work with various types.",
        difficulty: "Medium",
        type: "Both",
        tags: ["generics", "type-safety"],
      },
      {
        lang: ts,
        topic: topicMap[`${ts._id}-utility-types`],
        sub: null,
        title: "Explain TypeScript Utility Types",
        questionText:
          "What are utility types in TypeScript? List common ones with examples.",
        answerText: "",
        difficulty: "Hard",
        type: "Theory",
        tags: ["utility-types", "advanced"],
      },
    ];

    // Create questions with proper numbering via Counter
    const langCounters = {};
    for (const q of questionsData) {
      const langId = q.lang._id;
      if (!langCounters[langId]) langCounters[langId] = 0;
      langCounters[langId]++;

      await Question.create({
        languageId: langId,
        topicId: q.topic._id,
        subtopicId: q.sub ? q.sub._id : null,
        questionNumber: langCounters[langId],
        title: q.title,
        questionText: q.questionText,
        answerText: q.answerText,
        difficulty: q.difficulty,
        type: q.type,
        tags: q.tags,
      });
    }

    // Update counters
    for (const [langId, count] of Object.entries(langCounters)) {
      await Counter.findOneAndUpdate(
        { languageId: langId },
        { seq: count },
        { upsert: true },
      );
    }

    console.log(`Created ${questionsData.length} questions`);
    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();

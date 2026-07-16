---
title: "SQL Injection: Best Practices for Safer Queries"
slug: "sql-injection-best-practices"
coverImage: "/media/blog/sql-injection-best-practices.png"
excerpt: "Parameterized queries are the easy 90%. Here's what the other 10% of SQL injection prevention actually looks like in production code."
date: "2026-01-19"
---

SQL injection has been on the OWASP Top 10 for two decades, and it still shows up in production code, usually not because someone forgot parameterized queries exist, but because of everything around them: a raw query escape hatch, an ORM method that quietly accepts a string, a search feature that concatenates a "sort by" column name instead of a value. Here's what actually holds up.

## Parameterized queries, always

This is the non-negotiable baseline. The database driver should build the query with placeholders and bind values separately, so user input is never treated as SQL syntax.

```js
// Vulnerable: string concatenation
const result = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);

// Safe: parameterized
const result = await db.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);
```

The difference isn't stylistic. In the first version, an email value like `' OR '1'='1` changes what the query does. In the second, it's just a string being compared, no matter what's inside it.

## ORMs don't save you automatically

An ORM makes the safe path the default path, but every major one still has a raw-query escape hatch, and that's where injection sneaks back in. Prisma's `$queryRawUnsafe`, Sequelize's `literal()`, TypeORM's `query()` with string interpolation, all of them will happily run whatever SQL you hand them. The bug isn't the ORM, it's forgetting that the escape hatch has none of the protections the rest of the library gives you for free. If a raw query is genuinely necessary, it still needs bound parameters, not template literals.

## Column names and identifiers can't be parameterized

Placeholders work for values, not for table or column names. A "sort by" or "filter by" feature that lets a user pick a column is a common place this gets missed, since the instinct is to treat it like any other input.

```js
// Vulnerable: interpolated identifier
const rows = await db.query(`SELECT * FROM orders ORDER BY ${sortColumn}`);

// Safe: allowlist the identifier, then interpolate the validated value
const allowedColumns = ["created_at", "total", "status"];
if (!allowedColumns.includes(sortColumn)) {
  throw new Error("Invalid sort column");
}
const rows = await db.query(`SELECT * FROM orders ORDER BY ${sortColumn}`);
```

The interpolation is still there in the safe version, that's unavoidable for identifiers, but it's only ever interpolating a value that's already been checked against a fixed list, never the raw input.

## Least privilege at the database level

Parameterized queries prevent the injection. A least-privilege database user limits the damage if something still gets through, whether that's an injection you missed, a compromised dependency, or a bug in a library you trust. The application's database user shouldn't be able to drop tables, alter schema, or read tables it has no reason to touch. Splitting read and write access into separate roles, and giving reporting or analytics queries a read-only user, means a bad query can misbehave without becoming a full compromise.

## Error messages shouldn't hand over the schema

A raw database error surfaced to the client is a reconnaissance tool for whoever is probing the input. Table names, column names, and the shape of the query itself leak straight through a stack trace. Catch database errors at the boundary, log the detail server-side, and return something generic to the client. This one is easy to skip in development and easy to forget to undo before shipping.

## Input validation is a second layer, not the first

Validating and allowlisting input is worth doing, rejecting obviously malformed values early, constraining types, checking length, but it's a defense-in-depth layer, not the mechanism that actually prevents injection. Parameterization is what prevents injection. Validation just narrows what has to be handled and catches mistakes earlier. Treating input sanitization as the primary defense is how people end up hand-rolling regex filters that miss an encoding edge case a parameterized query would have made irrelevant from the start.

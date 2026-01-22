# Review

I noticed that there are some inconsistencies:

## HIGH Priority Issues

### Security Concerns

**`middleware/auth.middleware.ts`**

- Security risk: Should use JWT token instead or some other mechanism for identifying that the FE is authenticated. Usually see cookies or a JWT token in the headers with userId being parsed out and the token is signed by a trusted source. Currently relying on `X-Auth-User-Id` header which can be easily spoofed.

**`controllers/notifications/index.ts`**

- `getForUser()`: Should there be a limit and sort order? What if the user has thousands of notifications over their lifetime? This could cause performance issues and memory problems.

## MEDIUM Priority Issues

### Code Consistency & Architecture

**`controllers/notifications/index.ts`**

- Deprecation note is incorrect - it should be a TODO since `NotificationsController` is not deprecated, only the query layer is deprecated.
- `getForUser()`: Since the queries are deprecated, should we go direct via the Prisma ORM? It seems like what all the other calls are doing (e.g., `getUnreadCount` uses Prisma directly).

**`middleware/auth.middleware.ts`**

- Why not use the prisma client from `$prisma/client`? Now we have 2 prisma clients in the backend (one here, one imported elsewhere).

**`models/notification.model.ts`**

- Don't see `Notification` in the prisma client, is this imported correctly?

**`queries/notification.queries.ts`**

- `getUnreadCountForUsers()`: This method is incomplete - has a TODO but no implementation.

**`notifications.entity.ts`**

- It's not clear if you want to use the repository code pattern (route -> controller -> service -> repository -> ORM -> postgres) or use the ORM directly like in the users service (route -> controller -> service -> ORM -> postgres). You should pick one and keep it consistent so future contributers knows which to follow.

## LOW Priority Issues

**`models/notification.model.ts`**

- This code is not used anymore. You can delete this file.

## Unused Routes

**`routes/notifications.router.ts`**

- `GET /` (getForUser): This is unused by the frontend, do we need it?
- `POST /` (create): This is unused by the frontend, do we need it?

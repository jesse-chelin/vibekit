# Adding a Model

## 1. Define in Prisma

Add to `prisma/schema.prisma`:
```prisma
model Recipe {
  id          String   @id @default(cuid())
  title       String
  description String?
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

Add the relation to the User model in `prisma/schema.prisma`.

## 2. Push to database
```bash
pnpm db:push
```

## 3. Create tRPC router

Create `src/trpc/routers/recipe.ts` following the pattern in `project.ts`.
Add to `src/trpc/router.ts`.

## 4. Create pages

- List: `src/app/(app)/recipes/page.tsx` with DataTable
- Create: `src/app/(app)/recipes/new/page.tsx` with form
- Detail: `src/app/(app)/recipes/[id]/page.tsx` with DetailLayout
- Edit: `src/app/(app)/recipes/[id]/edit/page.tsx` with form

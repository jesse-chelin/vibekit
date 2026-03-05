import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@vibekit.dev" },
    update: {},
    create: {
      email: "demo@vibekit.dev",
      name: "Demo User",
      role: "admin",
    },
  });

  const projects = await Promise.all(
    [
      { name: "Website Redesign", description: "Modernize the company website with new branding", status: "active", priority: "high" },
      { name: "Mobile App", description: "Build a native mobile companion app", status: "active", priority: "high" },
      { name: "API Integration", description: "Connect with third-party services for data sync", status: "active", priority: "medium" },
      { name: "Documentation", description: "Write comprehensive developer docs", status: "completed", priority: "low" },
      { name: "Analytics Dashboard", description: "Real-time metrics and reporting interface", status: "active", priority: "medium" },
    ].map((project) =>
      prisma.project.create({
        data: { ...project, userId: user.id },
      })
    )
  );

  const taskData = [
    { title: "Design system audit", status: "completed", priority: "high", projectId: projects[0].id },
    { title: "Homepage wireframes", status: "in_progress", priority: "high", projectId: projects[0].id },
    { title: "Color palette selection", status: "todo", priority: "medium", projectId: projects[0].id },
    { title: "Responsive testing", status: "todo", priority: "medium", projectId: projects[0].id },
    { title: "Set up React Native", status: "completed", priority: "high", projectId: projects[1].id },
    { title: "Navigation structure", status: "in_progress", priority: "high", projectId: projects[1].id },
    { title: "Push notifications", status: "todo", priority: "medium", projectId: projects[1].id },
    { title: "OAuth flow setup", status: "completed", priority: "high", projectId: projects[2].id },
    { title: "Webhook handlers", status: "in_progress", priority: "medium", projectId: projects[2].id },
    { title: "Rate limiting", status: "todo", priority: "low", projectId: projects[2].id },
    { title: "Getting started guide", status: "completed", priority: "high", projectId: projects[3].id },
    { title: "API reference", status: "completed", priority: "high", projectId: projects[3].id },
    { title: "Chart components", status: "in_progress", priority: "high", projectId: projects[4].id },
    { title: "Data export feature", status: "todo", priority: "medium", projectId: projects[4].id },
    { title: "Real-time updates", status: "todo", priority: "high", projectId: projects[4].id },
  ];

  await Promise.all(
    taskData.map((task) =>
      prisma.task.create({
        data: { ...task, userId: user.id },
      })
    )
  );

  console.log("Seeded: 1 user, 5 projects, 15 tasks");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

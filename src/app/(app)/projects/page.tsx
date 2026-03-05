import { trpc, HydrateClient } from "@/trpc/server";
import { ProjectList } from "./_components/project-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  void trpc.project.list.prefetch({});
  return (
    <HydrateClient>
      <ProjectList />
    </HydrateClient>
  );
}

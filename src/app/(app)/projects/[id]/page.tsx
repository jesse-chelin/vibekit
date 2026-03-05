import { PageHeader } from "@/components/layout/page-header";
import { DetailLayout } from "@/components/patterns/detail-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Redesign"
        description="Modernize the company website with new branding"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <DetailLayout
        sidebar={
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <Badge variant="secondary">High</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasks</span>
                <span>4</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>Jan 15, 2024</span>
              </div>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Design system audit", "Homepage wireframes", "Color palette selection", "Responsive testing"].map((task, i) => (
                <div key={task} className="flex items-center gap-3 rounded-md border p-3">
                  <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-success" : i === 1 ? "bg-primary" : "bg-muted-foreground"}`} />
                  <span className="text-sm">{task}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {i === 0 ? "completed" : i === 1 ? "in progress" : "todo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DetailLayout>
    </div>
  );
}

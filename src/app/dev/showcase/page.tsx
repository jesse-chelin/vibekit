"use client";

import { useState } from "react";
import {
  FolderOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Settings,
  Mail,
  Bell,
  LayoutDashboard,
  MoreHorizontal,
  ArrowUpDown,
  Zap,
  Inbox,
  ChevronRight,
  Users,
  Filter,
  Download,
  Calendar,
  LogOut,
  User,
  CreditCard,
  AlertTriangle,
  Star,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  Archive,
  ChevronDown,
  Hash,
  FileText,
  BarChart3,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Send,
  Paperclip,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StatCard } from "@/components/patterns/stat-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { ActivityFeed } from "@/components/patterns/activity-feed";
import { ChartCard } from "@/components/patterns/chart-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FolderOpen, label: "Projects", badge: "12" },
  { icon: CheckCircle2, label: "Tasks", badge: "3" },
  { icon: Users, label: "Team" },
  { icon: Mail, label: "Messages" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const tasks = [
  { name: "Design system audit", status: "active", priority: "high", assignee: "BM", due: "Mar 8" },
  { name: "API rate limiting", status: "active", priority: "medium", assignee: "JD", due: "Mar 12" },
  { name: "Dashboard charts", status: "completed", priority: "low", assignee: "AK", due: "Mar 5" },
  { name: "Auth flow redesign", status: "active", priority: "high", assignee: "BM", due: "Mar 15" },
  { name: "Email templates", status: "active", priority: "medium", assignee: "LS", due: "Mar 18" },
];

const recentActivity = [
  { id: "1", user: { name: "Bernard M." }, action: "completed task", target: "Design system audit", timestamp: new Date(Date.now() - 3600000) },
  { id: "2", user: { name: "Jane D." }, action: "created project", target: "Analytics Dashboard", timestamp: new Date(Date.now() - 7200000) },
  { id: "3", user: { name: "Alex K." }, action: "commented on", target: "Homepage wireframes", timestamp: new Date(Date.now() - 14400000) },
  { id: "4", user: { name: "Bernard M." }, action: "updated task", target: "API rate limiting", timestamp: new Date(Date.now() - 86400000) },
];

// ─── Chart Data ──────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 4900 },
  { month: "Apr", revenue: 7200 },
  { month: "May", revenue: 6800 },
  { month: "Jun", revenue: 8400 },
];

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const tasksByStatusData = [
  { month: "Jan", completed: 32, inProgress: 12, overdue: 4 },
  { month: "Feb", completed: 28, inProgress: 18, overdue: 6 },
  { month: "Mar", completed: 45, inProgress: 10, overdue: 2 },
  { month: "Apr", completed: 38, inProgress: 15, overdue: 5 },
  { month: "May", completed: 52, inProgress: 8, overdue: 3 },
  { month: "Jun", completed: 41, inProgress: 14, overdue: 1 },
];

const tasksConfig = {
  completed: { label: "Completed", color: "var(--chart-2)" },
  inProgress: { label: "In Progress", color: "var(--chart-3)" },
  overdue: { label: "Overdue", color: "var(--chart-5)" },
} satisfies ChartConfig;

const activeUsersData = [
  { month: "Jan", desktop: 1200, mobile: 800 },
  { month: "Feb", desktop: 1400, mobile: 950 },
  { month: "Mar", desktop: 1100, mobile: 1100 },
  { month: "Apr", desktop: 1600, mobile: 1250 },
  { month: "May", desktop: 1500, mobile: 1400 },
  { month: "Jun", desktop: 1800, mobile: 1600 },
];

const activeUsersConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-4)" },
} satisfies ChartConfig;

const projectDistributionData = [
  { name: "Engineering", value: 35 },
  { name: "Design", value: 20 },
  { name: "Marketing", value: 18 },
  { name: "Sales", value: 15 },
  { name: "Support", value: 12 },
];

const projectDistributionConfig = {
  Engineering: { label: "Engineering", color: "var(--chart-1)" },
  Design: { label: "Design", color: "var(--chart-2)" },
  Marketing: { label: "Marketing", color: "var(--chart-3)" },
  Sales: { label: "Sales", color: "var(--chart-4)" },
  Support: { label: "Support", color: "var(--chart-5)" },
} satisfies ChartConfig;

const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function MockSidebar() {
  return (
    <div className="w-60 shrink-0 bg-sidebar">
      <div className="flex h-full flex-col text-sidebar-foreground">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-2 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
            Vibekit
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-2">
          <p className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/50">
            Navigation
          </p>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="h-5 shrink-0 min-w-[20px] justify-center px-1.5 text-[10px]"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 outline-none hover:bg-sidebar-accent">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-xs">BM</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">Bernard M.</p>
                <p className="truncate text-xs text-sidebar-foreground/50">
                  bernard@example.com
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function MockTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-4" style={{ backgroundColor: "var(--overlay-bg)", backdropFilter: "blur(16px) saturate(1.4)", WebkitBackdropFilter: "blur(16px) saturate(1.4)" }}>
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">Overview</span>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search (Cmd+K)</TooltipContent>
        </Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="sr-only">2 notifications</span>
              <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground">
                2
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">
                You have 2 unread messages.
              </p>
            </div>
            <div className="divide-y">
              {[
                { title: "New comment on Design system audit", desc: "Alex K. left a comment on your task.", time: "2 min ago" },
                { title: "Project milestone reached", desc: "VibeKit Core hit 85% completion.", time: "1 hour ago" },
                { title: "Weekly digest ready", desc: "Your team completed 12 tasks this week.", time: "3 hours ago" },
              ].map((notif) => (
                <button
                  type="button"
                  key={notif.title}
                  className="flex w-full gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t px-4 py-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">BM</AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent>Bernard M.</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [switchChecked, setSwitchChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-sidebar p-0">
        <MockSidebar />
        <div className="flex flex-1 flex-col min-w-0 m-2 ml-0 rounded-xl bg-background border border-border/50 overflow-hidden shadow-lg">
          <div className="flex-1 overflow-y-auto">
          <MockTopbar />
          <main className="p-4 md:p-6">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome back! Here&apos;s an overview of your projects.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-3.5 w-3.5" />
                    Mar 1 – Mar 7
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>
                          Add a new project to your workspace.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-2">
                        <div className="space-y-3">
                          <Label htmlFor="project-name">Name</Label>
                          <Input id="project-name" placeholder="My Project" />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="project-desc">Description</Label>
                          <Textarea
                            id="project-desc"
                            placeholder="What is this project about?"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label>Priority</Label>
                            <Select defaultValue="medium">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label>Status</Label>
                            <Select defaultValue="active">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label>Visibility</Label>
                          <RadioGroup defaultValue="private" className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="private" id="vis-private" />
                              <Label htmlFor="vis-private" className="font-normal flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5" /> Private
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="public" id="vis-public" />
                              <Label htmlFor="vis-public" className="font-normal flex items-center gap-1.5">
                                <Globe className="h-3.5 w-3.5" /> Public
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button>Create Project</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Projects"
                  value="24"
                  icon={FolderOpen}
                  iconColor="text-blue-500"
                  trend={{ value: 12, label: "from last month" }}
                />
                <StatCard
                  title="Completed"
                  value="142"
                  icon={CheckCircle2}
                  iconColor="text-emerald-500"
                  trend={{ value: 8, label: "from last month" }}
                />
                <StatCard
                  title="In Progress"
                  value="7"
                  icon={Clock}
                  iconColor="text-amber-500"
                  trend={{ value: -3, label: "from last month" }}
                />
                <StatCard
                  title="Completion Rate"
                  value="94%"
                  icon={TrendingUp}
                  iconColor="text-violet-500"
                  trend={{ value: 5, label: "from last month" }}
                />
              </div>

              {/* Tabs — Tasks / Activity / Settings / Archive */}
              <Tabs defaultValue="tasks">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="empty">Archive</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Recent Tasks</CardTitle>
                          <CardDescription>
                            Manage and track your team&apos;s tasks.
                          </CardDescription>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search tasks..."
                            aria-label="Search tasks"
                            className="h-8 w-[200px] pl-8 text-xs"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[30px]">
                                <Checkbox aria-label="Select all tasks" />
                              </TableHead>
                              <TableHead>
                                <div className="flex items-center gap-1">
                                  Task <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Assignee</TableHead>
                              <TableHead>Due</TableHead>
                              <TableHead className="w-[40px]" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tasks.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell>
                                  <Checkbox checked={row.status === "completed"} aria-label={`Select ${row.name}`} />
                                </TableCell>
                                <TableCell className="font-medium">{row.name}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      row.status === "active"
                                        ? "bg-success/10 text-success border-transparent"
                                        : "bg-muted text-muted-foreground border-transparent"
                                    }
                                  >
                                    {row.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={
                                      row.priority === "high"
                                        ? "bg-destructive/10 text-destructive border-transparent"
                                        : row.priority === "medium"
                                          ? "bg-warning/10 text-warning border-transparent"
                                          : "bg-muted text-muted-foreground border-transparent"
                                    }
                                  >
                                    {row.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px]">
                                          {row.assignee}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>{row.assignee}</TooltipContent>
                                  </Tooltip>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {row.due}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon-xs">
                                        <MoreHorizontal />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Star className="mr-2 h-3.5 w-3.5" /> Favourite
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t pt-6 text-xs text-muted-foreground">
                      <span>Showing 5 of 24 tasks</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="xs" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="xs">
                          Next
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>What your team has been up to.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ActivityFeed items={recentActivity} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Progress</CardTitle>
                        <CardDescription>Active project completion rates.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: "VibeKit Core", progress: 85 },
                          { name: "Analytics Dashboard", progress: 42 },
                          { name: "Mobile App", progress: 15 },
                        ].map((project) => (
                          <div key={project.name} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span>{project.name}</span>
                              <span className="text-muted-foreground">
                                {project.progress}%
                              </span>
                            </div>
                            <Progress value={project.progress} />
                          </div>
                        ))}
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Active projects</span>
                            <span className="font-medium">4</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tasks due this week</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Overdue tasks</span>
                            <span className="font-medium text-destructive">1</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Settings</CardTitle>
                      <CardDescription>
                        Configure your workspace preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                          <Label htmlFor="ws-name">Workspace Name</Label>
                          <Input id="ws-name" defaultValue="VibeKit" />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="ws-url">Workspace URL</Label>
                          <Input id="ws-url" defaultValue="vibekit app" aria-invalid="true" />
                          <FieldError>URL cannot contain spaces.</FieldError>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="ws-desc">Description</Label>
                        <Textarea
                          id="ws-desc"
                          placeholder="Describe your workspace..."
                          rows={3}
                          aria-invalid="true"
                        />
                        <FieldError>Description is required.</FieldError>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="ws-api">API Key</Label>
                        <div className="relative">
                          <Input
                            id="ws-api"
                            type={showPassword ? "text" : "password"}
                            defaultValue="sk-vk-1234567890abcdef"
                          />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Default Priority</Label>
                        <RadioGroup defaultValue="medium" className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="low" id="s-low" />
                            <Label htmlFor="s-low" className="font-normal">Low</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="medium" id="s-medium" />
                            <Label htmlFor="s-medium" className="font-normal">Medium</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="high" id="s-high" />
                            <Label htmlFor="s-high" className="font-normal">High</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive updates about project activity.
                          </p>
                        </div>
                        <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-xs text-muted-foreground">
                            Add an extra layer of security.
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="s-agree" defaultChecked />
                        <Label htmlFor="s-agree" className="font-normal">
                          Allow team members to invite others
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2 border-t pt-6">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Empty Tab */}
                <TabsContent value="empty" className="mt-4">
                  <EmptyState
                    icon={Inbox}
                    title="No archived items"
                    description="Items you archive will appear here for easy reference."
                    action={{ label: "Browse Projects", onClick: () => {} }}
                  />
                </TabsContent>
              </Tabs>

              {/* Bottom section: Buttons / Badges / Overlays */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Buttons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Buttons</CardTitle>
                    <CardDescription>All button variants and sizes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button>Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="link">Link</Button>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="xs">Extra Small</Button>
                      <Button size="sm">Small</Button>
                      <Button>Default</Button>
                      <Button size="lg">Large</Button>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      <Button disabled>Disabled</Button>
                      <Button variant="outline" disabled>Disabled</Button>
                      <Button>
                        <Send className="h-4 w-4" />
                        With Icon
                      </Button>
                      <Button variant="outline">
                        <Paperclip className="h-4 w-4" />
                        Attach
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Badges & Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Badges & Status</CardTitle>
                    <CardDescription>Badge variants and status indicators.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-success/10 text-success border-transparent">Active</Badge>
                      <Badge className="bg-warning/10 text-warning border-transparent">Pending</Badge>
                      <Badge className="bg-destructive/10 text-destructive border-transparent">Overdue</Badge>
                      <Badge className="bg-blue-500/10 text-blue-500 border-transparent">Info</Badge>
                      <Badge className="bg-muted text-muted-foreground border-transparent">Archived</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {["BM", "JD", "AK", "LS"].map((initials) => (
                          <Avatar key={initials} className="border-2 border-background">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">4 team members</span>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_6px_2px] shadow-success/40" />
                        <span>Online</span>
                        <span className="ml-auto text-muted-foreground">3 users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-warning shadow-[0_0_6px_2px] shadow-warning/40" />
                        <span>Away</span>
                        <span className="ml-auto text-muted-foreground">1 user</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span>Offline</span>
                        <span className="ml-auto text-muted-foreground">2 users</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Overlays */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overlays</CardTitle>
                    <CardDescription>Dialogs, sheets, and popovers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4" />
                          Open Dialog
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Action</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to proceed? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-3 rounded-lg border p-3 bg-destructive/5">
                          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            This will permanently delete 3 items from your workspace.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button variant="destructive">Delete Items</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4" />
                          Open Sheet
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Task Details</SheetTitle>
                          <SheetDescription>
                            View and edit task information.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label>Task Name</Label>
                              <Input defaultValue="Design system audit" />
                            </div>
                            <div className="space-y-3">
                              <Label>Description</Label>
                              <Textarea
                                defaultValue="Review all components for consistency and accessibility compliance."
                                rows={4}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label>Priority</Label>
                                <Select defaultValue="high">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-3">
                                <Label>Status</Label>
                                <Select defaultValue="active">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="review">In Review</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Mark as urgent</Label>
                                <p className="text-xs text-muted-foreground">Escalate to team leads.</p>
                              </div>
                              <Switch />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="sheet-notify" defaultChecked />
                              <Label htmlFor="sheet-notify" className="font-normal">
                                Notify assignee of changes
                              </Label>
                            </div>
                          </div>
                        </div>
                        <SheetFooter>
                          <Button className="w-full">Save Changes</Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Hash className="h-4 w-4" />
                          Open Popover
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium">Quick Actions</p>
                            <p className="text-xs text-muted-foreground">Choose an action to perform.</p>
                          </div>
                          <div className="space-y-1">
                            {[
                              { icon: Plus, label: "Create task", desc: "Add a new task" },
                              { icon: Users, label: "Invite member", desc: "Add someone to your team" },
                              { icon: FileText, label: "New document", desc: "Start from scratch" },
                            ].map((action) => (
                              <button
                                type="button"
                                key={action.label}
                                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
                              >
                                <action.icon className="h-4 w-4 text-muted-foreground" />
                                <div className="text-left">
                                  <p className="font-medium">{action.label}</p>
                                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <MoreHorizontal className="h-4 w-4" />
                          Open Dropdown Menu
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" /> Open in new tab
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </div>

              {/* Loading & Color Palette */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Loading States</CardTitle>
                    <CardDescription>Skeleton patterns for loading content.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Skeleton className="h-20 rounded-lg" />
                      <Skeleton className="h-20 rounded-lg" />
                      <Skeleton className="h-20 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Color Palette</CardTitle>
                    <CardDescription>All semantic colors and chart palette.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {[
                        { name: "Background", cls: "bg-background border" },
                        { name: "Card", cls: "bg-card border" },
                        { name: "Muted", cls: "bg-muted" },
                        { name: "Accent", cls: "bg-accent" },
                        { name: "Primary", cls: "bg-primary" },
                        { name: "Secondary", cls: "bg-secondary border" },
                        { name: "Destructive", cls: "bg-destructive" },
                        { name: "Success", cls: "bg-success" },
                        { name: "Warning", cls: "bg-warning" },
                        { name: "Border", cls: "bg-border" },
                      ].map((color) => (
                        <div key={color.name} className="space-y-1">
                          <div className={`h-10 rounded-md ${color.cls}`} />
                          <p className="text-[10px] text-muted-foreground text-center">
                            {color.name}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Charts</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} className="space-y-1 flex-1">
                            <div
                              className="h-8 rounded"
                              style={{ background: `var(--chart-${n})` }}
                            />
                            <p className="text-[9px] text-muted-foreground text-center">
                              Chart {n}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts & Graphs */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Area Chart — Revenue */}
                <ChartCard title="Revenue" description="Monthly revenue over the last 6 months.">
                  <ChartContainer config={revenueConfig} className="h-[250px] w-full">
                    <AreaChart data={revenueData} accessibilityLayer>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v / 1000}k`} />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        fill="url(#fillRevenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </ChartCard>

                {/* Bar Chart — Tasks by Status */}
                <ChartCard title="Tasks by Status" description="Breakdown of task completion each month.">
                  <ChartContainer config={tasksConfig} className="h-[250px] w-full">
                    <BarChart data={tasksByStatusData} accessibilityLayer>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" fill="var(--color-inProgress)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="overdue" fill="var(--color-overdue)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>

                {/* Line Chart — Active Users */}
                <ChartCard title="Active Users" description="Desktop vs mobile users over time.">
                  <ChartContainer config={activeUsersConfig} className="h-[250px] w-full">
                    <LineChart data={activeUsersData} accessibilityLayer>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ChartContainer>
                </ChartCard>

                {/* Donut Chart — Project Distribution */}
                <ChartCard title="Project Distribution" description="Allocation across departments.">
                  <ChartContainer config={projectDistributionConfig} className="h-[250px] w-full">
                    <PieChart accessibilityLayer>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      <Pie
                        data={projectDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        strokeWidth={2}
                        stroke="var(--background)"
                      >
                        {projectDistributionData.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </ChartCard>
              </div>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>Type scale and text styles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Page Heading (3xl bold)</h1>
                    <h2 className="text-2xl font-semibold tracking-tight">Section Title (2xl semibold)</h2>
                    <h3 className="text-xl font-semibold">Subsection (xl semibold)</h3>
                    <h4 className="text-lg font-medium">Card Title (lg medium)</h4>
                    <p className="text-sm">Body text — default (sm). This is how most content reads throughout the app.</p>
                    <p className="text-sm text-muted-foreground">Muted text — secondary information that&apos;s less prominent.</p>
                    <p className="text-xs text-muted-foreground">Caption (xs muted) — timestamps, metadata, helper text.</p>
                  </div>
                  <Separator />
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sans (Geist)</p>
                      <p className="font-sans text-sm">The quick brown fox jumps over the lazy dog.</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Mono (Geist Mono)</p>
                      <p className="font-mono text-sm">const theme = &quot;vibekit&quot;;</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

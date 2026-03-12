export interface BuildSpec {
  appName: string;
  dataSource?: "prisma" | "external";  // default: "prisma"
  needsAuth?: boolean;  // default: true — set false for personal/local dashboards
  skills?: string[];  // skills selected during interview (e.g., ["charts", "stripe", "rbac"])
  models: ModelSpec[];
  sidebar: NavItemSpec[];
  dashboard: DashboardSpec;
}

export interface ModelSpec {
  name: string;
  slug: string;
  label: string;
  labelSingular: string;
  icon: string;
  iconColor: string;
  fields: FieldSpec[];
  belongsTo: RelationSpec[];
  hasMany: string[];
  searchFields: string[];
  defaultSort: string;
  readOnly?: boolean;  // default: false — skip create/edit forms and mutation procedures
}

export interface FieldSpec {
  name: string;
  type: "String" | "Int" | "Float" | "Boolean" | "DateTime";
  required: boolean;
  maxLength?: number;
  default?: string | number | boolean;
  enum?: string[];
  defaultEnum?: string;
  showInList?: boolean;
  showInDetail?: boolean;
  listLabel?: string;
}

export interface RelationSpec {
  model: string;
  field: string;
}

export interface NavItemSpec {
  title: string;
  href: string;
  icon: string;
}

export interface DashboardSpec {
  description: string;
  recentEntity: string;
}


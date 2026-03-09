export interface BuildSpec {
  appName: string;
  models: ModelSpec[];
  sidebar: NavItemSpec[];
  dashboard: DashboardSpec;
  settings: SettingsSpec;
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

export interface SettingsSpec {
  tabs: { label: string; href: string }[];
}

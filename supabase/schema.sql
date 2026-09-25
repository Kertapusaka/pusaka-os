-- =====================================================================
-- KERTA PUSAKA AI OS — DATABASE SCHEMA (Phase 1)
-- PT Kerta Pusaka Indonesia
--
-- HOW TO RUN: Supabase Dashboard > SQL Editor > New query > paste this
-- whole file > Run. Safe to run once on a fresh project.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ---------------------------------------------------------------------
-- Shared helper: keeps updated_at current on every UPDATE
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. USERS & ROLES
-- ---------------------------------------------------------------------
create type user_role as enum (
  'owner', 'project_manager', 'site_supervisor', 'finance', 'procurement', 'marketing'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'site_supervisor',
  phone_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_profiles_updated_at
  before update on profiles for each row execute function public.set_updated_at();

-- Auto-create a profile the moment someone is added in Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'site_supervisor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. CRM & LEADS
-- ---------------------------------------------------------------------
create type lead_status as enum (
  'NEW','QUALIFIED','CONSULTATION','SURVEY','RAB','QUOTATION','NEGOTIATION','DEAL','LOST'
);

create sequence if not exists lead_code_seq;

create table leads (
  id uuid primary key default uuid_generate_v4(),
  lead_code text unique not null default ('LEAD-' || to_char(nextval('lead_code_seq'), 'FM000000')),
  client_name text not null,
  whatsapp_number text not null,
  location text not null,
  building_type text,
  land_area numeric,
  building_area numeric,
  floors int default 1,
  budget_estimate numeric,
  target_start_date date,
  notes text,
  source text,
  status lead_status default 'NEW',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_leads_status on leads(status);
create index idx_leads_created_at on leads(created_at desc);

create trigger trg_leads_updated_at
  before update on leads for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. PROJECTS
-- ---------------------------------------------------------------------
create type project_status as enum ('PLANNING','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED');

create sequence if not exists project_code_seq;

create table projects (
  id uuid primary key default uuid_generate_v4(),
  project_code text unique not null default ('PRJ-' || to_char(nextval('project_code_seq'), 'FM000000')),
  lead_id uuid references leads(id) on delete set null,
  project_name text not null,
  location text not null,
  total_budget numeric not null,
  start_date date not null,
  end_date date not null,
  status project_status default 'PLANNING',
  progress_percentage numeric(5,2) default 0.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_lead_id on projects(lead_id);
create index idx_projects_status on projects(status);

create trigger trg_projects_updated_at
  before update on projects for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. RAB & QUOTATIONS
-- ---------------------------------------------------------------------
create table rab_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  item_category text not null,
  item_description text not null,
  volume numeric not null,
  unit text not null,
  unit_price numeric not null,
  total_price numeric generated always as (volume * unit_price) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_rab_items_project_id on rab_items(project_id);

create trigger trg_rab_items_updated_at
  before update on rab_items for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. MATERIALS & INVENTORY
-- ---------------------------------------------------------------------
create table materials (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  item_name text not null,
  category text not null,
  current_stock numeric not null default 0,
  minimum_stock numeric not null default 0,
  unit text not null,
  average_unit_cost numeric default 0,
  last_updated timestamptz default now()
);

create index idx_materials_project_id on materials(project_id);

create table material_transactions (
  id uuid primary key default uuid_generate_v4(),
  material_id uuid references materials(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  type text check (type in ('IN','OUT')),
  quantity numeric not null,
  vendor_supplier text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index idx_material_tx_material_id on material_transactions(material_id);
create index idx_material_tx_project_id on material_transactions(project_id);

-- "Data moves itself": a logged transaction updates stock automatically
create or replace function public.apply_material_transaction()
returns trigger language plpgsql as $$
begin
  if new.type = 'IN' then
    update materials set current_stock = current_stock + new.quantity, last_updated = now()
      where id = new.material_id;
  else
    update materials set current_stock = current_stock - new.quantity, last_updated = now()
      where id = new.material_id;
  end if;
  return new;
end;
$$;

create trigger trg_material_tx_apply
  after insert on material_transactions for each row execute function public.apply_material_transaction();

-- ---------------------------------------------------------------------
-- 6. DAILY REPORTS (FIELD PWA INPUT)
-- ---------------------------------------------------------------------
create table daily_reports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  report_date date not null default current_date,
  progress_increment numeric(5,2) not null default 0.00,
  labor_count int not null default 0,
  weather_condition text,
  work_completed_notes text not null,
  issues_and_obstacles text,
  submitted_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index idx_daily_reports_project_id on daily_reports(project_id);
create index idx_daily_reports_date on daily_reports(report_date desc);

-- A submitted report nudges the project's progress bar automatically
create or replace function public.apply_daily_progress()
returns trigger language plpgsql as $$
begin
  update projects
    set progress_percentage = least(100::numeric(5,2), progress_percentage + new.progress_increment)
    where id = new.project_id;
  return new;
end;
$$;

create trigger trg_daily_reports_apply_progress
  after insert on daily_reports for each row execute function public.apply_daily_progress();

-- ---------------------------------------------------------------------
-- 7. QC & K3 CHECKLISTS
-- ---------------------------------------------------------------------
create table qc_checklists (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  work_item text not null,
  checklist_data jsonb not null,
  is_passed boolean default false,
  inspector_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now()
);

create index idx_qc_checklists_project_id on qc_checklists(project_id);

-- ---------------------------------------------------------------------
-- 8. PROJECT PHOTOS & ASSETS
-- ---------------------------------------------------------------------
create table project_photos (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  report_id uuid references daily_reports(id) on delete set null,
  photo_url text not null,
  ai_tags jsonb,
  is_approved_for_marketing boolean default false,
  created_at timestamptz default now()
);

create index idx_project_photos_project_id on project_photos(project_id);

-- ---------------------------------------------------------------------
-- 9. CASHFLOW & FINANCE
-- ---------------------------------------------------------------------
create type cash_type as enum ('CASH_IN','CASH_OUT');

create table cashflows (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  type cash_type not null,
  category text not null,
  amount numeric not null,
  receipt_url text,
  description text not null,
  approved_by_owner boolean default false,
  created_at timestamptz default now()
);

create index idx_cashflows_project_id on cashflows(project_id);
create index idx_cashflows_type on cashflows(type);

-- ---------------------------------------------------------------------
-- 10. AI WATCHDOG LOGS & DAILY BRIEFINGS
-- ---------------------------------------------------------------------
create type alert_severity as enum ('LOW','MEDIUM','HIGH','CRITICAL');

create table ai_alerts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  module text not null,
  severity alert_severity not null,
  title text not null,
  reason text not null,
  recommended_action text not null,
  is_resolved boolean default false,
  created_at timestamptz default now()
);

create index idx_ai_alerts_project_id on ai_alerts(project_id);
create index idx_ai_alerts_open on ai_alerts(severity) where is_resolved = false;

create table daily_briefings (
  id uuid primary key default uuid_generate_v4(),
  briefing_date date unique not null default current_date,
  content_markdown text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 11. KNOWLEDGE BASE & LESSONS LEARNED (RAG-ready)
-- ---------------------------------------------------------------------
create table lessons_learned (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  issue_category text not null,
  problem_description text not null,
  financial_impact numeric default 0,
  time_delay_days int default 0,
  root_cause text not null,
  preventative_solution text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index idx_lessons_learned_project_id on lessons_learned(project_id);
-- Build the vector index once you have rows to train it on:
-- create index idx_lessons_learned_embedding on lessons_learned using ivfflat (embedding vector_cosine_ops);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Internal tool defaults: most modules are readable by every signed-in
-- staff member; writes are gated by role; financial data (cashflows) is
-- also gated on read. Adjust freely to match your real policy.
-- =====================================================================
create or replace function public.current_user_role()
returns user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table profiles enable row level security;
alter table leads enable row level security;
alter table projects enable row level security;
alter table rab_items enable row level security;
alter table materials enable row level security;
alter table material_transactions enable row level security;
alter table daily_reports enable row level security;
alter table qc_checklists enable row level security;
alter table project_photos enable row level security;
alter table cashflows enable row level security;
alter table ai_alerts enable row level security;
alter table daily_briefings enable row level security;
alter table lessons_learned enable row level security;

create policy "profiles_select_all" on profiles for select to authenticated using (true);
create policy "profiles_update_self_or_owner" on profiles for update to authenticated
  using (id = auth.uid() or public.current_user_role() = 'owner');

create policy "leads_select_all" on leads for select to authenticated using (true);
create policy "leads_insert_sales" on leads for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager','marketing'));
create policy "leads_update_sales" on leads for update to authenticated
  using (public.current_user_role() in ('owner','project_manager','marketing'));
create policy "leads_delete_owner" on leads for delete to authenticated
  using (public.current_user_role() = 'owner');

create policy "projects_select_all" on projects for select to authenticated using (true);
create policy "projects_insert_pm" on projects for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager'));
create policy "projects_update_pm" on projects for update to authenticated
  using (public.current_user_role() in ('owner','project_manager'));
create policy "projects_delete_owner" on projects for delete to authenticated
  using (public.current_user_role() = 'owner');

create policy "rab_select_all" on rab_items for select to authenticated using (true);
create policy "rab_insert_pm" on rab_items for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager'));
create policy "rab_update_pm" on rab_items for update to authenticated
  using (public.current_user_role() in ('owner','project_manager'));
create policy "rab_delete_pm" on rab_items for delete to authenticated
  using (public.current_user_role() in ('owner','project_manager'));

create policy "materials_select_all" on materials for select to authenticated using (true);
create policy "materials_insert_field" on materials for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager','procurement','site_supervisor'));
create policy "materials_update_field" on materials for update to authenticated
  using (public.current_user_role() in ('owner','project_manager','procurement','site_supervisor'));

create policy "material_tx_select_all" on material_transactions for select to authenticated using (true);
create policy "material_tx_insert_field" on material_transactions for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager','procurement','site_supervisor'));

create policy "daily_reports_select_all" on daily_reports for select to authenticated using (true);
create policy "daily_reports_insert_field" on daily_reports for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager','site_supervisor'));
create policy "daily_reports_update_author_or_mgmt" on daily_reports for update to authenticated
  using (submitted_by = auth.uid() or public.current_user_role() in ('owner','project_manager'));

create policy "qc_select_all" on qc_checklists for select to authenticated using (true);
create policy "qc_insert_field" on qc_checklists for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager','site_supervisor'));
create policy "qc_update_field" on qc_checklists for update to authenticated
  using (public.current_user_role() in ('owner','project_manager','site_supervisor'));

create policy "photos_select_all" on project_photos for select to authenticated using (true);
create policy "photos_insert_field" on project_photos for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager','site_supervisor','marketing'));
create policy "photos_update_marketing_or_mgmt" on project_photos for update to authenticated
  using (public.current_user_role() in ('owner','project_manager','marketing'));

create policy "cashflows_select_finance" on cashflows for select to authenticated
  using (public.current_user_role() in ('owner','finance','project_manager'));
create policy "cashflows_insert_finance" on cashflows for insert to authenticated
  with check (public.current_user_role() in ('owner','finance','project_manager'));
create policy "cashflows_update_owner_finance" on cashflows for update to authenticated
  using (public.current_user_role() in ('owner','finance'));

create policy "alerts_select_mgmt" on ai_alerts for select to authenticated
  using (public.current_user_role() in ('owner','project_manager','finance','procurement','marketing'));
create policy "alerts_update_mgmt" on ai_alerts for update to authenticated
  using (public.current_user_role() in ('owner','project_manager'));

create policy "briefings_select_mgmt" on daily_briefings for select to authenticated
  using (public.current_user_role() in ('owner','project_manager'));

create policy "lessons_select_all" on lessons_learned for select to authenticated using (true);
create policy "lessons_insert_pm" on lessons_learned for insert to authenticated
  with check (public.current_user_role() in ('owner','project_manager'));
create policy "lessons_update_pm" on lessons_learned for update to authenticated
  using (public.current_user_role() in ('owner','project_manager'));

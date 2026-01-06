-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- Create decisions table
create table decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  context text,
  choice_made text,
  confidence_level int check (confidence_level between 1 and 5),
  status text check (status in ('pending', 'reviewed')) default 'pending',
  outcome text check (outcome in ('success', 'failure', 'unknown')) default 'unknown',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create tags table
create table tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

-- Create decision_tags table (Many-to-Many)
create table decision_tags (
  decision_id uuid references decisions on delete cascade not null,
  tag_id uuid references tags on delete cascade not null,
  primary key (decision_id, tag_id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table decisions enable row level security;
alter table tags enable row level security;
alter table decision_tags enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Policies for decisions
create policy "Users can view their own decisions" on decisions for select using (auth.uid() = user_id);
create policy "Users can insert their own decisions" on decisions for insert with check (auth.uid() = user_id);
create policy "Users can update their own decisions" on decisions for update using (auth.uid() = user_id);
create policy "Users can delete their own decisions" on decisions for delete using (auth.uid() = user_id);

-- Policies for tags
create policy "Users can view their own tags" on tags for select using (auth.uid() = user_id);
create policy "Users can insert their own tags" on tags for insert with check (auth.uid() = user_id);
create policy "Users can update their own tags" on tags for update using (auth.uid() = user_id);
create policy "Users can delete their own tags" on tags for delete using (auth.uid() = user_id);

-- Policies for decision_tags
-- Since this is just a join table, we check if the user owns the related decision
create policy "Users can view decision_tags" on decision_tags for select using (
  exists (select 1 from decisions where id = decision_tags.decision_id and user_id = auth.uid())
);
create policy "Users can insert decision_tags" on decision_tags for insert with check (
  exists (select 1 from decisions where id = decision_tags.decision_id and user_id = auth.uid())
);
create policy "Users can delete decision_tags" on decision_tags for delete using (
  exists (select 1 from decisions where id = decision_tags.decision_id and user_id = auth.uid())
);

-- Function to handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- TEAM SPACES FEATURE
-- Lightweight team collaboration for sharing decisions
-- =====================================================

-- Teams table
create table teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references auth.users not null,
  invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team members (join table with roles)
create table team_members (
  team_id uuid references teams on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- Add team_id to decisions (nullable - null means personal decision)
alter table decisions add column team_id uuid references teams on delete set null;

-- Index for faster team queries
create index decisions_team_id_idx on decisions(team_id);
create index team_members_user_id_idx on team_members(user_id);

-- Enable RLS on new tables
alter table teams enable row level security;
alter table team_members enable row level security;

-- =====================================================
-- TEAM RLS POLICIES
-- =====================================================

-- Teams: members can view their teams
create policy "Team members can view team" on teams for select using (
  exists (select 1 from team_members where team_id = teams.id and user_id = auth.uid())
);

-- Teams: creator can insert
create policy "Users can create teams" on teams for insert with check (auth.uid() = created_by);

-- Teams: owner/admin can update
create policy "Team admins can update team" on teams for update using (
  exists (select 1 from team_members where team_id = teams.id and user_id = auth.uid() and role in ('owner', 'admin'))
);

-- Teams: only owner can delete
create policy "Team owner can delete team" on teams for delete using (created_by = auth.uid());

-- Team members: members can view other members in their teams
create policy "Members can view team members" on team_members for select using (
  exists (select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
);

-- Team members: owner/admin can add members
create policy "Admins can add team members" on team_members for insert with check (
  exists (select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin'))
  or exists (select 1 from teams t where t.id = team_members.team_id and t.created_by = auth.uid()) -- creator adding first member (themselves)
);

-- Team members: owner/admin can remove members
create policy "Admins can remove team members" on team_members for delete using (
  exists (select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role in ('owner', 'admin'))
  or user_id = auth.uid() -- users can leave teams
);

-- =====================================================
-- UPDATE DECISIONS POLICIES FOR TEAMS
-- =====================================================

-- Drop existing select policy and recreate with team support
drop policy if exists "Users can view their own decisions" on decisions;
create policy "Users can view own and team decisions" on decisions for select using (
  user_id = auth.uid()  -- personal decisions
  or (team_id is not null and exists (
    select 1 from team_members where team_id = decisions.team_id and user_id = auth.uid()
  ))  -- team decisions
);

-- Update insert policy to allow team decisions
drop policy if exists "Users can insert their own decisions" on decisions;
create policy "Users can insert decisions" on decisions for insert with check (
  auth.uid() = user_id
  and (
    team_id is null  -- personal decision
    or exists (select 1 from team_members where team_id = decisions.team_id and user_id = auth.uid())  -- team decision
  )
);

-- Update update policy for team decisions
drop policy if exists "Users can update their own decisions" on decisions;
create policy "Users can update own and team decisions" on decisions for update using (
  user_id = auth.uid()  -- own decisions
  or (team_id is not null and exists (
    select 1 from team_members where team_id = decisions.team_id and user_id = auth.uid() and role in ('owner', 'admin')
  ))  -- team admins can update
);

-- =====================================================
-- HELPER FUNCTION: Auto-add creator as owner
-- =====================================================

create or replace function public.handle_new_team()
returns trigger as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-add team creator as owner
create trigger on_team_created
  after insert on teams
  for each row execute procedure public.handle_new_team();

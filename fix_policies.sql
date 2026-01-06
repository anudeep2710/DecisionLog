-- =====================================================
-- DROP ALL POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop all decisions policies
drop policy if exists "Users can view their own decisions" on decisions;
drop policy if exists "Users can insert their own decisions" on decisions;
drop policy if exists "Users can update their own decisions" on decisions;
drop policy if exists "Users can delete their own decisions" on decisions;
drop policy if exists "Users can view own and team decisions" on decisions;
drop policy if exists "Users can insert decisions" on decisions;
drop policy if exists "Users can update own and team decisions" on decisions;

-- Drop all profiles policies
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;

-- Drop all tags policies
drop policy if exists "Users can view their own tags" on tags;
drop policy if exists "Users can insert their own tags" on tags;
drop policy if exists "Users can update their own tags" on tags;
drop policy if exists "Users can delete their own tags" on tags;

-- Drop all decision_tags policies
drop policy if exists "Users can view decision_tags" on decision_tags;
drop policy if exists "Users can insert decision_tags" on decision_tags;
drop policy if exists "Users can delete decision_tags" on decision_tags;

-- Drop all teams policies (if they exist)
drop policy if exists "Team members can view team" on teams;
drop policy if exists "Users can create teams" on teams;
drop policy if exists "Team admins can update team" on teams;
drop policy if exists "Team owner can delete team" on teams;

-- Drop all team_members policies (if they exist)
drop policy if exists "Users can view own membership" on team_members;
drop policy if exists "Members can view team members" on team_members;
drop policy if exists "Admins can add team members" on team_members;
drop policy if exists "Admins can remove team members" on team_members;

-- Verify no policies remain
select tablename, policyname from pg_policies where schemaname = 'public';
-- Create a table to track page views
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz default now() not null,
  path text not null,
  user_agent text,
  session_id text, -- A client-generated ID to group views by session
  screen_width integer,
  language text
);

-- Enable Row Level Security (RLS)
alter table public.page_views enable row level security;

-- Create a policy to allow anyone (anon) to insert data
-- This is necessary for public visitors to log their views
create policy "Allow public insert access"
  on public.page_views
  for insert
  to anon
  with check (true);

-- Create a policy to allow authenticated users (service_role/dashboard) to view data
-- We don't want public users reading this table
create policy "Allow authenticated read access"
  on public.page_views
  for select
  to authenticated
  using (true);

-- Optional: Grant access to service_role explicitly if needed, 
-- though service_role bypasses RLS by default.

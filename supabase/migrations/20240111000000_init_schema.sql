-- Create folders table
create table folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  parent_id uuid references folders,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notes table
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  folder_id uuid references folders,
  title text,
  content text,
  type text check (type in ('general', 'secure', 'todo', 'reminder')) default 'general',
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table folders enable row level security;
alter table notes enable row level security;

-- Policies for folders
create policy "Users can select their own folders"
  on folders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own folders"
  on folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own folders"
  on folders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own folders"
  on folders for delete
  using (auth.uid() = user_id);

-- Policies for notes
create policy "Users can select their own notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on notes for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index folders_user_id_idx on folders (user_id);
create index folders_parent_id_idx on folders (parent_id);
create index notes_user_id_idx on notes (user_id);
create index notes_folder_id_idx on notes (folder_id);

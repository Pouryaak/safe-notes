-- Enable pgcrypto for secure hashing
create extension if not exists pgcrypto;

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  vault_pin_hash text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper to check PIN securely (keeps hashing logic in DB or we can do in App)
-- We'll do hashing in App via pgcrypto calls or just direct SQL updates using crypt()

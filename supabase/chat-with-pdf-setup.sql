-- Chat with PDF Table Setup (following BuilderKit documentation exactly)
-- Source: https://docs.builderkit.ai/ai-apps/chat-with-pdf

-- Create a table for Chat with File
create table chat_with_file (
   id uuid not null default uuid_generate_v4 (),
   created_at timestamp with time zone not null default now(),
   user_id uuid null,
   file text not null,
   filename text not null,
   chat_history jsonb null,
   history_metadata text null,
   constraint chat_with_file_pkey primary key (id),
   constraint chat_with_file_user_id_fkey foreign key (user_id) references users (id)
);
 
-- Set up Row Level Security (RLS)
alter table chat_with_file
enable row level security;
 
create policy "Users can insert their own row." on chat_with_file
for insert with check (auth.uid() = user_id);
 
create policy "Users can update own row" on chat_with_file
for update using (auth.uid() = user_id);
 
-- Optional: Add policy to allow users to delete their own row
create policy "Users can read own row" on chat_with_file
for select using (auth.uid() = user_id);

-- Optional: Add policy to allow users to delete their own row
create policy "Users can delete own row" on chat_with_file
for delete using (auth.uid() = user_id);

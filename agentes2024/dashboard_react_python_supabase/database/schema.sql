-- Create conversations table
create table conversations (
    id uuid default uuid_generate_v4() primary key,
    client_id text not null,
    user_message text not null,
    ai_response text not null,
    has_image boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries by client_id
create index idx_conversations_client_id on conversations(client_id);

-- Enable Row Level Security (RLS)
alter table conversations enable row level security;

-- Create policy to allow insert for all (you might want to restrict this in production)
create policy "Allow inserts for all"
    on conversations for insert
    to authenticated
    with check (true);

-- Create policy to allow select for own messages
create policy "Allow select for own messages"
    on conversations for select
    to authenticated
    using (client_id = auth.uid()::text);

-- Create function to clean up old conversations (optional)
create or replace function cleanup_old_conversations()
returns void
language plpgsql
as $$
begin
    delete from conversations
    where created_at < now() - interval '30 days';
end;
$$;

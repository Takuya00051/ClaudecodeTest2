-- ============================================================
-- X Clone — Supabase schema
-- Supabase の SQL エディタで実行してください
-- ============================================================

-- profiles テーブル（auth.users と 1:1 対応）
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text unique not null,
  created_at timestamptz default now()
);

-- tweets テーブル
create table if not exists tweets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 280),
  created_at timestamptz default now()
);

-- インデックス（タイムライン取得を高速化）
create index if not exists tweets_created_at_idx on tweets(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table tweets   enable row level security;

-- profiles: 全員が読める / 本人のみ作成
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);

-- tweets: 全員が読める / 本人のみ作成・削除
create policy "tweets_select" on tweets for select using (true);
create policy "tweets_insert" on tweets for insert with check (auth.uid() = user_id);
create policy "tweets_delete" on tweets for delete using (auth.uid() = user_id);

-- ============================================================
-- Realtime（リアルタイム更新を有効化）
-- ============================================================
alter publication supabase_realtime add table tweets;

-- music library table
create table if not exists public.music_library (
  id uuid not null default gen_random_uuid(),
  title text not null,
  artist text null,
  genre text not null,
  mood text not null,
  duration integer null,
  links jsonb not null default '{"spotify": null, "youtube": null, "apple_music": null, "yandex_music": null}'::jsonb,
  tags text[] null,
  popularity_score integer null default 0,
  recommended_oils text[] null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  constraint music_library_pkey primary key (id)
) tablespace pg_default;

create index if not exists idx_music_genre on public.music_library using btree (genre) tablespace pg_default;
create index if not exists idx_music_mood on public.music_library using btree (mood) tablespace pg_default;
create index if not exists idx_music_active on public.music_library using btree (is_active) tablespace pg_default where (is_active = true);

-- user preferences for music
create table if not exists public.user_music_prefs (
  chat_id bigint not null,
  mood text not null,
  last_used timestamp without time zone null default now(),
  like_count integer not null default 0,
  constraint user_music_prefs_pkey primary key (chat_id, mood)
);

create index if not exists idx_user_music_chat on public.user_music_prefs using btree (chat_id);


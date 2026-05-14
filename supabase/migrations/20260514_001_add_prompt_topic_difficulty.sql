alter table public.writing_prompts
add column if not exists topic text not null default 'General IELTS writing',
add column if not exists difficulty text not null default 'Balanced'
  check (difficulty in ('Guided', 'Balanced', 'Stretch'));

update public.writing_prompts
set
  topic = case id
    when 'task2-remote-work' then 'Work and society'
    when 'task2-ai-education' then 'Education and technology'
    when 'task1-cycle-diagram' then 'Process diagram'
    else topic
  end,
  difficulty = case id
    when 'task2-remote-work' then 'Balanced'
    when 'task2-ai-education' then 'Stretch'
    when 'task1-cycle-diagram' then 'Guided'
    else difficulty
  end;

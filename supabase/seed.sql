insert into public.writing_prompts (
  id,
  task_type,
  title,
  duration_minutes,
  minimum_words,
  brief,
  instructions,
  planning_checklist,
  is_active,
  source
)
values
(
  'task2-remote-work',
  'Task 2',
  'Remote work and employee productivity',
  40,
  250,
  'Some people believe remote work improves productivity, while others think employees work better in an office. Discuss both views and give your own opinion.',
  '["Present both views in a balanced way before giving your final position.","Support your opinion with clear reasons and practical examples.","Aim for a focused four-paragraph structure."]'::jsonb,
  '["Clarify your position before you begin writing.","Write one body paragraph for each side of the argument.","Use a short conclusion that reinforces your opinion."]'::jsonb,
  true,
  'seed'
),
(
  'task2-ai-education',
  'Task 2',
  'AI tools in school education',
  40,
  250,
  'Schools are increasingly using AI tools to support teaching and learning. Do the advantages outweigh the disadvantages?',
  '["State a clear overall judgement early in the essay.","Explain both the opportunities and the risks of AI in education.","Keep examples realistic and directly connected to the main point."]'::jsonb,
  '["Decide whether your essay is mainly positive, negative, or balanced.","Use topic sentences to make the argument easy to follow.","Avoid listing ideas without explaining their impact."]'::jsonb,
  true,
  'seed'
),
(
  'task1-cycle-diagram',
  'Task 1',
  'Water recycling process',
  20,
  150,
  'The diagram shows the stages used to recycle water in a modern city. Summarize the information by selecting and reporting the main features.',
  '["Write an overview that identifies the start and end of the cycle.","Group related stages together instead of describing every step in isolation.","Use precise process language and sequencing connectors."]'::jsonb,
  '["Write a one-sentence overview before the detailed description.","Move through the process in a logical order.","Check verb tenses and passive voice choices."]'::jsonb,
  true,
  'seed'
)
on conflict (id) do update
set
  task_type = excluded.task_type,
  title = excluded.title,
  duration_minutes = excluded.duration_minutes,
  minimum_words = excluded.minimum_words,
  brief = excluded.brief,
  instructions = excluded.instructions,
  planning_checklist = excluded.planning_checklist,
  is_active = excluded.is_active,
  source = excluded.source;

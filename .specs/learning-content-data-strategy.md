# Learning Content Data Strategy

## 1. Goal

Define the non-user learning data required to make Lumina IELTS genuinely useful for practice, feedback, and revision.

This document only covers product-owned learning content. It does not cover learner-generated submissions, session history, or analytics derived from learner activity.

## 2. Core Principle

The content layer should be:

- structured enough for product logic
- broad enough for repeated practice
- easy to expand over time
- safe to maintain without relying on fragile external scraping

## 3. Priority Data Sets

### 3.1 Prompt Bank

This is the highest-priority content data set.

Each writing prompt should include:

- `id`
- `task_type`
- `title`
- `prompt_text`
- `topic`
- `subtopic`
- `difficulty`
- `source_type`
- `tags`
- `status`

Initial MVP target:

- 30 to 50 Writing Task 1 prompts
- 60 to 100 Writing Task 2 prompts

### 3.2 Rubric Framework

The app needs a stable rubric reference layer for feedback formatting.

Required rubric entities:

- `criterion_code`
- `criterion_name`
- `band_range`
- `descriptor_summary`
- `review_questions`

Writing MVP criteria:

- task achievement or task response
- coherence and cohesion
- lexical resource
- grammatical range and accuracy

### 3.3 Common Mistake Taxonomy

The app needs a shared language for identifying recurring weaknesses.

Required attributes:

- `mistake_code`
- `criterion_code`
- `label`
- `description`
- `revision_hint`
- `example_pattern`

Examples:

- unclear overview
- underdeveloped supporting idea
- repetitive vocabulary
- article misuse
- sentence boundary error

### 3.4 Revision Checklist Library

The app should be able to generate actionable next steps from feedback.

Checklist item attributes:

- `id`
- `task_type`
- `criterion_code`
- `title`
- `instruction`
- `priority_level`

### 3.5 Topic, Vocabulary, and Idea Bank

This data layer helps learners move from blank-page anxiety to usable writing material.

Recommended attributes:

- `topic`
- `common_questions`
- `useful_vocabulary`
- `collocations`
- `idea_starters`
- `contrast_pairs`

### 3.6 Sample Outlines and Model Fragments

MVP should prefer outlines and short model fragments over full copied essays.

Recommended attributes:

- `task_type`
- `topic`
- `outline_blocks`
- `intro_pattern`
- `body_pattern`
- `overview_pattern`
- `conclusion_pattern`

## 4. Source Strategy

### 4.1 Product-Owned Seed Content

This should be the primary source for MVP:

- prompt bank written or curated for the app
- taxonomy and rubric data authored for the app
- revision checklist templates authored for the app
- topic banks written or normalized for the app

Benefits:

- consistent tone
- easier maintenance
- no dependency on changing third-party sites

### 4.2 Public and Open Materials

This can be used as a supporting research source when usage rights are clear.

Good candidates:

- public-domain materials
- open-license educational resources
- official public guidance documents
- openly shared prompt collections with clear reuse terms

### 4.3 Research-Derived Content

This is often the best compromise for quality and speed.

Workflow:

1. research public coverage
2. extract structure and topic patterns
3. rewrite into product-owned content
4. store normalized data in the app schema

### 4.4 AI-Assisted Content Generation

AI can accelerate content production for:

- prompt variants
- idea starters
- outline templates
- revision hints
- rubric phrasing drafts

Human review should still define the final seed content shape and quality bar.

## 5. What We Should Not Rely On

Avoid building the product around:

- fragile scraping pipelines
- unstructured dumps from random public repos
- giant copied answer banks
- inconsistent prompt formatting from mixed sources

These sources create maintenance debt and uneven learner experience.

## 6. Recommended MVP Build Order

1. prompt bank
2. rubric framework
3. common mistake taxonomy
4. revision checklist library
5. topic and vocabulary bank
6. sample outlines and model fragments

## 7. Schema Direction

Recommended product-owned tables:

- `writing_prompts`
- `writing_prompt_tags`
- `rubric_criteria`
- `rubric_descriptors`
- `mistake_taxonomy`
- `revision_checklists`
- `topic_idea_bank`
- `writing_outline_templates`

## 8. Seeding Plan

### Phase A

- ship a clean writing prompt bank
- ship rubric criteria and descriptors
- ship a first mistake taxonomy

### Phase B

- add revision checklist items
- add topic and vocabulary bank
- add model outline fragments

### Phase C

- add more prompt variety by topic difficulty
- localize prompt recommendations to learner goals
- connect AI feedback output to taxonomy and checklist data

## 9. Success Criteria

The learning content layer is successful when:

- learners rarely hit an empty state
- prompts feel varied and usable
- feedback maps to consistent categories
- revision advice is specific rather than generic
- the product can expand without rewriting the whole schema

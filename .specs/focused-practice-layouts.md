# Focused Practice Layouts

## Problem

Dense IELTS practice screens can overwhelm learners when prompt selection, drafting, checkpoints, readiness signals, and feedback all appear at once. Writing Practice and Mock Test Lab are the first refactor targets because they ask learners to make multiple decisions while also producing long-form answers.

## UX Direction

Use progressive disclosure for high-density practice workflows:

1. Choose the practice item.
2. Work in a focused drafting or answering room.
3. Review readiness, feedback, and next actions.

Each step should have one dominant learner action. Supporting content can stay available, but it should not compete with the primary task.

## Acceptance Criteria

- The default Writing Practice view shows prompt selection and a clear start action, not the draft editor.
- The default Mock Test Lab view shows test-pair selection and a clear start action, not both draft editors.
- Drafting controls only appear after the learner starts the focused practice step.
- Review and debrief content appears in a separate review step.
- Existing handoff links from Outline Builder, Prompt Explorer, Practice Sprint, and Mock Test Lab remain compatible.
- API, component, and Playwright tests cover the updated flows.

## Non-Goals

- This refactor does not change persistence contracts, scoring logic, authentication, or production deployment rules.
- This refactor does not redesign every learner module at once. Other dense modules should follow the same pattern in later slices.

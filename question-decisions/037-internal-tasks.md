# Question 037 — Internal tasks

**Status:** Locked  
**Implementation:** Phase 2  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the company build a full task manager or integrate one?

## Your chosen direction

Build lightweight record-linked tasks and remain ready to integrate specialist project-management tools.

## Why this was chosen

Follow-ups and operational tasks belong near customers, projects and tickets, but a complete task platform is not core differentiation.

## Why it is a strong fit

- Keeps work connected to records
- Avoids tool overbuilding
- Supports later integration

## Tradeoffs and safeguards

Teams may still need a separate planning tool for complex engineering delivery.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 37 — Team tasks: build our own or integrate?

Inside `staff.company.com`, you said you want **Team Tasks**. We need to decide how deep that should go.

**A. Simple internal tasks only**
Create task, assign person, due date, priority, status, comments.

**B. Full project/task management**
Boards, sprints, dependencies, time tracking, recurring tasks, attachments, workload, milestones, etc.

**C. Lightweight internal tasks + integrations**
Keep your own task system simple, but allow linking/syncing with GitHub Issues/Projects, Linear, Jira, or other tools later.

For your architecture, I recommend **C**.

Why: building your own Jira/Linear clone would be a distraction. Your internal system should know things like:

```text
Task
├── Project
├── Assignee
├── Due date
├── Priority
├── Status
├── Client-visible?
├── Linked GitHub issue
└── Notes
```

But actual engineering planning can remain in specialized tools if you use them later.

Would you like to lock **C — lightweight internal tasks + integration-ready**?

#### Your response

> C

#### Explanation or resolution

Locked: **Question 37 = C — lightweight internal tasks + integration-ready**.

So `staff.company.com` will support practical internal task tracking, but we will **not waste time rebuilding Jira, Linear, or GitHub Projects**.

A task can include:

```text
Task
├── Title
├── Description
├── Project
├── Assignee
├── Reporter
├── Priority
├── Status
├── Due date
├── Tags
├── Comments
├── Attachments
├── Client-visible?
├── External issue URL/ID
└── Activity history
```

Then later we can integrate with tools like GitHub Issues/Projects, Linear, or Jira if your team starts using them heavily.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.

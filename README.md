# FocuPet
## Repository Architecture

### Branch Structure
```txt
  |  | feature/<feature>
  |  |  |
  |  | /
  |  |/
  | dev
  |  |
  | /
  |/
main
  |
```

### Branch Descriptions

**`main`**: 
- **Purpose**: Production-ready code and stable releases
- **Protection**: Protected branch - no direct pushes allowed
- **What TO do**: 
  - Merge only thoroughly tested code from `dev`
  - Create releases and tags here
  - Hotfix critical production issues (with immediate merge back to `dev`)
- **What NOT to do**: 
  - Never push directly to main
  - Never merge untested or experimental code
  - Don't use for development work

**`dev`**: 
- **Purpose**: Integration branch for ongoing development
- **Protection**: Semi-protected - requires pull request reviews
- **What TO do**: 
  - Merge completed and tested features from `dev/<feature>` branches
  - Integration testing happens here
  - Regular merges to `main` when stable
- **What NOT to do**: 
  - Don't push incomplete features directly
  - Avoid breaking changes without team coordination
  - Don't merge untested feature branches

**`feature/<feature>`**: 
- **Purpose**: Individual feature development branches
- **Naming Convention**: `feature/<feature-name>` or `feature/<issue-123-feature-name>`
- **What TO do**: 
  - Create from latest `dev` branch
  - Work on single features or bug fixes
  - Keep branches focused and small
  - Regular commits with clear messages
  - Open pull requests to merge into `dev`
- **What NOT to do**: 
  - Don't let branches become stale (merge or delete regularly)
  - Don't work on multiple unrelated features in one branch
  - Don't merge directly into `main`


# GitHub Projects Setup for IITCohort

## Step 1: Create GitHub Project

1. **Go to your repository**: https://github.com/arun9557/iitcohort
2. **Click on "Projects" tab**
3. **Click "New project"**
4. **Choose "Board" template**
5. **Name it**: "IITCohort Development"
6. **Click "Create"**

## Step 2: Set Up Kanban Board Columns

Create these columns in your project board:

1. **Backlog** - New tasks to be planned
2. **To Do** - Tasks ready to start
3. **In Progress** - Currently being worked on
4. **Review** - Ready for code review
5. **Done** - Completed tasks

## Step 3: Add Issues to Project

1. **Go to "Issues" tab**
2. **Select all issues** (check the boxes)
3. **Click "Projects" dropdown**
4. **Select your project**
5. **Move them to "To Do" column**

## Step 4: Assign Team Members

For each issue:
1. **Click on the issue**
2. **Click "Assignees" on the right**
3. **Search and add the team member**
4. **Add appropriate labels**

## Step 5: Daily Workflow

### For Team Members:
1. **Pick a task** from "To Do" column
2. **Move it to "In Progress"**
3. **Create a branch**: `git checkout -b feature/task-name`
4. **Work on the task**
5. **Create Pull Request**
6. **Move task to "Review"**

### For Code Review:
1. **Review the Pull Request**
2. **If approved**: Merge and move task to "Done"
3. **If changes needed**: Move back to "In Progress"

## Step 6: Weekly Standup

Use the project board for daily/weekly updates:

### Questions for each team member:
- **What did you complete?** (Move tasks to "Done")
- **What are you working on?** (Tasks in "In Progress")
- **What's blocking you?** (Tasks stuck in "To Do")
- **What's next?** (Pick new tasks from "Backlog")

## Step 7: Milestones

Create milestones for major releases:

1. **Go to "Issues" tab**
2. **Click "Milestones"**
3. **Create new milestone**:
   - **Milestone 1**: Core Features (Week 1-2)
   - **Milestone 2**: Enhancements (Week 3-4)
   - **Milestone 3**: Polish & Testing (Week 5-6)

## Step 8: Automation (Optional)

Set up automation rules:
- **When PR is created** → Move issue to "Review"
- **When PR is merged** → Move issue to "Done"
- **When issue is closed** → Move to "Done"

## Step 9: Team Communication

### GitHub Discussions:
1. **Go to "Discussions" tab**
2. **Create categories**:
   - General
   - Ideas
   - Questions
   - Announcements

### Use Discussions for:
- **Feature ideas**
- **Technical questions**
- **Team announcements**
- **Weekly planning**

## Step 10: Progress Tracking

### Weekly Reports:
- **Tasks completed this week**
- **Tasks in progress**
- **Blockers and issues**
- **Next week's goals**

### Metrics to Track:
- **Velocity** (tasks completed per week)
- **Lead time** (time from start to completion)
- **Cycle time** (time in "In Progress")
- **Bug count** and resolution time

## Quick Commands for Team Members:

```bash
# Start working on a task
git checkout -b feature/voice-room-improvements

# Make changes and commit
git add .
git commit -m "Add mute/unmute functionality"

# Push and create PR
git push origin feature/voice-room-improvements
```

## Tips for Success:

1. **Update issues regularly** with progress
2. **Use descriptive commit messages**
3. **Keep PRs small and focused**
4. **Review code promptly**
5. **Celebrate completed tasks!** 🎉 
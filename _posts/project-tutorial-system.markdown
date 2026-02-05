---
title: "Dynamic Tutorial Framework"
start_date: 2025-05-15
end_date: 2025-07-01
image: assets/images/portfolio/tutorial-preview.jpg
tags: [UX, Systems, UI]
---

## Feature Overview

Built a flexible tutorial system that guides new players through game mechanics while adapting to their skill level and play style.

## Design Goals

- Non-intrusive guidance that respects player agency
- Adaptive pacing based on player performance
- Easy content authoring for designers

## Technical Implementation

### Event-Driven Architecture

The tutorial system listens to game events and responds contextually:

```csharp
public class TutorialManager : MonoBehaviour
{
    private Dictionary<string, TutorialStep> pendingSteps;
    
    void OnEnable()
    {
        GameEvents.OnBattleStart += CheckBattleTutorials;
        GameEvents.OnUnitSpawned += CheckUnitTutorials;
        GameEvents.OnBuildingPlaced += CheckBuildingTutorials;
    }
    
    private void CheckBattleTutorials(BattleContext context)
    {
        if (!HasCompletedStep("first_battle") && context.IsFirstBattle)
        {
            ShowTutorial("first_battle");
        }
    }
}
```

### Adaptive Difficulty

Tutorial hints adjust based on player performance:
- Repeated failures trigger additional guidance
- Quick completions skip intermediate steps
- Player can always access help on demand

### Analytics Integration

Every tutorial interaction is tracked:
- Step completion rates
- Time spent on each step
- Skip and replay patterns

## Results

- Tutorial completion rate: 78% (up from 52%)
- Day 1 retention improved 15%
- Designer-friendly authoring reduced content creation time by 60%

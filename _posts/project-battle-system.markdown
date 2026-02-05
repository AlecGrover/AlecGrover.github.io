---
title: "Real-Time Battle System"
start_date: 2025-06-01
end_date: 2025-08-01
image: assets/images/portfolio/battle-system-preview.jpg
tags: [Combat, Optimization, AI]
---

## Feature Overview

Designed and implemented a real-time battle system for a mobile strategy game that needed to handle dozens of units while maintaining smooth performance on a wide range of devices.

## Technical Challenges

### Performance Optimization
Mobile hardware constraints required creative solutions:
- Object pooling for all game entities
- LOD system for unit detail based on zoom level
- Batched AI updates across multiple frames

### Unit AI
Each unit uses a lightweight behavior tree system:

```csharp
public class UnitAI : MonoBehaviour
{
    private BehaviorTree behaviorTree;
    
    void Start()
    {
        behaviorTree = new BehaviorTree(
            new Selector(
                new Sequence(
                    new ConditionNode(IsEnemyInRange),
                    new ActionNode(AttackEnemy)
                ),
                new Sequence(
                    new ConditionNode(HasTarget),
                    new ActionNode(MoveToTarget)
                ),
                new ActionNode(Idle)
            )
        );
    }
}
```

### Ability System
Created a data-driven ability system allowing designers to create new abilities without code:
- Scriptable object-based definitions
- Visual effect triggering system
- Damage and buff calculations

## Results

- Supports 50+ active units at 60fps
- AI update cost reduced 70% through batching
- System shipped with zero critical bugs

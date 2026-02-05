---
title: "Ashes of Creation"
date: 2023-06-01
image: assets/images/portfolio/ashes-logo.png
client: Intrepid Studios
tags: [Unreal Engine, C++, AAA]
---

## Project Overview

As a Gameplay Engineer on this AAA action RPG, I contributed to core gameplay systems that defined the player experience. Working within a large development team, I owned several key features from concept through ship.

## My Contributions

### Combat System
Designed and implemented a responsive combo-based melee combat system that became central to the game's identity. Key features included:
- Input buffering for fluid combo chains
- Hit-stop and camera shake for impactful feedback
- Damage calculation with elemental interactions

### Character Controller
Built a versatile movement system that supported the game's verticality and exploration focus:
- Climbing and mantling system
- Swimming with underwater traversal
- Responsive ground movement with terrain adaptation

## Technical Highlights

The combat system processes player input through a state machine with predictive frame buffering:

```cpp
void UCombatComponent::ProcessInput(EAttackType AttackType)
{
    // Buffer input during attack animations
    if (IsInAttackState())
    {
        InputBuffer.Add(FBufferedInput(AttackType, GetWorld()->GetTimeSeconds()));
    }
    else
    {
        ExecuteAttack(AttackType);
    }
}
```

## Results

- Praised by reviewers for "best-in-class" combat feel
- Movement system scaled to support additional content in post-launch DLC
- Systems used as foundation for sequel development

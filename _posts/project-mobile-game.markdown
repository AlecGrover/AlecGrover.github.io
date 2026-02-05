---
title: "Mobile Strategy Game"
start_date: 2025-06-01
end_date: 2025-10-01
image: assets/images/portfolio/mobile-game-preview.jpg
client: Mobile Studio
tags: [Unity, C#, Mobile]
---

## Project Overview

Lead gameplay engineer for a mobile strategy title that achieved millions of downloads and strong player retention. Responsible for core battle systems and player onboarding experience.

## My Contributions

### Real-Time Battle System
Designed a performant real-time battle system optimized for mobile hardware:
- Unit AI with behavior trees
- Ability system with visual effects
- Performance optimization for low-end devices

### Tutorial Framework
Created a dynamic tutorial system that adapts to player behavior:
- Contextual hints based on player actions
- Progressive complexity revelation
- A/B tested onboarding flows

## Technical Highlights

The battle system uses object pooling and LOD management to maintain 60fps:

```csharp
public class UnitManager : MonoBehaviour
{
    private ObjectPool<Unit> unitPool;
    
    public void SpawnUnit(UnitData data, Vector3 position)
    {
        var unit = unitPool.Get();
        unit.Initialize(data, position);
        
        // Apply LOD based on camera distance
        float distance = Vector3.Distance(position, Camera.main.transform.position);
        unit.SetLODLevel(CalculateLOD(distance));
    }
}
```

## Results

- Achieved 60fps on target min-spec devices
- Tutorial completion rate improved 40% through iteration
- Featured in App Store "Games We Love" collection

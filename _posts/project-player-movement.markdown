---
title: "Inter-Server Gameplay and Economy Integration"
start_date: "2023-06-22"
end_date: "2026-01-15"
excerpt: "Ashes of Creation utilized a groundbreaking dynamic gridding server environment, I contributed extensively to hardening economy systems for its deeply asynchronous environment."
image: "assets/images/portfolio/movement-preview.jpg"
category: "professional"
tags: ["Unreal Engine", "C++", "Physics", "Movement"]
studio: "Studio Name"
role: "Gameplay Engineer"
duration: "4 months"
featured: true
---

## Project Overview

I was tasked with creating a character movement system that could handle diverse traversal mechanics across different environment types. The system needed to support standard locomotion, climbing, swimming, and special traversal objects while maintaining consistent, responsive controls.

## Architecture

### Movement Mode System

The controller is built on a modular movement mode architecture:

```cpp
UENUM(BlueprintType)
enum class ECustomMovementMode : uint8
{
    None,
    Climbing,
    Swimming,
    WallRunning,
    Sliding,
    Swinging,
    Mantling
};
```

Each mode encapsulates its own:
- Physics behavior and constraints
- Input handling and response curves
- Animation state requirements
- Transition conditions to other modes

### Climbing System

The climbing system was the most complex, supporting:

- **Freeform Climbing** - Procedural hand/foot IK on any valid surface
- **Ledge Detection** - Accurate ledge finding with corner handling
- **Stamina Integration** - Climb duration limits with recovery
- **Dynamic Obstacles** - Climbing on moving platforms

Surface detection uses a combination of:
1. Capsule traces for general surface proximity
2. Line traces for precise hand placement
3. Normal averaging for smooth surface following

```cpp
bool UClimbingComponent::FindClimbableSurface(FClimbSurfaceInfo& OutInfo)
{
    // Multi-trace approach for robust surface detection
    FHitResult ForwardHit, DownwardHit;
    
    // Forward trace to find wall
    bool bFoundWall = TraceForWall(ForwardHit);
    if (!bFoundWall) return false;
    
    // Validate surface angle and material
    if (!IsValidClimbSurface(ForwardHit)) return false;
    
    // Find hand placement positions
    OutInfo.LeftHandTarget = CalculateHandPosition(ForwardHit, EHand::Left);
    OutInfo.RightHandTarget = CalculateHandPosition(ForwardHit, EHand::Right);
    
    return true;
}
```

### Swimming System

The swimming implementation features:

- **Buoyancy Simulation** - Realistic water interaction with surface tension
- **Depth-Based Movement** - Different handling at surface vs. underwater
- **Oxygen Management** - Breath meter with visual/audio feedback
- **Current Volumes** - Environmental water currents affecting movement

### Mantling & Vaulting

Context-sensitive traversal that automatically detects and executes:

- Low vault (waist-height obstacles)
- High mantle (chest-height ledges)
- Climb-up (above-head surfaces)

The system measures obstacle dimensions and selects the appropriate animation montage while using root motion for precise positioning.

## Input Handling

Movement input uses response curves to create different feels per mode:

- **Ground**: Snappy acceleration with momentum preservation
- **Air**: Reduced control with coyote time for jumps
- **Water**: Floaty with gradual velocity changes
- **Climbing**: Direct 1:1 mapping for precision

```cpp
FVector UCustomMovementComponent::ProcessInputVector(FVector RawInput)
{
    // Apply mode-specific response curve
    UCurveFloat* ResponseCurve = GetResponseCurveForMode(CurrentMode);
    
    float InputMagnitude = RawInput.Size();
    float ProcessedMagnitude = ResponseCurve->GetFloatValue(InputMagnitude);
    
    return RawInput.GetSafeNormal() * ProcessedMagnitude;
}
```

## Animation Integration

The movement system drives a complex animation blueprint:

- **Blend Spaces** - Directional locomotion with speed-based blending
- **State Machines** - Mode-specific animation states with transitions
- **IK Systems** - Foot placement, hand positioning, head look-at
- **Layered Animations** - Upper body actions during movement

## Debug Tools

I built comprehensive debug visualization:

- Surface detection traces and normals
- Movement vector visualization
- State machine current state display
- Input buffer visualization
- Performance metrics overlay

## Performance

Movement runs every frame and touches physics, so optimization was critical:

- Cached trace results where possible
- LOD system for IK complexity at distance
- Async traces for non-critical detection
- Profile-guided optimization of hot paths

**Frame Budget**: Movement systems consistently under 1ms on target hardware.

## Collaboration

Worked extensively with:
- **Animation** - Defining state requirements and blend parameters
- **Level Design** - Ensuring metrics work across diverse environments
- **Design** - Tuning feel and pacing of traversal
- **QA** - Edge case identification and stress testing

## Key Takeaways

- Prototype feel early with simple visuals before polish
- Movement metrics need to be locked early for level design
- Debug visualization is worth 10x the time investment
- Edge cases in movement are infinite—prioritize common paths

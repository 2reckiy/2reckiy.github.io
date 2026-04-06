That behavior happens because of two classic game development issues: **Target Loss** (the bullet gives up if the target dies before impact) and **Frame Overshooting** (the bullet moves faster than its hit-radius in a single frame).

Let’s refine the `Bullet` and `CombatOrchestrator` to handle these scenarios gracefully.

### 1. The "Ghosting" Fix: Bullet persistence

Currently, if an enemy dies from one bullet, all other bullets mid-air targeting it immediately set `isDead = true`. We should allow bullets to reach their destination even if the target is gone.

### 2. The "Overshoot" Fix: Distance Thresholds

If a bullet moves at 500px/s and your game runs at 60 FPS, the bullet moves about 8px per frame. If your collision radius is only 15px, it’s easy for the bullet to "jump" from 10px in front of the enemy to 10px behind the enemy without ever being "less than 15px" away.

---

### Updated Bullet Implementation

Update your `Bullet` class to remove the "die if target is dead" logic and add a travel distance limit so they don't fly forever.

```javascript
class Bullet {
  static zIndex = 8;

  constructor(x, y, target, damage) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = 500;
    this.isDead = false;
    
    // Store the last known target position in case the target dies
    this.lastTargetX = target.x;
    this.lastTargetY = target.y;
    
    // Safety: Kill bullet after 2 seconds to prevent memory leaks
    this.lifeTimer = 2.0; 
  }

  update(dt) {
    this.lifeTimer -= dt;
    if (this.lifeTimer <= 0) this.isDead = true;

    // Update target position only if they are still alive
    if (this.target && !this.target.isDead) {
      this.lastTargetX = this.target.x;
      this.lastTargetY = this.target.y;
    }

    const angle = Math.atan2(
      this.lastTargetX - this.y, // Fixed typo: should be this.lastTargetY - this.y
      this.lastTargetX - this.x
    );
    
    // Corrected update logic
    const targetY = this.target && !this.target.isDead ? this.target.y : this.lastTargetY;
    const targetX = this.target && !this.target.isDead ? this.target.x : this.lastTargetX;
    
    const moveAngle = Math.atan2(targetY - this.y, targetX - this.x);

    this.x += Math.cos(moveAngle) * this.speed * dt;
    this.y += Math.sin(moveAngle) * this.speed * dt;
    
    // If it reaches the point where the enemy was and target is dead, kill bullet
    if (this.target.isDead) {
      const distToLastPos = Math.hypot(this.x - this.lastTargetX, this.y - this.lastTargetY);
      if (distToLastPos < 10) this.isDead = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#ff0";
    ctx.fillRect(this.x - 2, this.y - 2, 5, 5);
  }
}

```

---

### Updated CombatOrchestrator Logic

We need to change how we check for hits. Instead of checking if the bullet is "close" to the target, we check if the bullet has **passed** the target or is touching any enemy in its path.

```javascript
// Inside CombatOrchestrator.update(dt)
for (let b of bullets) {
  // Use a slightly larger hit radius for high-speed bullets
  const hitRadius = 20; 
  
  for (let e of enemies) {
    const dist = Math.hypot(b.x - e.x, b.y - e.y);

    if (dist < hitRadius) {
      b.isDead = true;
      e.hp -= b.damage;

      if (e.hp <= 0 && !e.isDead) {
        e.isDead = true;
        this.gameController.addXP(20);
      }
      break; // Bullet consumed
    }
  }
}

```

### Why this fixes it:

1. **Persistence:** By storing `lastTargetX/Y`, the bullet doesn't just vanish when an enemy dies; it finishes its flight path.
2. **Global Detection:** By checking the bullet against **all** enemies (not just the one it was assigned to), you get "accidental" hits. If a bullet was meant for Enemy A but Enemy B walks in front of it, Enemy B takes the hit. This feels much more natural.
3. **Radius Buff:** Increasing the hit detection radius slightly (from 15 to 20) compensates for the frame-skipping/overshooting at high speeds.

**Would you like me to implement a "Piercing" upgrade where bullets can travel through multiple enemies before disappearing?**
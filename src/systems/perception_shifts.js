// Perception shifts system
export class PerceptionInversion {
  constructor() {
    this.active = false;
  }

  apply() {
    // Stub implementation
  }
}

export class TunnelVision {
  constructor() {
    this.intensity = 0;
  }

  apply() {
    // Stub implementation
  }
}

export function createPerceptionInversion() {
  return new PerceptionInversion();
}

export function createTunnelVision() {
  return new TunnelVision();
}

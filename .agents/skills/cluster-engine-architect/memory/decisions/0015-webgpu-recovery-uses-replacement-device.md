# Decision 0015: WebGPU Recovery Uses Replacement Device

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime

## Decision

WebGPU recovery acquires a replacement runtime generation with a fresh device,
adapter, and canvas context instead of treating a lost device as revivable.

## Context

WebGPU device-loss behavior is asynchronous and browser-dependent. The render
service already owns backend policy privately, so recovery should follow the
same internal acquisition path used during startup.

## Consequences

- Stale `device.lost` completions from prior generations must be ignored.
- Native WebGPU resources and pipelines are recreated against the replacement
  device.
- Public render and game APIs do not expose device replacement mechanics.

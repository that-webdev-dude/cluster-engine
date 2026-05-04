import { describe, expect, it } from "vitest";
import {
    createArchetype,
    parseEntity,
    validateArchetypeFields,
} from "./WorldEntitySchema.module";
import type { Entity } from "../entity";

describe("WorldEntitySchema", () => {
    it("parses entities into sorted archetype ids", () => {
        const parsed = parseEntity({
            id: "player",
            velocity: { x: 1, y: 1 },
            position: { x: 0, y: 0 },
        });

        expect(parsed.entityId).toBe("player");
        expect(parsed.componentNames).toEqual(["position", "velocity"]);
        expect(parsed.archetypeId).toBe("position|velocity");
    });

    it("rejects invalid entity and component shapes", () => {
        expect(() =>
            parseEntity({
                id: "",
                position: { x: 0 },
            }),
        ).toThrow("entityId must be a non-empty string");

        expect(() =>
            parseEntity({
                id: "array-component",
                position: [0, 0],
            } as unknown as Entity),
        ).toThrow("must be a plain object");

        expect(() =>
            parseEntity({
                id: "nested",
                position: { value: { x: 0 } },
            } as unknown as Entity),
        ).toThrow("must be a finite number or string");
    });

    it("validates field drift against an existing archetype", () => {
        const first = parseEntity({
            id: "first",
            position: { x: 0, y: 0 },
        });
        const drifted = parseEntity({
            id: "second",
            position: { x: 1, z: 1 },
        });
        const archetype = createArchetype(first);

        expect(() => validateArchetypeFields(archetype, drifted)).toThrow(
            "fields do not match archetype position",
        );
    });
});

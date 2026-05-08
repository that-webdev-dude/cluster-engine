import type { Entity, EntityId } from "../entity";
import type {
    Archetype,
    ComponentDescriptor,
    ComponentPrimitive,
    ComponentSchema,
} from "../storage/types/component";
import type { ComponentInput, ParsedEntity } from "./WorldStorage.types";

export function parseEntity(entity: Entity): ParsedEntity {
    if (!entity || typeof entity !== "object" || Array.isArray(entity)) {
        throw new TypeError("WorldStorage.spawn: entity must be an object");
    }

    assertEntityId(entity.id);

    const components: Record<string, ComponentInput> = Object.create(null);
    const componentNames = Object.keys(entity)
        .filter((name) => name !== "id")
        .sort();

    if (componentNames.length === 0) {
        throw new Error(
            `WorldStorage.spawn: entity ${entity.id} must include at least one component`,
        );
    }

    for (const componentName of componentNames) {
        assertComponentName(componentName);
        components[componentName] = parseComponent(
            entity.id,
            componentName,
            entity[componentName],
        );
    }

    return {
        entityId: entity.id,
        archetypeId: componentNames.join("|"),
        componentNames,
        components,
    };
}

export function createArchetype(
    parsed: ParsedEntity,
): Archetype<ComponentSchema> {
    const schema = parsed.componentNames.map((componentName) => {
        const fields = Object.create(null) as Record<string, number>;
        Object.keys(parsed.components[componentName]).forEach(
            (fieldName, index) => {
                fields[fieldName] = index;
            },
        );
        return {
            name: componentName,
            fields,
        };
    });

    const byName = new Map<string, ComponentDescriptor>();
    const byType = new Map<number, ComponentDescriptor>();
    const offsets = new Map<number, number>();

    schema.forEach((component, index) => {
        const fieldNames = Object.keys(component.fields);
        const defaults = fieldNames.map((fieldName) =>
            defaultFor(parsed.components[component.name][fieldName]),
        );
        const descriptor: ComponentDescriptor = {
            type: index,
            name: component.name,
            count: fieldNames.length,
            defaults,
            fields: new Set(fieldNames),
        };

        byName.set(component.name, descriptor);
        byType.set(index, descriptor);
        offsets.set(index, 0);
    });

    return {
        descriptors: {
            byName,
            byType,
        },
        offsets,
        types: schema.map((_, index) => index),
        name: parsed.archetypeId,
        schema,
        signature: signatureFor(parsed.archetypeId),
        byteStride: 0,
        elementStride: schema.length,
    };
}

export function validateArchetypeFields(
    archetype: Archetype<ComponentSchema>,
    parsed: ParsedEntity,
): void {
    for (const componentName of parsed.componentNames) {
        const descriptor = archetype.descriptors.byName.get(componentName);
        if (!descriptor) {
            throw new Error(
                `WorldStorage.spawn: component ${componentName} is not part of archetype ${parsed.archetypeId}`,
            );
        }

        const fieldNames = Object.keys(parsed.components[componentName]).sort();
        const descriptorFields = Array.from(descriptor.fields).sort();
        if (!sameStrings(fieldNames, descriptorFields)) {
            throw new Error(
                `WorldStorage.spawn: component ${componentName} fields do not match archetype ${parsed.archetypeId}`,
            );
        }
    }
}

export function assertStoreId(storeId: string): void {
    if (typeof storeId !== "string" || storeId.trim().length === 0) {
        throw new Error(
            "WorldStorage.assertStoreId: storeId must be a non-empty string",
        );
    }
}

export function assertEntityId(entityId: EntityId): void {
    if (typeof entityId !== "string" || entityId.trim().length === 0) {
        throw new Error(
            "WorldStorage.assertEntityId: entityId must be a non-empty string",
        );
    }
}

export function assertComponentName(componentName: string): void {
    if (componentName.trim().length === 0) {
        throw new Error(
            "WorldStorage.assertComponentName: component name must be non-empty",
        );
    }
}

function parseComponent(
    entityId: EntityId,
    componentName: string,
    value: unknown,
): ComponentInput {
    if (!isPlainRecord(value)) {
        throw new TypeError(
            `WorldStorage.spawn: component ${componentName} on entity ${entityId} must be a plain object`,
        );
    }

    const parsed: ComponentInput = Object.create(null);
    const fieldNames = Object.keys(value).sort();
    if (fieldNames.length === 0) {
        throw new Error(
            `WorldStorage.spawn: component ${componentName} on entity ${entityId} must include at least one field`,
        );
    }

    for (const fieldName of fieldNames) {
        assertFieldName(componentName, fieldName);

        const fieldValue = value[fieldName];
        if (!isComponentPrimitive(fieldValue)) {
            throw new TypeError(
                `WorldStorage.spawn: field ${componentName}.${fieldName} on entity ${entityId} must be a finite number or string`,
            );
        }
        parsed[fieldName] = fieldValue;
    }

    return parsed;
}

function assertFieldName(componentName: string, fieldName: string): void {
    if (fieldName.trim().length === 0) {
        throw new Error(
            `WorldStorage.assertFieldName: field name for component ${componentName} must be non-empty`,
        );
    }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function isComponentPrimitive(value: unknown): value is ComponentPrimitive {
    if (typeof value === "string") return true;
    return typeof value === "number" && Number.isFinite(value);
}

function defaultFor(value: ComponentPrimitive): ComponentPrimitive {
    return typeof value === "string" ? "" : 0;
}

function sameStrings(
    left: readonly string[],
    right: readonly string[],
): boolean {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index++) {
        if (left[index] !== right[index]) return false;
    }
    return true;
}

function signatureFor(archetypeId: string): bigint {
    let hash = 0n;
    for (let index = 0; index < archetypeId.length; index++) {
        hash = (hash * 31n + BigInt(archetypeId.charCodeAt(index))) & 0xffffn;
    }
    return hash;
}

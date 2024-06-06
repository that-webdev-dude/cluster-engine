export { Game } from "./core/Game";
export { Entity } from "./core/Entity";
export { Component } from "./core/Component";
export { Container } from "./core/Container";
export { System } from "./core/System";
export { Scene } from "./core/Scene";
export { Assets } from "./core/Assets";

// tools
export { Cmath } from "./tools/Cmath";
export { Vector } from "./tools/Vector";

// entities
import { Circle } from "./tools/entities/Circle";
import { Rect } from "./tools/entities/Rect";
import { Text } from "./tools/entities/Text";
import { Texture } from "./tools/entities/Texture";
const Entities = { Circle, Rect, Text, Texture };
export { Entities };

// components
import { Transform } from "./tools/components/Transform";
import { Image } from "./tools/components/Image";
import { Size } from "./tools/components/Size";
import { Alpha } from "./tools/components/Alpha";
import { Radius } from "./tools/components/Radius";
import { Message } from "./tools/components/Message";
import { Visibility } from "./tools/components/Visibility";
import { Input } from "./tools/components/Input";
import { ShapeStyle } from "./tools/components/Style";
import { TextStyle } from "./tools/components/Style";
import { Speed } from "./tools/components/Speed";
const Components = {
  Transform,
  Image,
  Size,
  Alpha,
  Radius,
  Message,
  Visibility,
  Input,
  ShapeStyle,
  TextStyle,
  Speed,
};
export { Components };

// systems
import { RenderSystem } from "./tools/systems/RenderSystem";
import { InputSystem } from "./tools/systems/InputSystem";
import { MovementSystem } from "./tools/systems/MovementSystem";
const Systems = { RenderSystem, InputSystem, MovementSystem };
export { Systems };

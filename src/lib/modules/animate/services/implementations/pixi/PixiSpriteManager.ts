/**
 * PixiJS Sprite Manager
 *
 * Handles sprite lifecycle and updates:
 * - Creating and caching sprites
 * - Updating sprite properties (position, rotation, scale, alpha)
 * - Managing sprite visibility
 * - Sprite cleanup
 *
 * Single Responsibility: Sprite management and updates
 */

import type { Container, Texture } from "pixi.js";
import { Sprite } from "pixi.js";

export class PixiSpriteManager {
  // Layer containers
  private gridContainer: Container;
  private propContainer: Container;
  private glyphContainer: Container;

  // Sprites
  private gridSprite: Sprite | null = null;
  private bluePropSprite: Sprite | null = null;
  private redPropSprite: Sprite | null = null;
  private secondaryBluePropSprite: Sprite | null = null;
  private secondaryRedPropSprite: Sprite | null = null;
  private glyphSprite: Sprite | null = null;
  private previousGlyphSprite: Sprite | null = null;

  constructor(
    gridContainer: Container,
    propContainer: Container,
    glyphContainer: Container
  ) {
    this.gridContainer = gridContainer;
    this.propContainer = propContainer;
    this.glyphContainer = glyphContainer;
  }

  updateGridSprite(texture: Texture, size: number): void {
    if (this.gridSprite) {
      this.gridSprite.texture = texture;
      this.gridSprite.width = size;
      this.gridSprite.height = size;
    } else {
      this.gridSprite = new Sprite(texture);
      this.gridSprite.width = size;
      this.gridSprite.height = size;
      this.gridContainer.addChild(this.gridSprite);
    }
  }

  setGridVisibility(visible: boolean): void {
    if (this.gridSprite) {
      this.gridSprite.visible = visible;
    }
  }

  updateGlyphSprite(
    texture: Texture,
    size: number,
    _previousTexture: Texture | null
  ): {
    current: Sprite;
    previous: Sprite | null;
  } {
    // Save previous glyph for fade transition
    if (this.glyphSprite) {
      this.previousGlyphSprite = this.glyphSprite;
    }

    // Create new glyph sprite
    this.glyphSprite = new Sprite(texture);
    this.glyphSprite.width = size;
    this.glyphSprite.height = size;
    this.glyphSprite.alpha = 0; // Start invisible for fade-in

    this.glyphContainer.addChild(this.glyphSprite);

    return {
      current: this.glyphSprite,
      previous: this.previousGlyphSprite,
    };
  }

  setGlyphAlpha(currentAlpha: number, previousAlpha?: number): void {
    if (this.glyphSprite) {
      this.glyphSprite.alpha = currentAlpha;
    }
    if (this.previousGlyphSprite && previousAlpha !== undefined) {
      this.previousGlyphSprite.alpha = previousAlpha;
    }
  }

  removePreviousGlyph(): void {
    if (this.previousGlyphSprite) {
      this.glyphContainer.removeChild(this.previousGlyphSprite);
      this.previousGlyphSprite.destroy();
      this.previousGlyphSprite = null;
    }
  }

  updatePropSprite(
    color: "blue" | "red" | "secondaryBlue" | "secondaryRed",
    texture: Texture,
    position: { x: number; y: number },
    size: { width: number; height: number },
    rotation: number
  ): void {
    // Get or create sprite
    let sprite: Sprite | null =
      color === "blue"
        ? this.bluePropSprite
        : color === "red"
          ? this.redPropSprite
          : color === "secondaryBlue"
            ? this.secondaryBluePropSprite
            : this.secondaryRedPropSprite;

    if (!sprite) {
      sprite = new Sprite(texture);
      if (color === "blue") {
        this.bluePropSprite = sprite;
      } else if (color === "red") {
        this.redPropSprite = sprite;
      } else if (color === "secondaryBlue") {
        this.secondaryBluePropSprite = sprite;
      } else {
        this.secondaryRedPropSprite = sprite;
      }
      this.propContainer.addChild(sprite);
    } else {
      sprite.texture = texture;
    }

    // Update sprite properties
    sprite.visible = true;
    sprite.width = size.width;
    sprite.height = size.height;
    sprite.anchor.set(0.5, 0.5); // Center anchor point
    sprite.position.set(position.x, position.y);
    sprite.rotation = rotation;
  }

  setPropVisibility(
    color: "blue" | "red" | "secondaryBlue" | "secondaryRed",
    visible: boolean
  ): void {
    const sprite =
      color === "blue"
        ? this.bluePropSprite
        : color === "red"
          ? this.redPropSprite
          : color === "secondaryBlue"
            ? this.secondaryBluePropSprite
            : this.secondaryRedPropSprite;

    if (sprite) {
      sprite.visible = visible;
    }
  }

  resizeAllSprites(newSize: number): void {
    if (this.gridSprite) {
      this.gridSprite.width = newSize;
      this.gridSprite.height = newSize;
    }

    if (this.glyphSprite) {
      this.glyphSprite.width = newSize;
      this.glyphSprite.height = newSize;
    }

    if (this.previousGlyphSprite) {
      this.previousGlyphSprite.width = newSize;
      this.previousGlyphSprite.height = newSize;
    }

    // Props will be resized when they're next rendered
  }

  getGlyphSprite(): Sprite | null {
    return this.glyphSprite;
  }

  getPreviousGlyphSprite(): Sprite | null {
    return this.previousGlyphSprite;
  }

  destroy(): void {
    try {
      this.bluePropSprite?.destroy();
      this.redPropSprite?.destroy();
      this.secondaryBluePropSprite?.destroy();
      this.secondaryRedPropSprite?.destroy();
      this.gridSprite?.destroy();
      this.glyphSprite?.destroy();
      this.previousGlyphSprite?.destroy();
    } catch (_e) {
      // Ignore sprite destroy errors
    }

    this.bluePropSprite = null;
    this.redPropSprite = null;
    this.secondaryBluePropSprite = null;
    this.secondaryRedPropSprite = null;
    this.gridSprite = null;
    this.glyphSprite = null;
    this.previousGlyphSprite = null;
  }
}

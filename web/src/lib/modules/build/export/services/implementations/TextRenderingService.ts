/**
 * Text Rendering Service
 *
 * Orchestrates text rendering operations using individual text renderers.
 */

import { injectable, inject } from "inversify";
import { TYPES } from "$shared";
import type { TextRenderOptions, UserInfo } from "../../domain/models";
import type { IWordTextRenderer, IUserInfoRenderer, IDifficultyBadgeRenderer, ITextRenderingUtils } from "../contracts";

export interface ITextRenderingService {
  renderWordText(canvas: HTMLCanvasElement, word: string, options: TextRenderOptions): void;
  renderUserInfo(canvas: HTMLCanvasElement, userInfo: UserInfo, options: TextRenderOptions): void;
  renderDifficultyBadge(canvas: HTMLCanvasElement, level: number, position: [number, number], size: number): void;
  measureText(text: string, fontFamily: string, fontSize: number, fontWeight?: string): { width: number; height: number };
  renderTextWithKerning(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, kerning: number): void;
}

@injectable()
export class TextRenderingService implements ITextRenderingService {
  constructor(
    @inject(TYPES.IWordTextRenderer) private wordRenderer: IWordTextRenderer,
    @inject(TYPES.IUserInfoRenderer) private userInfoRenderer: IUserInfoRenderer,
    @inject(TYPES.IDifficultyBadgeRenderer) private difficultyRenderer: IDifficultyBadgeRenderer,
    @inject(TYPES.ITextRenderingUtils) private textUtils: ITextRenderingUtils
  ) {}

  renderWordText(canvas: HTMLCanvasElement, word: string, options: TextRenderOptions): void {
    this.wordRenderer.render(canvas, word, options);
  }

  renderUserInfo(canvas: HTMLCanvasElement, userInfo: UserInfo, options: TextRenderOptions): void {
    this.userInfoRenderer.render(canvas, userInfo, options);
  }

  renderDifficultyBadge(canvas: HTMLCanvasElement, level: number, position: [number, number], size: number): void {
    this.difficultyRenderer.render(canvas, level, position, size);
  }

  measureText(text: string, fontFamily: string, fontSize: number, fontWeight?: string): { width: number; height: number } {
    return this.textUtils.measureText(text, fontFamily, fontSize, fontWeight);
  }

  renderTextWithKerning(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, kerning: number): void {
    this.textUtils.renderTextWithKerning(ctx, text, x, y, kerning);
  }
}

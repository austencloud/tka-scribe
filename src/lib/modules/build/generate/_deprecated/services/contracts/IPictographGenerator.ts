import type { PictographData } from "$shared";

export interface IPictographGenerator {
  // Standard letter generators
  generateA(): PictographData[];
  generateB(): PictographData[];
  generateC(): PictographData[];
  generateD(): PictographData[];
  generateE(): PictographData[];
  generateF(): PictographData[];
  generateG(): PictographData[];
  generateH(): PictographData[];
  generateI(): PictographData[];
  generateJ(): PictographData[];
  generateK(): PictographData[];
  generateL(): PictographData[];
  generateM(): PictographData[];
  generateN(): PictographData[];
  generateO(): PictographData[];
  generateP(): PictographData[];
  generateQ(): PictographData[];
  generateR(): PictographData[];
  generateS(): PictographData[];
  generateT(): PictographData[];
  generateU(): PictographData[];
  generateV(): PictographData[];
  generateW(): PictographData[];
  generateX(): PictographData[];
  generateY(): PictographData[];
  generateZ(): PictographData[];

  // Greek letter generators
  generateSigma(): PictographData[];
  generateDelta(): PictographData[];
  generateTheta(): PictographData[];
  generateOmega(): PictographData[];
  generatePhi(): PictographData[];
  generatePsi(): PictographData[];
  generateLambda(): PictographData[];
  generateAlpha(): PictographData[];
  generateBeta(): PictographData[];
  generateGamma(): PictographData[];

  // Dash variant generators
  generateWDash(): PictographData[];
  generateXDash(): PictographData[];
  generateYDash(): PictographData[];
  generateZDash(): PictographData[];
  generateSigmaDash(): PictographData[];
  generateDeltaDash(): PictographData[];
  generateThetaDash(): PictographData[];
  generateOmegaDash(): PictographData[];
  generatePhiDash(): PictographData[];
  generatePsiDash(): PictographData[];
  generateLambdaDash(): PictographData[];

  // Utility methods
  getAllPictographs(): PictographData[];
  getPictographsByLetter(letter: string): PictographData[] | undefined;
}


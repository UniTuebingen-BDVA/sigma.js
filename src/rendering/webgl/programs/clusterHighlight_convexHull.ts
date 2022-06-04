import { Coordinates } from "../../../types";
import { rgbaToFloatColor } from "../../../utils";
import vertexShaderSource from "../shaders/clusterHighlight.rectangle.vert.glsl";
import fragmentShaderSource from "../shaders/clusterHighlight.rectangle.frag.glsl";
import { AbstractClusterHighlightProgram } from "./common/clusterHighlight";
import { RenderParams } from "./common/program";



const ATTRIBUTES = 3;

export default class ClusterHighlightingConvexHullProgram extends AbstractClusterHighlightProgram {
  constructor(gl: WebGLRenderingContext) {
    super(gl, vertexShaderSource, fragmentShaderSource, 0, ATTRIBUTES);
    this.bind();
  }

  process(data: Array<Coordinates>, offset: number): void {
    const array = this.array;
    let POINTS = data.length
    let i = offset * POINTS * ATTRIBUTES;
    let grey_val = 100;
    let a = offset == 0 ? 0.0: 1.0
    const color = rgbaToFloatColor(grey_val, grey_val, grey_val, a);

    for (let j = 0; j < data.length; j++){
      array[i++] = data[j].x;
      array[i++] = data[j].y;
      array[i++] = color;
    }
  }

  render(params: RenderParams): void {
    if (this.hasNothingToRender()) return;

    const gl = this.gl;
    const program = this.program;
    gl.useProgram(program);

    // gl.uniform1f(this.sqrtZoomRatioLocation, Math.sqrt(params.ratio));
    // gl.uniform1f(this.correctionRatioLocation, params.correctionRatio);
    gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.array.length / ATTRIBUTES);
  }
}
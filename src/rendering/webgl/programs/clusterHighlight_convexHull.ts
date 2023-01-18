import { Coordinates } from "../../../types";
import { rgbaToFloatColor } from "../../../utils";
import vertexShaderSource from "../shaders/clusterHighlight.rectangle.vert.glsl";
import fragmentShaderSource from "../shaders/clusterHighlight.rectangle.frag.glsl";
import { AbstractClusterHighlightProgram } from "./common/clusterHighlight";
import { RenderParams } from "./common/program";



const ATTRIBUTES = 3;

export default class ClusterHighlightingConvexHullProgram extends AbstractClusterHighlightProgram {
  cH_start_length: [[number, number]];
  constructor(gl: WebGLRenderingContext) {
    super(gl, vertexShaderSource, fragmentShaderSource, 0, ATTRIBUTES);
    this.bind();
    this.cH_start_length = [[0,0]];
  }

  process(data: Array<Coordinates>, clusterColors: [number,number,number,number], offset: number, numPrevPoints: number): void {
    const array = this.array;
    let i = numPrevPoints * ATTRIBUTES;
    const color = rgbaToFloatColor(...clusterColors);

    for (let j = 0; j < data.length; j++){
      array[i++] = data[j].x;
      array[i++] = data[j].y;
      array[i++] = color;
    }
    this.cH_start_length.push([numPrevPoints, data.length])
  }

  render(params: RenderParams): void {
    if (this.hasNothingToRender()) return;

    const gl = this.gl;
    const program = this.program;
    gl.useProgram(program);

    gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);
    this.cH_start_length.shift()
    for (let sL of this.cH_start_length){
      gl.drawArrays(gl.TRIANGLE_FAN, sL[0], sL[1]);
  }
  }
}

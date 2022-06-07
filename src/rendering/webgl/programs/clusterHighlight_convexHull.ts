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

  process(data: Array<Coordinates>, offset: number, numPrevPoints: number, maxNumCluster: number): void {
    const array = this.array;
    let i = numPrevPoints * ATTRIBUTES;
    let grey_val = maxNumCluster>1 ? ((offset - 1) / (maxNumCluster - 1)) * (225 - 80) + 80: 225
    let a = offset == 0 ? 0.0: 1.0
    const color = rgbaToFloatColor(grey_val, grey_val, grey_val, a);

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
import { ClusterRectangleData } from "../../../types";
import { rgbaToFloatColor } from "../../../utils";
import vertexShaderSource from "../shaders/clusterHighlight.rectangle.vert.glsl";
import fragmentShaderSource from "../shaders/clusterHighlight.rectangle.frag.glsl";
import { AbstractClusterHighlightProgram } from "./common/clusterHighlight";
import { RenderParams } from "./common/program";


const POINTS = 6;
const ATTRIBUTES = 3;

export default class ClusterHighlightingRectangleProgram extends AbstractClusterHighlightProgram {
  constructor(gl: WebGLRenderingContext) {
    super(gl, vertexShaderSource, fragmentShaderSource, POINTS, ATTRIBUTES);
    this.bind();
  }

  process(data: ClusterRectangleData, offset: number, numPrevPoints?:number,  maxNumCluster?: number): void {
    const array = this.array;
    let i = offset * POINTS * ATTRIBUTES;
    let grey_val = 100 + (data.xMin + data.xMax + data.yMin + data.yMax) / 4 * 150;
    let a = offset == 0 ? 0.0: 1.0
    const color = rgbaToFloatColor(grey_val, grey_val, grey_val, a);
    // Triangle 1
    array[i++] = data.xMin;
    array[i++] = data.yMin;
    array[i++] = color;

    array[i++] = data.xMin;
    array[i++] = data.yMax;
    array[i++] = color;

    array[i++] = data.xMax;
    array[i++] = data.yMax;
    array[i++] = color;

    // Triangle 2
    array[i++] = data.xMin;
    array[i++] = data.yMin;
    array[i++] = color;

    array[i++] = data.xMax;
    array[i++] = data.yMin;
    array[i++] = color;

    array[i++] = data.xMax;
    array[i++] = data.yMax;
    array[i] = color;
  }

  render(params: RenderParams): void {
    if (this.hasNothingToRender()) return;

    const gl = this.gl;
    const program = this.program;
    gl.useProgram(program);

    // gl.uniform1f(this.sqrtZoomRatioLocation, Math.sqrt(params.ratio));
    // gl.uniform1f(this.correctionRatioLocation, params.correctionRatio);
    gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);

    gl.drawArrays(gl.TRIANGLES, 0, this.array.length / ATTRIBUTES);
  }
}
"use strict";
// var __extends = (this && this.__extends) || (function () {
//     var extendStatics = function (d, b) {
//         extendStatics = Object.setPrototypeOf ||
//             ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
//             function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
//         return extendStatics(d, b);
//     };
//     return function (d, b) {
//         if (typeof b !== "function" && b !== null)
//             throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
//         extendStatics(d, b);
//         function __() { this.constructor = d; }
//         d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
//     };
// })();
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.createNodeCompoundProgram = exports.AbstractNodeProgram = void 0;
/**
 * Sigma WebGL Abstract Node Program
 * =====================================
 *
 * @module
 */
// var program_1 = require("./program");
// var __importDefault = function (mod: { __esModule: string; }) {
//   return (mod && mod.__esModule) ? mod : { "default": mod };
// };
// var vertexShaderSource = __importDefault(require("../shaders/clusterHighlight.rectangle.frag.glsl.js"));
// var fragmentShaderSource = __importDefault(require("../shaders/clusterHighlight.rectangle.frag.glsl.js"));


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

  process(data: ClusterRectangleData, offset: number): void {
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
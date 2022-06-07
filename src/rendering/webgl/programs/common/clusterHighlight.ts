/**
 * Sigma.js WebGL Abstract ClusterHighlight Program
 * =====================================
 *
 * @module
 */
 import { AbstractProgram, IProgram, RenderParams } from "./program";
 import { ClusterHighlightData } from "../../../../types";
 import Sigma from "../../../../sigma";
 
 export interface IClusterHighlightProgram extends IProgram {
   process(data: ClusterHighlightData, offset: number, numPrevPoints?: number): void;
   render(params: RenderParams): void;
 }
 
 /**
  * ClusterHighlight Program class.
  *
  * @constructor
  */
 export abstract class AbstractClusterHighlightProgram extends AbstractProgram implements IClusterHighlightProgram {
   positionLocation: GLint;
   colorLocation: GLint;
   matrixLocation: WebGLUniformLocation;

   constructor(
     gl: WebGLRenderingContext,
     vertexShaderSource: string,
     fragmentShaderSource: string,
     points: number,
     attributes: number,
   ) {
     super(gl, vertexShaderSource, fragmentShaderSource, points, attributes);
 
     // Locations
     this.positionLocation = gl.getAttribLocation(this.program, "a_position");
     this.colorLocation = gl.getAttribLocation(this.program, "a_color");
 
     // Uniform Location
     const matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
     if (matrixLocation === null) throw new Error("AbstractClusterHighlightProgram: error while getting matrixLocation");
     this.matrixLocation = matrixLocation;
   }
 
   bind(): void {
     const gl = this.gl;
 
     gl.enableVertexAttribArray(this.positionLocation);
     gl.enableVertexAttribArray(this.colorLocation);
     gl.vertexAttribPointer(
       this.positionLocation,
       2,
       gl.FLOAT,
       false,
       this.attributes * Float32Array.BYTES_PER_ELEMENT,
       0,
     );
     gl.vertexAttribPointer(
       this.colorLocation,
       4,
       gl.UNSIGNED_BYTE,
       true,
       this.attributes * Float32Array.BYTES_PER_ELEMENT,
       8,
     );
   }
 
   abstract process(data: ClusterHighlightData, offset: number, numPrevPoints?: number): void;
 }
 
 export interface ClusterHighlightProgramConstructor {
   new (gl: WebGLRenderingContext, renderer: Sigma): IClusterHighlightProgram;
 }
 
 /**
  * Helper function combining two or more programs into a single compound one.
  * Note that this is more a quick & easy way to combine program than a really
  * performant option. More performant programs can be written entirely.
  *
  * @param  {array}    programClasses - Program classes to combine.
  * @return {function}
  */
 export function createClusterHighlightCompoundProgram(programClasses: Array<ClusterHighlightProgramConstructor>): ClusterHighlightProgramConstructor {
   return class ClusterHighlightCompoundProgram implements IClusterHighlightProgram {
     programs: Array<IClusterHighlightProgram>;
 
     constructor(gl: WebGLRenderingContext, renderer: Sigma) {
       this.programs = programClasses.map((ProgramClass) => new ProgramClass(gl, renderer));
     }
 
     bufferData(): void {
       this.programs.forEach((program) => program.bufferData());
     }
 
     allocate(capacity: number, calcArraySize?: number): void {
       this.programs.forEach((program) => program.allocate(capacity = 0, calcArraySize = undefined));
     }
 
     bind(): void {
       // nothing todo, it's already done in each program constructor
     }
 
     render(params: RenderParams): void {
       this.programs.forEach((program) => {
         program.bind();
         program.bufferData();
         program.render(params);
       });
     }
 
     process(data: ClusterHighlightData, offset: number, numPrevPoints?:number): void {
       this.programs.forEach((program) => program.process(data, offset, numPrevPoints));
     }
   };
 }
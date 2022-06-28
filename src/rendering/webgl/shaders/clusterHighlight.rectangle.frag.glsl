precision mediump float;

varying vec4 v_color;

const float radius = 0.5;
const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {

  gl_FragColor = v_color; 
  
}
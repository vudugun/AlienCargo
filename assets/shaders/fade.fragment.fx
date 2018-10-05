precision highp float;

uniform sampler2D textureSampler;
uniform float fadeLevel;
varying vec2 vUV;

void main(void) {
  vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;
  baseColor.a = 1.0;
  gl_FragColor = baseColor;
}

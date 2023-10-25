import * as THREE from '../three.js-131/build/three.module.js';

class BackgroundMaterial extends THREE.RawShaderMaterial {
  static shader = {
    vertexShader: `
        attribute vec3 position;

        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
    fragmentShader: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 resolution;
        uniform float time;

        #define RGB(r, g, b) vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0)

        float blendColorDodge(float base, float blend) {
          return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
        }

        vec3 blendColorDodge(vec3 base, vec3 blend) {
          return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
        }

        vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
          return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
        }

        void main() {
          vec2 p = gl_FragCoord.xy / resolution.xy;
          p -= vec2(0.5);
          p.x *= resolution.x / resolution.y;
          vec3 color1 = RGB(40, 55, 90);
          vec3 color2 = RGB(0, 0, 0);
          vec3 highlight = RGB(255, 255, 255);
          float dist = length(p);
          float highlightDist = pow(max(0., 1. - distance(p, vec2(-0.12, 0.12)) * 4.), 3.);

          gl_FragColor = vec4(mix(color1, color2, dist), 1.0);
          gl_FragColor.rgb += highlight * highlightDist * .2;
          gl_FragColor.rgb = blendColorDodge(gl_FragColor.rgb, highlight * highlightDist);
        }
      `,
    uniforms: {
      resolution: {
        value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio)
      }
    },
    side: THREE.BackSide
  };

  constructor() {
    super(BackgroundMaterial.shader);

    this.resize = () => {
      this.uniforms.resolution.value.set(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    };

    window.addEventListener('resize', this.resize);
  }

}

export default BackgroundMaterial;

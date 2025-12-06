import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef, useState } from 'react';
import './Iridescence.css';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Iridescence({ color = [1, 1, 1], speed = 1.0, amplitude = 0.1, mouseReact = true, ...rest }) {
  const ctnDom = useRef(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (!ctnDom.current) return;

    const ctn = ctnDom.current;
    let renderer = null;
    let gl = null;
    let program = null;
    let mesh = null;
    let animateId = null;

    // Check WebGL support and initialize
    try {
      // First check if WebGL is available
      const testCanvas = document.createElement('canvas');
      const testGl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      
      if (!testGl) {
        setWebglSupported(false);
        return;
      }

      // Try to create renderer
      renderer = new Renderer();
      gl = renderer.gl;
      
      if (!gl) {
        setWebglSupported(false);
        return;
      }

      gl.clearColor(1, 1, 1, 1);

      function resize() {
        if (!renderer || !ctn) return;
        const scale = 1;
        renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
        if (program && gl) {
          program.uniforms.uResolution.value = new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          );
        }
      }

      window.addEventListener('resize', resize, false);
      resize();

      const geometry = new Triangle(gl);
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(...color) },
          uResolution: {
            value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
          },
          uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
          uAmplitude: { value: amplitude },
          uSpeed: { value: speed }
        }
      });

      mesh = new Mesh(gl, { geometry, program });

      function update(t) {
        if (!program || !renderer || !mesh) return;
        animateId = requestAnimationFrame(update);
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: mesh });
      }

      animateId = requestAnimationFrame(update);
      
      if (gl.canvas && ctn) {
        ctn.appendChild(gl.canvas);
      }

      function handleMouseMove(e) {
        if (!program || !ctn) return;
        const rect = ctn.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        mousePos.current = { x, y };
        if (program.uniforms.uMouse) {
          program.uniforms.uMouse.value[0] = x;
          program.uniforms.uMouse.value[1] = y;
        }
      }

      if (mouseReact) {
        ctn.addEventListener('mousemove', handleMouseMove);
      }

      return () => {
        if (animateId) {
          cancelAnimationFrame(animateId);
        }
        window.removeEventListener('resize', resize);
        if (mouseReact && ctn) {
          ctn.removeEventListener('mousemove', handleMouseMove);
        }
        if (gl && gl.canvas && ctn && ctn.contains(gl.canvas)) {
          ctn.removeChild(gl.canvas);
        }
        if (gl) {
          try {
            gl.getExtension('WEBGL_lose_context')?.loseContext();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      };
    } catch (e) {
      console.warn('WebGL not supported, using fallback:', e);
      setWebglSupported(false);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, speed, amplitude, mouseReact]);

  // Fallback jika WebGL tidak didukung
  if (!webglSupported) {
    return (
      <div 
        ref={ctnDom} 
        className="iridescence-container iridescence-fallback" 
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(79, 70, 229, 0.9) 50%, rgba(99, 102, 241, 0.8) 100%)',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }}
        {...rest} 
      />
    );
  }

  return <div ref={ctnDom} className="iridescence-container" {...rest} />;
}


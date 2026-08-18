import * as THREE from "three";
import { textVertexShader, textFragmentShader } from "../shaders/textShaders";

/**
 * The intro heading, one glyph per quad. In the scene rather than the DOM so
 * the planes sweep over it as the ring spins — text draws first, planes draw
 * on top. Each quad is a mask its glyph wipes up through.
 *
 * `chars` are the reveal uniforms and `fades` the opacity ones; the entry
 * timeline tweens both as arrays.
 */
export function createSplitText(group, params) {
  let chars = [];
  let fades = [];

  const dispose = () => {
    for (const child of [...group.children]) {
      group.remove(child);
      child.geometry.dispose();
      child.material.uniforms.uTex.value?.dispose();
      child.material.dispose();
    }
    chars = [];
    fades = [];
  };

  const build = () => {
    dispose();

    const size = params.textSize;
    // Above display resolution — type is the first thing to show softness and
    // these canvases are tiny.
    const dpr = Math.min(window.devicePixelRatio, 2) * 2;
    const font = `${params.textWeight} ${size}px "${params.textFont}", ui-sans-serif, system-ui, sans-serif`;

    const measure = document.createElement("canvas").getContext("2d");
    measure.font = font;

    const tracking = params.textTracking * size;
    // Padding gives overhanging glyphs room and lengthens the wipe a little.
    const pad = size * 0.25;
    const cellH = size * 1.3 + pad * 2;
    const lines = String(params.text || "")
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);
    const lineHeight = size * (params.textLineHeight || 1.02);
    const blockH = Math.max(0, (lines.length - 1) * lineHeight);

    lines.forEach((line, lineIndex) => {
      const glyphs = [...line];
      const advances = glyphs.map((ch) => measure.measureText(ch).width);
      const totalW =
        advances.reduce((a, b) => a + b, 0) + tracking * Math.max(0, glyphs.length - 1);
      const y = blockH * 0.5 - lineIndex * lineHeight;
      let x = -totalW / 2;

      glyphs.forEach((ch, glyphIndex) => {
        const adv = advances[glyphIndex];
        if (ch.trim()) {
          const cellW = adv + pad * 2;

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.ceil(cellW * dpr));
          canvas.height = Math.max(1, Math.ceil(cellH * dpr));
          const ctx = canvas.getContext("2d");
          ctx.scale(dpr, dpr);
          ctx.font = font;
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = "#000";
          ctx.fillText(ch, pad, pad + size); // puts cap-height centre on y = 0

          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.NoColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;

          const mat = new THREE.ShaderMaterial({
            vertexShader: textVertexShader,
            fragmentShader: textFragmentShader,
            uniforms: {
              uTex: { value: tex },
              uReveal: { value: 0 },
              uColor: { value: new THREE.Color(params.textColor) },
              uOpacity: { value: 1 },
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
          });

          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
          mesh.scale.set(cellW, cellH, 1);
          // Each row centres itself, then the whole block is centred vertically.
          mesh.position.set(x + adv / 2, y, 0);
          mesh.renderOrder = 0;
          group.add(mesh);
          chars.push(mat.uniforms.uReveal);
          fades.push(mat.uniforms.uOpacity);
        }
        x += adv + tracking;
      });
    });
  };

  return {
    build,
    dispose,
    get chars() {
      return chars;
    },
    get fades() {
      return fades;
    },
  };
}

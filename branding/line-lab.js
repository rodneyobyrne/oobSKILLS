(() => {
  const insertBefore = document.querySelector('.brand-cta-section');
  if (!insertBefore || document.getElementById('line-lab-heading')) return;

  const section = document.createElement('section');
  section.className = 'brand-line-lab content-section--soft';
  section.setAttribute('aria-labelledby', 'line-lab-heading');
  section.innerHTML = `
    <div class="site-shell">
      <div class="brand-section-intro">
        <p class="eyebrow">Outer-box line tuning</p>
        <h2 id="line-lab-heading">Tune the hand-drawn perimeter by eye.</h2>
        <p class="section-copy">Canonical perimeter: 2 peaks · 4px rise/fall · 2.5–4.0px thickness · 1 pressure pool · 0px corner overshoot. CTA buttons keep their separate approved styling.</p>
      </div>

      <div class="line-lab">
        <form class="line-lab__controls" id="lineLabControls">
          <div class="line-lab__control"><div class="line-lab__control-head"><label for="linePeaks">Peaks per edge</label><output for="linePeaks" id="linePeaksOut">2</output></div><input id="linePeaks" type="range" min="1" max="8" step="1" value="2"><p>Canonical value: 2.</p></div>
          <div class="line-lab__control"><div class="line-lab__control-head"><label for="lineAmplitude">Rise / fall</label><output for="lineAmplitude" id="lineAmplitudeOut">4 px</output></div><input id="lineAmplitude" type="range" min="1" max="16" step="1" value="4"><p>Maximum deviation from the baseline.</p></div>
          <div class="line-lab__control"><div class="line-lab__control-head"><label for="lineMinWeight">Minimum thickness</label><output for="lineMinWeight" id="lineMinWeightOut">2.5 px</output></div><input id="lineMinWeight" type="range" min="1" max="4" step="0.1" value="2.5"></div>
          <div class="line-lab__control"><div class="line-lab__control-head"><label for="lineMaxWeight">Maximum thickness</label><output for="lineMaxWeight" id="lineMaxWeightOut">4.0 px</output></div><input id="lineMaxWeight" type="range" min="2" max="7" step="0.1" value="4"></div>
          <div class="line-lab__control"><div class="line-lab__control-head"><label for="linePools">Pressure pools</label><output for="linePools" id="linePoolsOut">1</output></div><input id="linePools" type="range" min="0" max="3" step="1" value="1"><p>One localized area of heavier ink per edge.</p></div>
          <div class="line-lab__control"><div class="line-lab__control-head"><label for="lineOvershoot">Corner overshoot</label><output for="lineOvershoot" id="lineOvershootOut">0 px</output></div><input id="lineOvershoot" type="range" min="0" max="16" step="1" value="0"><p>Canonical value: strokes stop at the corner.</p></div>
          <button class="line-lab__reset" type="button" id="lineLabReset">Reset to canonical values</button>
        </form>

        <div class="line-lab__previews">
          <figure class="line-lab__preview"><figcaption><strong>Long-edge preview</strong><span>Two broad peaks, one pressure pool, no chatter.</span></figcaption><svg class="line-lab__line-svg" viewBox="0 0 720 120" role="img" aria-label="Preview of the adjustable hand-drawn line"><path id="linePreviewPath" fill="currentColor"></path></svg></figure>
          <figure class="line-lab__preview line-lab__preview--box"><figcaption><strong>Outer-box preview</strong><span>Strokes terminate at the nominal 90° corners.</span></figcaption><div class="line-lab__box-stage"><svg class="line-lab__box-svg" viewBox="0 0 720 300" aria-hidden="true"><path id="boxPreviewTop" fill="currentColor"></path><path id="boxPreviewRight" fill="currentColor"></path><path id="boxPreviewBottom" fill="currentColor"></path><path id="boxPreviewLeft" fill="currentColor"></path></svg><div class="line-lab__sample-copy"><p class="eyebrow">Sample outer box</p><h3>All interface text stays live.</h3><p>The box is drawing. The words are still normal browser text.</p></div></div></figure>
          <p class="line-lab__readout" id="lineLabReadout" aria-live="polite"></p>
        </div>
      </div>
    </div>`;

  insertBefore.parentNode.insertBefore(section, insertBefore);

  const controls = {
    peaks: document.getElementById('linePeaks'), amplitude: document.getElementById('lineAmplitude'),
    minWeight: document.getElementById('lineMinWeight'), maxWeight: document.getElementById('lineMaxWeight'),
    pools: document.getElementById('linePools'), overshoot: document.getElementById('lineOvershoot')
  };
  const outputs = {
    peaks: document.getElementById('linePeaksOut'), amplitude: document.getElementById('lineAmplitudeOut'),
    minWeight: document.getElementById('lineMinWeightOut'), maxWeight: document.getElementById('lineMaxWeightOut'),
    pools: document.getElementById('linePoolsOut'), overshoot: document.getElementById('lineOvershootOut')
  };
  const defaults = { peaks: 2, amplitude: 4, minWeight: 2.5, maxWeight: 4, pools: 1, overshoot: 0 };
  const linePath = document.getElementById('linePreviewPath');
  const boxTop = document.getElementById('boxPreviewTop');
  const boxRight = document.getElementById('boxPreviewRight');
  const boxBottom = document.getElementById('boxPreviewBottom');
  const boxLeft = document.getElementById('boxPreviewLeft');
  const readout = document.getElementById('lineLabReadout');

  const gaussian = (t, center, spread) => Math.exp(-Math.pow((t - center) / spread, 2));

  function makeRibbon({ orientation = 'horizontal', x = 0, y = 0, length = 600, peaks = 2, amplitude = 4, minWeight = 2.5, maxWeight = 4, pools = 1, phase = 0 }) {
    const samples = Math.max(64, peaks * 32);
    const edgeA = [];
    const edgeB = [];
    const poolCenters = Array.from({ length: pools }, (_, i) => (i + 1) / (pools + 1));

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const axis = t * length;
      const centerOffset = Math.sin((t * Math.PI * 2 * peaks) + phase) * amplitude;
      const pressure = pools ? Math.max(...poolCenters.map((center) => gaussian(t, center, .14))) : 0;
      const thickness = minWeight + ((maxWeight - minWeight) * pressure);
      const half = thickness / 2;
      if (orientation === 'horizontal') {
        edgeA.push([x + axis, y + centerOffset - half]); edgeB.push([x + axis, y + centerOffset + half]);
      } else {
        edgeA.push([x + centerOffset - half, y + axis]); edgeB.push([x + centerOffset + half, y + axis]);
      }
    }

    let d = `M ${edgeA[0][0].toFixed(2)} ${edgeA[0][1].toFixed(2)}`;
    edgeA.slice(1).forEach(([px, py]) => { d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`; });
    edgeB.slice().reverse().forEach(([px, py]) => { d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`; });
    return `${d} Z`;
  }

  function values() {
    const minWeight = Number(controls.minWeight.value);
    return { peaks: Number(controls.peaks.value), amplitude: Number(controls.amplitude.value), minWeight, maxWeight: Math.max(minWeight, Number(controls.maxWeight.value)), pools: Number(controls.pools.value), overshoot: Number(controls.overshoot.value) };
  }

  function render() {
    const v = values();
    outputs.peaks.value = String(v.peaks); outputs.amplitude.value = `${v.amplitude} px`; outputs.minWeight.value = `${v.minWeight.toFixed(1)} px`; outputs.maxWeight.value = `${v.maxWeight.toFixed(1)} px`; outputs.pools.value = String(v.pools); outputs.overshoot.value = `${v.overshoot} px`;
    linePath.setAttribute('d', makeRibbon({ x: 35, y: 60, length: 650, ...v }));

    const left = 62, top = 55, width = 596, height = 190, over = v.overshoot;
    boxTop.setAttribute('d', makeRibbon({ x: left - over, y: top, length: width + over * 2, ...v, phase: 0 }));
    boxBottom.setAttribute('d', makeRibbon({ x: left - over, y: top + height, length: width + over * 2, ...v, phase: Math.PI }));
    boxLeft.setAttribute('d', makeRibbon({ orientation: 'vertical', x: left, y: top - over, length: height + over * 2, ...v, phase: 0 }));
    boxRight.setAttribute('d', makeRibbon({ orientation: 'vertical', x: left + width, y: top - over, length: height + over * 2, ...v, phase: Math.PI }));
    readout.textContent = `${v.peaks} peaks · ${v.amplitude}px rise/fall · ${v.minWeight.toFixed(1)}–${v.maxWeight.toFixed(1)}px thickness · ${v.pools} pressure pool${v.pools === 1 ? '' : 's'} · ${v.overshoot}px corner overshoot`;
  }

  Object.values(controls).forEach((control) => control.addEventListener('input', render));
  document.getElementById('lineLabReset').addEventListener('click', () => { Object.entries(defaults).forEach(([key, value]) => { controls[key].value = String(value); }); render(); });
  render();
})();

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
        <p class="section-copy">These controls preview the line language used on outer content boxes only. CTA buttons keep their separate approved styling. Fewer peaks create longer rises and falls instead of a tight zig-zag.</p>
      </div>

      <div class="line-lab">
        <form class="line-lab__controls" id="lineLabControls">
          <div class="line-lab__control">
            <div class="line-lab__control-head"><label for="linePeaks">Peaks per long edge</label><output for="linePeaks" id="linePeaksOut">3</output></div>
            <input id="linePeaks" type="range" min="2" max="8" step="1" value="3">
            <p>Lower = longer rise and run.</p>
          </div>

          <div class="line-lab__control">
            <div class="line-lab__control-head"><label for="lineAmplitude">Rise / fall</label><output for="lineAmplitude" id="lineAmplitudeOut">9 px</output></div>
            <input id="lineAmplitude" type="range" min="4" max="16" step="1" value="9">
            <p>Distance between the high and low of the stroke.</p>
          </div>

          <div class="line-lab__control">
            <div class="line-lab__control-head"><label for="lineMinWeight">Minimum thickness</label><output for="lineMinWeight" id="lineMinWeightOut">2.5 px</output></div>
            <input id="lineMinWeight" type="range" min="1" max="4" step="0.1" value="2.5">
          </div>

          <div class="line-lab__control">
            <div class="line-lab__control-head"><label for="lineMaxWeight">Maximum thickness</label><output for="lineMaxWeight" id="lineMaxWeightOut">4.0 px</output></div>
            <input id="lineMaxWeight" type="range" min="2" max="7" step="0.1" value="4">
          </div>

          <div class="line-lab__control">
            <div class="line-lab__control-head"><label for="linePools">Pressure pools</label><output for="linePools" id="linePoolsOut">1</output></div>
            <input id="linePools" type="range" min="0" max="3" step="1" value="1">
            <p>Localized ink buildup along each edge.</p>
          </div>

          <div class="line-lab__control">
            <div class="line-lab__control-head"><label for="lineOvershoot">Corner overshoot</label><output for="lineOvershoot" id="lineOvershootOut">9 px</output></div>
            <input id="lineOvershoot" type="range" min="4" max="16" step="1" value="9">
            <p>How far each stroke carries past the 90° corner.</p>
          </div>

          <button class="line-lab__reset" type="button" id="lineLabReset">Reset test values</button>
        </form>

        <div class="line-lab__previews">
          <figure class="line-lab__preview">
            <figcaption><strong>Long-edge preview</strong><span>Watch the spacing between the major rises and falls.</span></figcaption>
            <svg class="line-lab__line-svg" viewBox="0 0 720 120" role="img" aria-label="Preview of the adjustable hand-drawn line">
              <path id="linePreviewPath" fill="currentColor"></path>
            </svg>
          </figure>

          <figure class="line-lab__preview line-lab__preview--box">
            <figcaption><strong>Outer-box preview</strong><span>Square intersections stay fixed while the line character changes.</span></figcaption>
            <div class="line-lab__box-stage">
              <svg class="line-lab__box-svg" viewBox="0 0 720 300" aria-hidden="true">
                <path id="boxPreviewTop" fill="currentColor"></path>
                <path id="boxPreviewRight" fill="currentColor"></path>
                <path id="boxPreviewBottom" fill="currentColor"></path>
                <path id="boxPreviewLeft" fill="currentColor"></path>
              </svg>
              <div class="line-lab__sample-copy">
                <p class="eyebrow">Sample outer box</p>
                <h3>All interface text stays live.</h3>
                <p>The box is drawing. The words are still normal browser text.</p>
              </div>
            </div>
          </figure>

          <p class="line-lab__readout" id="lineLabReadout" aria-live="polite"></p>
        </div>
      </div>
    </div>`;

  insertBefore.parentNode.insertBefore(section, insertBefore);

  const controls = {
    peaks: document.getElementById('linePeaks'),
    amplitude: document.getElementById('lineAmplitude'),
    minWeight: document.getElementById('lineMinWeight'),
    maxWeight: document.getElementById('lineMaxWeight'),
    pools: document.getElementById('linePools'),
    overshoot: document.getElementById('lineOvershoot')
  };

  const outputs = {
    peaks: document.getElementById('linePeaksOut'),
    amplitude: document.getElementById('lineAmplitudeOut'),
    minWeight: document.getElementById('lineMinWeightOut'),
    maxWeight: document.getElementById('lineMaxWeightOut'),
    pools: document.getElementById('linePoolsOut'),
    overshoot: document.getElementById('lineOvershootOut')
  };

  const linePath = document.getElementById('linePreviewPath');
  const boxTop = document.getElementById('boxPreviewTop');
  const boxRight = document.getElementById('boxPreviewRight');
  const boxBottom = document.getElementById('boxPreviewBottom');
  const boxLeft = document.getElementById('boxPreviewLeft');
  const readout = document.getElementById('lineLabReadout');
  const reset = document.getElementById('lineLabReset');

  const defaults = {
    peaks: 3,
    amplitude: 9,
    minWeight: 2.5,
    maxWeight: 4,
    pools: 1,
    overshoot: 9
  };

  function gaussian(t, center, spread) {
    return Math.exp(-Math.pow((t - center) / spread, 2));
  }

  function makeRibbon({
    orientation = 'horizontal',
    x = 0,
    y = 0,
    length = 600,
    peaks = 3,
    amplitude = 9,
    minWeight = 2.5,
    maxWeight = 4,
    pools = 1,
    phase = 0
  }) {
    const samples = Math.max(48, peaks * 24);
    const edgeA = [];
    const edgeB = [];
    const poolCenters = [];

    for (let i = 0; i < pools; i += 1) {
      poolCenters.push((i + 1) / (pools + 1));
    }

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const axis = t * length;

      // Broad major wave plus a small slower hand drift. No high-frequency chatter.
      const major = Math.sin((t * Math.PI * 2 * peaks) + phase) * (amplitude * 0.5);
      const drift = Math.sin((t * Math.PI * 2 * 0.72) + phase + 0.8) * (amplitude * 0.12);
      const centerOffset = major + drift;

      const pressureWave = (Math.sin((t * Math.PI * 2 * (peaks * 0.7)) + phase + 0.35) + 1) / 2;
      let thickness = minWeight + ((maxWeight - minWeight) * pressureWave);

      poolCenters.forEach((poolCenter) => {
        thickness += gaussian(t, poolCenter, 0.055) * Math.max(0.4, (maxWeight - minWeight) * 0.55);
      });

      const half = thickness / 2;

      if (orientation === 'horizontal') {
        edgeA.push([x + axis, y + centerOffset - half]);
        edgeB.push([x + axis, y + centerOffset + half]);
      } else {
        edgeA.push([x + centerOffset - half, y + axis]);
        edgeB.push([x + centerOffset + half, y + axis]);
      }
    }

    let d = `M ${edgeA[0][0].toFixed(2)} ${edgeA[0][1].toFixed(2)}`;
    edgeA.slice(1).forEach(([px, py]) => { d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`; });
    edgeB.slice().reverse().forEach(([px, py]) => { d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`; });
    return `${d} Z`;
  }

  function values() {
    const minWeight = Number(controls.minWeight.value);
    const requestedMax = Number(controls.maxWeight.value);
    return {
      peaks: Number(controls.peaks.value),
      amplitude: Number(controls.amplitude.value),
      minWeight,
      maxWeight: Math.max(minWeight, requestedMax),
      pools: Number(controls.pools.value),
      overshoot: Number(controls.overshoot.value)
    };
  }

  function updateOutputs(v) {
    outputs.peaks.value = String(v.peaks);
    outputs.amplitude.value = `${v.amplitude} px`;
    outputs.minWeight.value = `${v.minWeight.toFixed(1)} px`;
    outputs.maxWeight.value = `${v.maxWeight.toFixed(1)} px`;
    outputs.pools.value = String(v.pools);
    outputs.overshoot.value = `${v.overshoot} px`;
  }

  function render() {
    const v = values();
    updateOutputs(v);

    linePath.setAttribute('d', makeRibbon({
      x: 35,
      y: 60,
      length: 650,
      peaks: v.peaks,
      amplitude: v.amplitude,
      minWeight: v.minWeight,
      maxWeight: v.maxWeight,
      pools: v.pools,
      phase: 0.25
    }));

    const left = 62;
    const top = 55;
    const width = 596;
    const height = 190;
    const over = v.overshoot;
    const verticalPeaks = Math.max(1, Math.round(v.peaks * (height / width) * 1.8));

    boxTop.setAttribute('d', makeRibbon({
      x: left - over,
      y: top,
      length: width + (over * 2),
      peaks: v.peaks,
      amplitude: v.amplitude,
      minWeight: v.minWeight,
      maxWeight: v.maxWeight,
      pools: v.pools,
      phase: 0.15
    }));

    boxBottom.setAttribute('d', makeRibbon({
      x: left - over,
      y: top + height,
      length: width + (over * 2),
      peaks: v.peaks,
      amplitude: v.amplitude,
      minWeight: v.minWeight,
      maxWeight: v.maxWeight,
      pools: v.pools,
      phase: 2.1
    }));

    boxLeft.setAttribute('d', makeRibbon({
      orientation: 'vertical',
      x: left,
      y: top - over,
      length: height + (over * 2),
      peaks: verticalPeaks,
      amplitude: v.amplitude,
      minWeight: v.minWeight,
      maxWeight: v.maxWeight,
      pools: Math.min(v.pools, 1),
      phase: 0.8
    }));

    boxRight.setAttribute('d', makeRibbon({
      orientation: 'vertical',
      x: left + width,
      y: top - over,
      length: height + (over * 2),
      peaks: verticalPeaks,
      amplitude: v.amplitude,
      minWeight: v.minWeight,
      maxWeight: v.maxWeight,
      pools: Math.min(v.pools, 1),
      phase: 2.75
    }));

    readout.textContent = `${v.peaks} peaks · ${v.amplitude}px rise/fall · ${v.minWeight.toFixed(1)}–${v.maxWeight.toFixed(1)}px thickness · ${v.pools} pressure pool${v.pools === 1 ? '' : 's'} · ${v.overshoot}px corner overshoot`;
  }

  Object.values(controls).forEach((control) => control.addEventListener('input', render));

  reset.addEventListener('click', () => {
    Object.entries(defaults).forEach(([key, value]) => {
      controls[key].value = String(value);
    });
    render();
  });

  render();
})();
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#09080b',
  panel: '#17151b',
  ink: '#f4f2f7',
  muted: '#aaa3b0',
  quiet: '#716b78',
  line: '#312c39',
  lime: '#d7ff72',
  purple: '#b89af4',
};

const font = 'Arial, Helvetica, sans-serif';

const fade = (frame: number, duration: number) =>
  Math.min(
    interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    interpolate(frame, [duration - 12, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: 0.14,
      backgroundImage:
        'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,.025) 4px)',
      mixBlendMode: 'screen',
    }}
  />
);

const BrandMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div
    style={{
      width: size,
      height: size,
      border: `1px solid ${C.line}`,
      borderRadius: size * 0.28,
      background: '#151219',
      display: 'grid',
      placeItems: 'center',
      boxShadow: 'inset 0 1px rgba(255,255,255,.06), 0 24px 70px rgba(0,0,0,.5)',
    }}
  >
    <Img src={staticFile('mark.svg')} style={{width: size * 0.68, height: size * 0.68}} />
  </div>
);

const Chrome: React.FC<{src: string; scaleFrom?: number; scaleTo?: number}> = ({
  src,
  scaleFrom = 0.985,
  scaleTo = 1.025,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [scaleFrom, scaleTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 196,
        top: 42,
        width: 1528,
        height: 995,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.13)',
        borderRadius: 28,
        background: C.panel,
        boxShadow: '0 50px 140px rgba(0,0,0,.62)',
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 18px',
          borderBottom: `1px solid ${C.line}`,
          background: '#111014',
        }}
      >
        {[C.lime, C.purple, '#5e5964'].map((color) => (
          <span key={color} style={{width: 9, height: 9, borderRadius: 99, background: color, opacity: 0.8}} />
        ))}
        <div
          style={{
            marginLeft: 16,
            color: C.quiet,
            fontFamily: font,
            fontSize: 14,
            letterSpacing: '.04em',
          }}
        >
          xcanopy.vercel.app
        </div>
      </div>
      <Img src={staticFile(src)} style={{width: '100%', height: 951, objectFit: 'cover'}} />
    </div>
  );
};

const Caption: React.FC<{eyebrow: string; lines: string[]; accent?: 'lime' | 'purple'; align?: 'left' | 'right'}> = ({
  eyebrow,
  lines,
  accent = 'lime',
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const p = spring({frame, fps: 30, config: {damping: 22, stiffness: 150, mass: 0.9}});
  const side = align === 'left' ? {left: 96} : {right: 96};
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 76,
        ...side,
        width: 800,
        padding: '26px 30px 28px',
        border: `1px solid rgba(255,255,255,.11)`,
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(9,8,11,.94), rgba(20,17,24,.9))',
        boxShadow: '0 28px 80px rgba(0,0,0,.48)',
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
      }}
    >
      <div
        style={{
          color: accent === 'lime' ? C.lime : C.purple,
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '.14em',
        }}
      >
        {eyebrow}
      </div>
      <div style={{marginTop: 13, color: C.ink, fontFamily: font, fontSize: 46, fontWeight: 650, lineHeight: 1.02, letterSpacing: '-.045em'}}>
        {lines.map((line) => <div key={line}>{line}</div>)}
      </div>
    </div>
  );
};

const Cursor: React.FC<{from: [number, number]; to: [number, number]; delay?: number}> = ({from, to, delay = 20}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [delay, delay + 65], [from[0], to[0]], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease)});
  const y = interpolate(frame, [delay, delay + 65], [from[1], to[1]], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease)});
  const click = spring({frame: frame - delay - 66, fps: 30, config: {damping: 12, stiffness: 260}});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 28, height: 36, transform: `scale(${1 - click * .16})`, filter: 'drop-shadow(0 5px 8px rgba(0,0,0,.6))'}}>
      <svg viewBox="0 0 28 36" width="28" height="36">
        <path d="M3 2v27l7-7 5 11 5-2-5-11h10L3 2Z" fill="#f4f2f7" stroke="#09080b" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {click > .05 && <span style={{position: 'absolute', left: -10, top: -10, width: 46, height: 46, border: `2px solid ${C.lime}`, borderRadius: 99, opacity: 1 - click}} />}
    </div>
  );
};

const Poster: React.FC = () => (
  <AbsoluteFill style={{background: C.bg, color: C.ink, fontFamily: font, padding: 104}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}><BrandMark size={82} /><strong style={{fontSize: 28, letterSpacing: '.12em'}}>CANOPY</strong></div>
    <div style={{marginTop: 170, maxWidth: 1400, fontSize: 105, lineHeight: .92, letterSpacing: '-.065em'}}>
      Collect stock positions<br /><span style={{color: C.purple}}>like booster cards.</span>
    </div>
    <div style={{position: 'absolute', left: 108, bottom: 96, color: C.lime, fontFamily: 'monospace', fontSize: 24, letterSpacing: '.08em'}}>XCANOPY.VERCEL.APP ↗</div>
    <Grain />
  </AbsoluteFill>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - 4, fps: 30, config: {damping: 21, stiffness: 120, mass: 1}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 75% 35%, rgba(184,154,244,.16), transparent 35%), #09080b', opacity: fade(frame, durationInFrames), color: C.ink, fontFamily: font}}>
      <div style={{position: 'absolute', left: 110, top: 90, display: 'flex', alignItems: 'center', gap: 20}}><BrandMark size={70} /><b style={{fontSize: 23, letterSpacing: '.13em'}}>CANOPY</b></div>
      <div style={{position: 'absolute', left: 108, top: 305, fontSize: 96, lineHeight: .96, letterSpacing: '-.06em', opacity: p, transform: `translateY(${(1-p)*45}px)`}}>
        What if a stock position<br /><span style={{color: C.purple}}>opened like a booster pack?</span>
      </div>
      <div style={{position: 'absolute', left: 112, bottom: 110, color: C.lime, fontFamily: 'monospace', fontSize: 20, letterSpacing: '.12em'}}>REAL TOKENS · NON-ZERO SHARES · AUDITABLE DNA</div>
      <Grain />
    </AbsoluteFill>
  );
};

const UiScene: React.FC<{
  src: string;
  eyebrow: string;
  lines: string[];
  accent?: 'lime' | 'purple';
  cursorFrom?: [number, number];
  cursorTo?: [number, number];
}> = ({src, eyebrow, lines, accent, cursorFrom, cursorTo}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 0%, #211b29, #09080b 58%)', opacity: fade(frame, durationInFrames)}}>
      <Chrome src={src} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,8,11,.72), transparent 48%)'}} />
      <Caption eyebrow={eyebrow} lines={lines} accent={accent} />
      {cursorFrom && cursorTo && <Cursor from={cursorFrom} to={cursorTo} />}
      <Grain />
    </AbsoluteFill>
  );
};

const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const items = [
    ['01', 'PRESTOCKS', 'Official pre-IPO discovery'],
    ['02', 'PYTH', 'Equity + token market data'],
    ['03', 'SOLANA', 'Inspectable ownership records'],
  ];
  return (
    <AbsoluteFill style={{background: C.bg, color: C.ink, fontFamily: font, opacity: fade(frame, durationInFrames)}}>
      <Img src={staticFile('assets/markets.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .16, filter: 'blur(2px)', transform: 'scale(1.08)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 78% 22%, rgba(215,255,114,.12), transparent 28%), rgba(9,8,11,.82)'}} />
      <div style={{position: 'absolute', left: 112, top: 100, display: 'flex', alignItems: 'center', gap: 18}}><BrandMark size={64} /><b style={{fontSize: 22, letterSpacing: '.12em'}}>CANOPY · PROOF LAYER</b></div>
      <div style={{position: 'absolute', left: 110, top: 250, width: 1700}}>
        {items.map(([number, name, copy], i) => {
          const p = spring({frame: frame - 12 - i * 14, fps: 30, config: {damping: 23, stiffness: 150}});
          return (
            <div key={name} style={{display: 'grid', gridTemplateColumns: '100px 430px 1fr', alignItems: 'center', minHeight: 165, borderTop: `1px solid ${C.line}`, opacity: p, transform: `translateX(${(1-p)*34}px)`}}>
              <span style={{color: C.lime, fontFamily: 'monospace', fontSize: 20}}>{number}</span>
              <strong style={{fontSize: 45, letterSpacing: '-.04em'}}>{name}</strong>
              <span style={{color: C.muted, fontSize: 30}}>{copy}</span>
            </div>
          );
        })}
        <div style={{borderTop: `1px solid ${C.line}`}} />
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = spring({frame: frame - 10, fps: 30, config: {damping: 20, stiffness: 110}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(184,154,244,.2), transparent 30%), #09080b', color: C.ink, fontFamily: font, opacity: fade(frame, durationInFrames)}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: p, transform: `scale(${.94 + p*.06})`}}>
        <BrandMark size={126} />
        <div style={{marginTop: 36, fontSize: 29, fontWeight: 750, letterSpacing: '.16em'}}>CANOPY</div>
        <div style={{marginTop: 66, fontSize: 98, lineHeight: .94, letterSpacing: '-.065em', textAlign: 'center'}}>Collect the market.</div>
        <div style={{marginTop: 38, padding: '18px 28px', borderRadius: 18, background: C.lime, color: '#11130d', fontFamily: 'monospace', fontSize: 24, fontWeight: 800}}>XCANOPY.VERCEL.APP ↗</div>
      </div>
      <div style={{position: 'absolute', bottom: 54, left: 0, right: 0, textAlign: 'center', color: C.quiet, fontFamily: 'monospace', fontSize: 15, letterSpacing: '.1em'}}>PRESTOCKS · PYTH · SOLANA</div>
      <Grain />
    </AbsoluteFill>
  );
};

export const CanopyDemo: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame === 0) return <Poster />;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Sequence from={1} durationInFrames={104}><Hook /></Sequence>
      <Sequence from={92} durationInFrames={164}><UiScene src="assets/landing.png" eyebrow="CANOPY" lines={['Fund the basket.', 'Reveal your Share.']} accent="purple" /></Sequence>
      <Sequence from={240} durationInFrames={255}><UiScene src="assets/app.png" eyebrow="LIVE CATALOG" lines={['Public stocks + PreStocks.', 'One place to start.']} cursorFrom={[1380, 360]} cursorTo={[1445, 595]} /></Sequence>
      <Sequence from={479} durationInFrames={255}><UiScene src="assets/instant.png" eyebrow="INSTANT SHARE" lines={['Pick a token.', 'Set a position. Mint.']} cursorFrom={[1230, 690]} cursorTo={[1390, 835]} /></Sequence>
      <Sequence from={718} durationInFrames={285}><UiScene src="assets/vaults.png" eyebrow="GROUP VAULTS" lines={['Fund 2–5 stock tokens.', 'Reveal together.']} accent="purple" cursorFrom={[1410, 310]} cursorTo={[1410, 730]} /></Sequence>
      <Sequence from={987} durationInFrames={255}><UiScene src="assets/matter.png" eyebrow="DIGITAL MATTER" lines={['Economics assemble', 'the artifact in real time.']} accent="purple" /></Sequence>
      <Sequence from={1226} durationInFrames={229}><Proof /></Sequence>
      <Sequence from={1439} durationInFrames={181}><Outro /></Sequence>
    </AbsoluteFill>
  );
};


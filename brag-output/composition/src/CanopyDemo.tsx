import React from 'react';
import {Audio} from '@remotion/media';
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
  bg: '#09080b', panel: '#17151b', ink: '#f4f2f7', muted: '#aaa3b0', quiet: '#716b78',
  line: '#312c39', lime: '#d7ff72', purple: '#b89af4', cyan: '#76d8cb',
};
const font = 'Arial, Helvetica, sans-serif';
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const captions = [
  [50, 2422, 'Buying tokenized stock is easy.'],
  [2422, 5206, 'But ownership still looks like a balance.'],
  [5206, 10012, 'Canopy turns a stock position into a collectible, transferable claim.'],
  [10012, 13994, 'Start with public xStocks or private-market PreStocks.'],
  [13994, 18930, 'Fund one asset instantly, or enter a group vault with USDC.'],
  [18930, 22706, 'This demo account owns seven pieces of Digital Matter.'],
  [22706, 30798, 'Every card points back to a vault record: claim percentage, current NAV, composition, and redemption state.'],
  [30798, 32422, 'The art can evolve.'],
  [32422, 33840, 'The claim cannot.'],
  [33840, 35283, 'Here is the moat.'],
  [35283, 39458, 'The collectible is not a profile picture layered on finance.'],
  [39458, 46585, 'It is the financial position, with identity assembled from allocation, ownership, market history, and time.'],
  [46585, 48749, 'And the vault is not frozen.'],
  [48749, 55760, 'Any owner can propose a new NAV composition, bond the change, and open PASS and FAIL positions.'],
  [55760, 57912, 'Traders price the decision.'],
  [57912, 62783, 'The time-weighted market chooses; silence preserves the current vault.'],
  [62783, 64613, 'PreStocks discovery.'],
  [64613, 66430, 'Pyth prices.'],
  [66430, 68143, 'Solana ownership.'],
  [68143, 70154, 'Bonded decision markets.'],
  [70154, 74922, 'Canopy makes stock ownership collectible, governable, and legible.'],
  [74922, 76456, 'Collect the market.'],
] as const;

const sceneOpacity = (frame: number, duration: number) => Math.min(
  interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  interpolate(frame, [duration - 12, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
);

const Grain: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.12, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,.025) 4px)', mixBlendMode: 'screen'}} />
);

const BrandMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div style={{width: size, height: size, display: 'grid', placeItems: 'center', border: `1px solid ${C.line}`, borderRadius: size * 0.25, background: '#151219', boxShadow: 'inset 0 1px rgba(255,255,255,.06), 0 22px 70px rgba(0,0,0,.5)'}}>
    <Img src={staticFile('mark.svg')} style={{width: size * 0.68, height: size * 0.68}} />
  </div>
);

const BrowserShot: React.FC<{src: string; label: string; zoom?: number; x?: number; y?: number; driftX?: number; driftY?: number}> = ({src, label, zoom = 1, x = 0, y = 0, driftX = 0, driftY = -12}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 116, top: 58, width: 1688, height: 930, overflow: 'hidden', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, background: C.panel, boxShadow: '0 58px 150px rgba(0,0,0,.7)'}}>
      <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderBottom: `1px solid ${C.line}`, background: '#111014'}}>
        {[C.lime, C.purple, '#5e5964'].map((color) => <span key={color} style={{width: 9, height: 9, borderRadius: 99, background: color, opacity: .82}} />)}
        <span style={{marginLeft: 14, color: C.quiet, fontFamily: mono, fontSize: 14}}>xcanopy.vercel.app/{label}</span>
        <span style={{marginLeft: 'auto', padding: '6px 9px', borderRadius: 8, background: 'rgba(215,255,114,.08)', color: C.lime, fontFamily: mono, fontSize: 11, letterSpacing: '.08em'}}>LIVE PRODUCT</span>
      </div>
      <div style={{position: 'relative', width: '100%', height: 884, overflow: 'hidden'}}>
        <Img src={staticFile(src)} style={{position: 'absolute', left: x + driftX * progress, top: y + driftY * progress, width: 1688 * zoom, height: 1055 * zoom, objectFit: 'cover'}} />
      </div>
    </div>
  );
};

const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.lime}) => (
  <div style={{color, fontFamily: mono, fontSize: 16, fontWeight: 800, letterSpacing: '.14em'}}>{children}</div>
);

const CaptionCard: React.FC<{kicker: string; line: string; subline?: string; side?: 'left' | 'right'}> = ({kicker, line, subline, side = 'left'}) => {
  const frame = useCurrentFrame();
  const p = spring({frame: frame - 8, fps: 30, config: {damping: 24, stiffness: 140}});
  return (
    <div style={{position: 'absolute', ...(side === 'left' ? {left: 72} : {right: 72}), top: 100, width: 570, padding: '25px 28px 28px', border: '1px solid rgba(255,255,255,.13)', borderRadius: 22, background: 'rgba(9,8,11,.92)', boxShadow: '0 28px 90px rgba(0,0,0,.55)', opacity: p, translate: `0 ${(1 - p) * 24}px`}}>
      <Kicker>{kicker}</Kicker>
      <div style={{marginTop: 13, color: C.ink, fontFamily: font, fontSize: 48, lineHeight: .98, letterSpacing: '-.05em'}}>{line}</div>
      {subline && <div style={{marginTop: 15, maxWidth: 470, color: C.muted, fontFamily: font, fontSize: 20, lineHeight: 1.35}}>{subline}</div>}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({frame: frame - 5, fps: 30, config: {damping: 20, stiffness: 105, mass: 1.1}});
  const balance = interpolate(frame, [60, 145], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 77% 35%, rgba(184,154,244,.19), transparent 32%), #09080b', color: C.ink, fontFamily: font}}>
      <div style={{position: 'absolute', left: 108, top: 80, display: 'flex', alignItems: 'center', gap: 18}}><BrandMark size={68}/><b style={{fontSize: 21, letterSpacing: '.14em'}}>CANOPY</b></div>
      <div style={{position: 'absolute', left: 108, top: 300, opacity: frame === 0 ? 1 : p, translate: `0 ${(1-p)*44}px`}}>
        <Kicker color={C.purple}>TOKENIZED STOCK OWNERSHIP</Kicker>
        <div style={{marginTop: 24, fontSize: 100, lineHeight: .9, letterSpacing: '-.07em'}}>A balance is data.<br/><span style={{color: C.purple}}>A claim is identity.</span></div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 230, width: 410, height: 570, border: '1px solid rgba(255,255,255,.16)', borderRadius: 32, background: 'radial-gradient(circle at 54% 44%, rgba(215,255,114,.24), transparent 20%), radial-gradient(circle at 38% 62%, rgba(184,154,244,.38), transparent 42%), #111015', rotate: `${4 - p * 4}deg`, scale: .9 + p * .1, boxShadow: '0 55px 130px rgba(0,0,0,.62)'}}>
        <div style={{position: 'absolute', inset: 22, border: '1px solid rgba(255,255,255,.1)', borderRadius: 20}} />
        <div style={{position: 'absolute', left: 30, top: 28, fontFamily: mono, fontSize: 13, letterSpacing: '.12em'}}>CANOPY SHARE</div>
        <div style={{position: 'absolute', right: 30, top: 28, color: C.lime, fontFamily: mono, fontSize: 13}}>MYTHIC</div>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}><BrandMark size={128}/></div>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}><strong style={{fontSize: 21}}>THE SIGNAL KEEPER</strong><span style={{color: C.quiet, fontFamily: mono}}>12.4%</span></div>
      </div>
      <div style={{position: 'absolute', left: 112, bottom: 92, color: C.muted, fontSize: 25, opacity: balance}}>Buying is solved. Ownership still feels invisible.</div>
      <Grain />
    </AbsoluteFill>
  );
};

const ClaimScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg, opacity: sceneOpacity(frame, 164)}}>
      <BrowserShot src="assets/landing.png" label="" zoom={1.02}/>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(9,8,11,.82), transparent 50%)'}} />
      <CaptionCard kicker="THE OBJECT" line="A transferable claim, not a skin." subline="The ownership record and the collectible are the same position." />
      <Grain />
    </AbsoluteFill>
  );
};

const MarketsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = interpolate(frame, [126, 148], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg, opacity: sceneOpacity(frame, 276)}}>
      <div style={{opacity: 1 - swap}}><BrowserShot src="assets/markets.png" label="markets" zoom={1.02} driftX={-12}/></div>
      <div style={{opacity: swap}}><BrowserShot src="assets/instant.png" label="instant" zoom={1.02} driftX={10}/></div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,8,11,.52), transparent 40%)'}} />
      <CaptionCard kicker={swap < .5 ? 'ONE CATALOG' : 'TWO ENTRY POINTS'} line={swap < .5 ? 'Public stocks + PreStocks.' : 'Mint solo or fund together.'} side="right" />
      <Grain />
    </AbsoluteFill>
  );
};

const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg, opacity: sceneOpacity(frame, 463)}}>
      <BrowserShot src="assets/demo.png" label="demo" zoom={1.015} driftY={-24}/>
      <div style={{position: 'absolute', left: 72, bottom: 130, display: 'flex', gap: 10}}>
        {['$12,842 CLAIM NAV', '7 COLLECTIBLES', '18.4% VOTING POWER'].map((item, index) => {
          const p = spring({frame: frame - 35 - index * 12, fps: 30, config: {damping: 22, stiffness: 155}});
          return <span key={item} style={{padding: '13px 16px', border: `1px solid ${C.line}`, borderRadius: 12, background: 'rgba(9,8,11,.94)', color: index === 0 ? C.lime : C.ink, fontFamily: mono, fontSize: 13, fontWeight: 750, opacity: p, translate: `0 ${(1-p)*16}px`}}>{item}</span>;
        })}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

const MoatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const statement = interpolate(frame, [225, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 78% 28%, rgba(184,154,244,.16), transparent 35%), #09080b', opacity: sceneOpacity(frame, 395)}}>
      <BrowserShot src="assets/demo.png" label="demo#ownership" zoom={1.58} x={-1015} y={-360} driftX={-20} driftY={-8}/>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(9,8,11,.97) 0%, rgba(9,8,11,.84) 34%, transparent 62%)'}} />
      <div style={{position: 'absolute', left: 105, top: 210, width: 740}}>
        <Kicker color={C.purple}>CANOPY’S MOAT</Kicker>
        <div style={{marginTop: 23, color: C.ink, fontFamily: font, fontSize: 74, lineHeight: .96, letterSpacing: '-.06em'}}>The collectible<br/>is the position.</div>
        <div style={{marginTop: 30, display: 'grid', gap: 13}}>
          {['Transferable NFT claim', 'Live NAV + composition', 'History assembles the identity'].map((text, index) => <div key={text} style={{display: 'flex', alignItems: 'center', gap: 13, color: C.muted, fontFamily: font, fontSize: 22}}><span style={{width: 8, height: 8, borderRadius: 2, background: index === 0 ? C.lime : index === 1 ? C.purple : C.cyan}} />{text}</div>)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 102, bottom: 106, opacity: statement, color: C.lime, fontFamily: mono, fontSize: 22, fontWeight: 800, letterSpacing: '.05em'}}>THE ART CAN EVOLVE. THE CLAIM CANNOT.</div>
      <Grain />
    </AbsoluteFill>
  );
};

const GovernanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cursorX = interpolate(frame, [100, 250], [1585, 1235], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease)});
  const cursorY = interpolate(frame, [100, 250], [775, 540], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease)});
  const click = spring({frame: frame - 255, fps: 30, config: {damping: 13, stiffness: 260}});
  return (
    <AbsoluteFill style={{background: C.bg, opacity: sceneOpacity(frame, 500)}}>
      <BrowserShot src="assets/demo-governance.png" label="demo#decision-market" zoom={1.015} driftY={-8}/>
      <div style={{position: 'absolute', left: 72, top: 96, padding: '18px 21px', border: '1px solid rgba(215,255,114,.24)', borderRadius: 16, background: 'rgba(9,8,11,.94)'}}><Kicker>PROPOSE → PRICE → DECIDE</Kicker></div>
      <div style={{position: 'absolute', left: cursorX, top: cursorY, width: 30, height: 38, scale: 1 - click * .15, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.6))'}}>
        <svg viewBox="0 0 28 36" width="28" height="36"><path d="M3 2v27l7-7 5 11 5-2-5-11h10L3 2Z" fill="#f4f2f7" stroke="#09080b" strokeWidth="2" strokeLinejoin="round" /></svg>
        {click > .05 && <span style={{position: 'absolute', left: -11, top: -11, width: 50, height: 50, border: `2px solid ${C.lime}`, borderRadius: 99, opacity: 1 - click}} />}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [['01', 'PRESTOCKS', 'Private-market discovery'], ['02', 'PYTH', 'Live reference prices'], ['03', 'SOLANA', 'Transferable ownership'], ['04', 'CANOPY MARKETS', 'Bonded vault decisions']];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 78% 24%, rgba(215,255,114,.1), transparent 28%), #09080b', color: C.ink, fontFamily: font, opacity: sceneOpacity(frame, 255)}}>
      <div style={{position: 'absolute', left: 105, top: 82, display: 'flex', alignItems: 'center', gap: 18}}><BrandMark size={62}/><b style={{fontSize: 20, letterSpacing: '.13em'}}>CANOPY · FULL STACK</b></div>
      <div style={{position: 'absolute', left: 108, right: 108, top: 210}}>
        {items.map(([number, name, copy], index) => {
          const p = spring({frame: frame - 12 - index * 14, fps: 30, config: {damping: 23, stiffness: 150}});
          return <div key={name} style={{display: 'grid', gridTemplateColumns: '100px 510px 1fr', alignItems: 'center', minHeight: 150, borderTop: `1px solid ${C.line}`, opacity: p, translate: `${(1-p)*34}px 0`}}><span style={{color: C.lime, fontFamily: mono, fontSize: 18}}>{number}</span><strong style={{fontSize: 40, letterSpacing: '-.04em'}}>{name}</strong><span style={{color: C.muted, fontSize: 27}}>{copy}</span></div>;
        })}
        <div style={{borderTop: `1px solid ${C.line}`}} />
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({frame: frame - 8, fps: 30, config: {damping: 20, stiffness: 105}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(184,154,244,.22), transparent 30%), #09080b', color: C.ink, fontFamily: font}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: p, scale: .94 + p * .06}}>
        <BrandMark size={126}/><div style={{marginTop: 34, fontSize: 28, fontWeight: 780, letterSpacing: '.16em'}}>CANOPY</div>
        <div style={{marginTop: 60, fontSize: 96, lineHeight: .94, letterSpacing: '-.065em', textAlign: 'center'}}>Collect the market.</div>
        <div style={{marginTop: 28, color: C.muted, fontSize: 26}}>Own the claim. Price the decision.</div>
        <div style={{width: 350, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 36, padding: '17px 26px', borderRadius: 16, background: C.lime, color: '#11130d', fontFamily: mono, fontSize: 22, fontWeight: 800}}>XCANOPY.VERCEL.APP ↗</div>
      </div>
      <div style={{position: 'absolute', bottom: 48, left: 0, right: 0, textAlign: 'center', color: C.quiet, fontFamily: mono, fontSize: 14, letterSpacing: '.1em'}}>PRESTOCKS · PYTH · SOLANA · CANOPY MARKETS</div><Grain />
    </AbsoluteFill>
  );
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const ms = frame / 30 * 1000;
  const active = captions.find(([start, end]) => ms >= start && ms < end);
  if (!active) return null;
  return <div style={{position: 'absolute', zIndex: 50, left: '50%', bottom: 25, width: 1320, translate: '-50% 0', display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}><span style={{padding: '11px 17px 12px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, background: 'rgba(9,8,11,.9)', boxShadow: '0 12px 42px rgba(0,0,0,.42)', color: C.ink, fontFamily: font, fontSize: 24, lineHeight: 1.25, textAlign: 'center'}}>{active[2]}</span></div>;
};

const Soundtrack: React.FC = () => {
  return <><Audio src={staticFile('audio/music.mp3')} trimBefore={7 * 30} volume={(audioFrame) => interpolate(audioFrame, [0, 30, 2210, 2390], [0, .16, .16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}/><Audio src={staticFile('audio/voiceover.mp3')} volume={1}/>{[150, 300, 565, 1010, 1390, 1880, 2115].map((start, index) => <Sequence key={start} from={start} durationInFrames={24} layout="none"><Audio src={staticFile(index === 4 || index === 6 ? 'audio/reveal.ogg' : 'audio/click.ogg')} volume={index === 6 ? .5 : .28}/></Sequence>)}</>;
};

export const CanopyDemo: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <Sequence from={0} durationInFrames={160}><Hook /></Sequence>
    <Sequence from={148} durationInFrames={164}><ClaimScene /></Sequence>
    <Sequence from={300} durationInFrames={276}><MarketsScene /></Sequence>
    <Sequence from={564} durationInFrames={463}><DemoScene /></Sequence>
    <Sequence from={1015} durationInFrames={395}><MoatScene /></Sequence>
    <Sequence from={1398} durationInFrames={500}><GovernanceScene /></Sequence>
    <Sequence from={1886} durationInFrames={255}><ProofScene /></Sequence>
    <Sequence from={2129} durationInFrames={271}><Outro /></Sequence>
    <Soundtrack/><Subtitles/>
  </AbsoluteFill>
);

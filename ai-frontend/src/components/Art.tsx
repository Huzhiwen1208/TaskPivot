import type { Article } from '../types';

export function Flower({ className = '', size = 32 }: { className?: string; size?: number }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"><path d="M20 3v34M3 20h34M8 8l24 24M8 32 32 8" /></g><circle cx="20" cy="20" r="6" fill="currentColor" /></svg>;
}

export function HeroArt() {
  return <div className="hero-art" aria-label="阳光、山丘与植物组成的数字花园插画" role="img">
    <svg className="hero-scene" viewBox="0 0 600 440" fill="none">
      <defs>
        <clipPath id="scene-clip"><rect x="35" y="30" width="530" height="354" rx="12" /></clipPath>
        <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0v30" stroke="#8199C1" strokeOpacity=".12" /></pattern>
        <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#fff" fillOpacity=".24" /></pattern>
      </defs>
      <rect x="35" y="30" width="530" height="354" rx="12" fill="#DBE7F7" />
      <g clipPath="url(#scene-clip)">
        <rect x="35" y="30" width="530" height="354" fill="url(#hero-grid)" />
        <path d="M35 303C137 258 171 199 271 213c105 14 136 102 294 32v139H35V303Z" fill="#B8CCE8" />
        <path d="M35 329c112-3 116-62 222-47 110 15 166 68 308 4v98H35v-55Z" fill="#819FCB" />
        <g transform="rotate(-6 300 220)">
          <rect x="117" y="86" width="360" height="252" rx="3" fill="#405B81" fillOpacity=".13" transform="translate(7 10)" />
          <rect x="117" y="86" width="360" height="252" rx="3" fill="#FFFCF2" />
          <path d="M136 105h322v187H136z" fill="#E3EBF6" />
          <circle cx="372" cy="161" r="40" fill="#E78656" /><circle cx="372" cy="161" r="40" fill="url(#dots)" />
          <path d="m136 247 96-92 97 107 51-51 78 43v38H136v-45Z" fill="#A4BDDE" />
          <path d="m136 272 136-73 106 82 80-46v57H136v-20Z" fill="#668DBA" />
          <path d="M136 289c103-17 205-18 322-2v5H136v-3Z" fill="#355B8A" />
          <path d="M195 276v-98m0-2-23 43h46l-23-43Zm0 20-32 50h64l-32-50Zm0 26-38 49h76l-38-49Z" fill="#355C8B" />
          <path d="M420 286v-75m0-5-18 33h36l-18-33Zm0 18-24 37h48l-24-37Zm0 18-29 38h58l-29-38Z" fill="#3E658F" />
          <text x="298" y="318" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" fill="#435D7F" letterSpacing="2.1">GROW AT YOUR OWN PACE.</text>
        </g>
        <path d="M500 385c-4-58 10-115 30-164" stroke="#355B8A" strokeWidth="3" />
        <path d="M516 292c-31-2-43-21-42-39 26 1 41 17 42 39Zm-8 34c-35 0-51-20-52-42 30 0 49 16 52 42Zm16-58c27-1 43-19 45-38-25 0-41 14-45 38Zm-12 45c35 2 53-17 58-39-29-4-48 11-58 39Z" fill="#476992" />
        <text x="60" y="62" fontFamily="monospace" fontSize="9" letterSpacing="1.7" fill="#5E789B">FIELD NOTES — VOL. 01</text>
        <path d="M550 345h-10m5-5v10" stroke="#EDEDD9" strokeWidth="2" />
      </g>
      <g transform="rotate(10 518 64)"><rect x="480" y="19" width="72" height="83" rx="3" fill="#E98050" /><path d="M515 34v42m-21-21h42m-36-15 30 30m-30 0 30-30" stroke="#FAEFCE" strokeWidth="4" /><circle cx="515" cy="55" r="7" fill="#E98050" stroke="#FAEFCE" strokeWidth="3" /><text x="515" y="90" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="#FAEFCE" letterSpacing="1.4">STAY CURIOUS</text></g>
      <path d="M20 105h17m-8-8v17M570 170h13m-6-6v13" stroke="#E98050" strokeWidth="2" />
      <path d="M69 397c34 14 68 13 95-1" stroke="#8396B1" strokeWidth="1.5" strokeDasharray="4 4" />
    </svg>
    <div className="art-caption"><span className="caption-dot" /> 一点一滴，长成自己的样子 <span>↗</span></div>
    <span className="art-side-label">A LITTLE SPACE TO GROW</span>
  </div>;
}

export function ArticleArt({ type, large = false }: { type: Article['cover']; large?: boolean }) {
  const id = `art-${type}-${large ? 'large' : 'small'}`;
  return <svg className={`article-art art-${type}`} viewBox="0 0 440 240" role="img" aria-label={{ garden: '笔记本与生长的植物', code: '代码编辑器与闭包示意', mountain: '日落中的层叠山野', notes: '展开的学习笔记', desk: '台灯下的书桌', light: '午后窗边的光影' }[type]}>
    <defs><pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="currentColor" strokeOpacity=".07" /></pattern></defs>
    <rect width="440" height="240" fill={{ garden: '#DEE8F8', code: '#E1E8F5', mountain: '#EDE1CC', notes: '#E9E3D7', desk: '#DDE8F5', light: '#E5DECf' }[type] || '#E1E8F5'} /><rect width="440" height="240" fill={`url(#${id})`} />
    {type === 'garden' && <>
      <ellipse cx="226" cy="206" rx="147" ry="12" fill="#485F88" opacity=".09" />
      <g transform="rotate(-8 208 135)"><rect x="119" y="64" width="166" height="143" rx="5" fill="#A4B8D8" /><rect x="110" y="55" width="166" height="143" rx="5" fill="#FBF9ED" /><path d="M137 84h76m-76 15h105m-105 15h87" stroke="#A4B5CE" strokeWidth="3" strokeLinecap="round" /><path d="M139 165c20-30 34-1 48-20s27-17 36-34" stroke="#E78553" strokeWidth="3" fill="none" /><circle cx="226" cy="144" r="19" fill="#E9C888" /><path d="M157 56v139" stroke="#DCE4F1" /><rect x="113" y="55" width="8" height="143" fill="#617FA7" /></g>
      <path d="M314 164V70m0 67c-23-1-34-17-33-33 23 1 33 13 33 33Zm0-25c24-1 34-17 33-32-23 1-33 13-33 32Zm0-22c-19-2-27-16-25-28 19 3 25 12 25 28Z" stroke="#5378A3" fill="#6F8EB7" strokeWidth="2" /><path d="m289 157 6 44h38l6-44Z" fill="#D69570" /><path d="M287 157h54" stroke="#B97554" strokeWidth="5" strokeLinecap="round" />
      <text x="34" y="37" fill="#6F87AD" fontFamily="monospace" fontSize="9" letterSpacing="1.5">MY DIGITAL GARDEN</text><path d="M386 54v20m-10-10h20m-17-7 14 14m-14 0 14-14" stroke="#E28B56" strokeWidth="2" />
    </>}
    {type === 'code' && <>
      <rect x="76" y="38" width="288" height="171" rx="9" fill="#314968" opacity=".1" transform="translate(5 6)" /><rect x="76" y="38" width="288" height="171" rx="9" fill="#2D405F" /><path d="M76 67h288" stroke="#496186" /><circle cx="92" cy="53" r="3" fill="#DC8A6F" /><circle cx="103" cy="53" r="3" fill="#D6BE81" /><circle cx="114" cy="53" r="3" fill="#89A685" /><text x="220" y="56" textAnchor="middle" fill="#A0B4CE" fontFamily="monospace" fontSize="8">a-little-closure.js</text><g fontFamily="monospace" fontSize="12"><text x="100" y="94" fill="#DDA47D">function <tspan fill="#E3DFC6">createCounter() {'{'}</tspan></text><text x="113" y="116" fill="#C8D5AC">let count = 0;</text><text x="113" y="138" fill="#DDA47D">return <tspan fill="#E3DFC6">() =&gt; {'{'}</tspan></text><text x="127" y="160" fill="#D6DDCA">return ++count;</text><text x="113" y="182" fill="#E3DFC6">{'};'}</text><text x="100" y="198" fill="#E3DFC6">{'}'}</text></g><g transform="rotate(9 354 171)"><rect x="311" y="144" width="77" height="61" rx="5" fill="#E8AB7F" /><text x="349" y="181" textAnchor="middle" fill="#674B37" fontFamily="Georgia,serif" fontSize="27">{'{ }'}</text></g>
    </>}
    {type === 'mountain' && <>
      <circle cx="300" cy="82" r="40" fill="#DC9467" /><path d="M0 179 94 92l80 73 100-64 166 85v54H0Z" fill="#ADBFD9" /><path d="m0 199 144-80 111 78 76-51 109 62v32H0Z" fill="#7D9BC4" /><path d="m0 221 114-50 140 61 108-53 78 42v19H0Z" fill="#476D9A" /><path d="m204 240 22-22-15-11 19-14" stroke="#E6DDC0" strokeWidth="6" fill="none" /><path d="M55 224v-74m0-10-20 36h40l-20-36Zm0 26-27 41h54l-27-41Z" fill="#375B88" /><path d="m361 209 16-28 16 28Z" fill="#DFB589" /><path d="M377 181v28m-16 0h32" stroke="#526E95" strokeWidth="1.5" /><path d="m54 63 9-4 9 4m56-17 8-4 8 4" stroke="#6B86A9" strokeWidth="1.5" fill="none" /><text x="34" y="34" fill="#8E8C73" fontFamily="monospace" fontSize="9" letterSpacing="2">OUT OF OFFICE, INTO NATURE.</text>
    </>}
    {type === 'notes' && <>
      <g transform="rotate(-7 220 130)"><rect x="93" y="47" width="245" height="160" rx="5" fill="#FCF8EB" /><path d="M216 47v160" stroke="#D9D3BE" /><path d="M117 79h69m-69 15h76m-76 15h63m-63 15h73m-73 15h47m78-60h72m-72 15h62m-62 15h74m-74 15h57" stroke="#A8B19A" strokeWidth="3" strokeLinecap="round" /><rect x="239" y="140" width="60" height="44" fill="#E8BE7C" /><path d="m253 161 8 8 19-18" stroke="#8A8051" strokeWidth="3" fill="none" /></g><path d="m331 54-40 130 9 4 40-130Z" fill="#63775B" /><circle cx="88" cy="163" r="25" fill="#D39877" /><circle cx="88" cy="163" r="18" fill="#7C6650" />
    </>}
    {type === 'desk' && <>
      <rect x="58" y="185" width="328" height="10" rx="4" fill="#97AECE" /><path d="M285 61v121m0-121-41 56m41-56 35 20" stroke="#4E709D" strokeWidth="5" /><path d="m239 99-19 36h48l-15-36Z" fill="#E4B57D" /><path d="m237 137-31 45h75l-29-45Z" fill="#F5E3B1" opacity=".6" /><rect x="102" y="86" width="116" height="82" rx="5" fill="#45658F" /><rect x="110" y="94" width="100" height="65" rx="2" fill="#DCE6F3" /><path d="M126 113h40m-40 12h64m-64 12h49" stroke="#87A4CD" strokeWidth="3" /><path d="M157 169v15m-23 0h47" stroke="#45658F" strokeWidth="4" /><path d="M309 159h28v26h-28Zm28 4h7a7 7 0 0 1 0 14h-7" stroke="#AF7E59" strokeWidth="3" fill="#D6A87C" /><path d="M319 138c8 5-5 8 2 13" stroke="#A8B398" strokeWidth="2" fill="none" />
    </>}
    {type === 'light' && <>
      <rect x="156" y="24" width="163" height="169" fill="#C7D2BB" /><path d="M166 35h143v145H166Z" fill="#EEEBD5" /><path d="M238 35v145m-72-75h143" stroke="#A0AF93" strokeWidth="8" /><path d="m168 183-75 57h159l57-57Z" fill="#F8ECC6" /><path d="m237 183-48 57m-48-28h139" stroke="#C5BD9C" strokeWidth="7" opacity=".5" /><path d="M140 177V92m0 48c-26-1-38-19-37-36 24 1 36 15 37 36Zm0-18c24-4 32-19 29-35-23 4-30 18-29 35Z" fill="#698360" stroke="#698360" strokeWidth="3" /><path d="m116 171 6 34h36l6-34Z" fill="#C79574" /><path d="M337 182h30v24h-30Z" fill="#E3AF7A" /><path d="M369 186h5a6 6 0 0 1 0 12h-5" stroke="#A47A56" strokeWidth="3" fill="none" />
    </>}
  </svg>;
}


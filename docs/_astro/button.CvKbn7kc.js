import{a as l}from"./index.DK0mN5n4.js";import{d as p,j as w,S as C,c as j}from"./index.NY1cxoVm.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),x=(...r)=>r.filter((t,e,i)=>!!t&&t.trim()!==""&&i.indexOf(t)===e).join(" ").trim();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var V={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=l.forwardRef(({color:r="currentColor",size:t=24,strokeWidth:e=2,absoluteStrokeWidth:i,className:o="",children:n,iconNode:v,...c},g)=>l.createElement("svg",{ref:g,...V,width:t,height:t,stroke:r,strokeWidth:i?Number(e)*24/Number(t):e,className:x("lucide",o),...c},[...v.map(([a,s])=>l.createElement(a,s)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=(r,t)=>{const e=l.forwardRef(({className:i,...o},n)=>l.createElement(A,{ref:n,iconNode:t,className:x(`lucide-${N(r)}`,i),...o}));return e.displayName=`${r}`,e},f=r=>typeof r=="boolean"?`${r}`:r===0?"0":r,h=p,E=(r,t)=>e=>{var i;if(t?.variants==null)return h(r,e?.class,e?.className);const{variants:o,defaultVariants:n}=t,v=Object.keys(o).map(a=>{const s=e?.[a],u=n?.[a];if(s===null)return null;const d=f(s)||f(u);return o[a][d]}),c=e&&Object.entries(e).reduce((a,s)=>{let[u,d]=s;return d===void 0||(a[u]=d),a},{}),g=t==null||(i=t.compoundVariants)===null||i===void 0?void 0:i.reduce((a,s)=>{let{class:u,className:d,...y}=s;return Object.entries(y).every(k=>{let[b,m]=k;return Array.isArray(m)?m.includes({...n,...c}[b]):{...n,...c}[b]===m})?[...a,u,d]:a},[]);return h(r,v,g,e?.class,e?.className)},O=E("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2 has-[>svg]:px-3",sm:"h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",lg:"h-10 rounded-md px-6 has-[>svg]:px-4",icon:"size-9"}},defaultVariants:{variant:"default",size:"default"}});function B({className:r,variant:t,size:e,asChild:i=!1,...o}){const n=i?C:"button";return w.jsx(n,{"data-slot":"button",className:j(O({variant:t,size:e,className:r})),...o})}export{B,O as b,z as c};

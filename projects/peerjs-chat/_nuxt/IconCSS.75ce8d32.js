import{d as l,ag as _,c as o,m,q as d,ad as f,_ as S}from"./entry.edba93fc.js";import{u as g}from"./config.8a51bff4.js";/* empty css                   */import"https://esm.sh/peerjs@1.5.4?bundle-deps";const x=l({__name:"IconCSS",props:{name:{type:String,required:!0},size:{type:String,default:""}},setup(r){const n=r;_(e=>({"17e81e26":u.value}));const t=g(),p=o(()=>{var e;return((((e=t.nuxtIcon)==null?void 0:e.aliases)||{})[n.name]||n.name).replace(/^i-/,"")}),u=o(()=>`url('https://api.iconify.design/${p.value.replace(":","/")}.svg')`),a=o(()=>{var s,c,i;if(!n.size&&typeof((s=t.nuxtIcon)==null?void 0:s.size)=="boolean"&&!((c=t.nuxtIcon)!=null&&c.size))return;const e=n.size||((i=t.nuxtIcon)==null?void 0:i.size)||"1em";return String(Number(e))===e?`${e}px`:e});return(e,s)=>(m(),d("span",{style:f({width:a.value,height:a.value})},null,4))}});const C=S(x,[["__scopeId","data-v-2717c442"]]);export{C as default};
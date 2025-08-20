import{j as t}from"./index-3Lc6BomN.js";import{r as s}from"./vendor-DjjtZf4i.js";const m=({particleCount:o=20,particleColor:e="bg-pink-300",opacity:n="opacity-70"})=>{const r=s.useMemo(()=>Array.from({length:o},(a,i)=>({id:i,left:Math.random()*100,top:Math.random()*100,delay:Math.random()*4,duration:4+Math.random()*3,size:Math.random()*3+2,opacityVariation:.4+Math.random()*.5,shape:Math.random()>.5?"rounded-full":"heart-shape"})),[o]);return t.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none particle-container",children:[r.map(a=>t.jsx("div",{className:`absolute ${a.shape} ${e} optimized-particle ${n}`,style:{left:`${a.left}%`,top:`${a.top}%`,width:`${a.size}px`,height:`${a.size}px`,opacity:a.opacityVariation,animationDelay:`${a.delay}s`,animationDuration:`${a.duration}s`,animationName:`float-particle-${a.id}`,animationIterationCount:"infinite",animationTimingFunction:"ease-in-out"}},a.id)),t.jsxs("style",{children:[r.map(a=>`
          @keyframes float-particle-${a.id} {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(${Math.random()*20-10}px) translateX(${Math.random()*20-10}px); }
            50% { transform: translateY(${Math.random()*20-10}px) translateX(${Math.random()*20-10}px); }
            75% { transform: translateY(${Math.random()*20-10}px) translateX(${Math.random()*20-10}px); }
          }
        `).join(""),`
          .heart-shape {
            position: relative;
            width: 100%;
            height: 100%;
            background-color: currentColor;
            transform: rotate(-45deg);
          }
          .heart-shape:before,
          .heart-shape:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: currentColor;
            border-radius: 50%;
          }
          .heart-shape:before {
            top: -50%;
            left: 0;
          }
          .heart-shape:after {
            top: 0;
            left: 50%;
          }
        `]})]})};export{m as O};

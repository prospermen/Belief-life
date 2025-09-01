import{j as a}from"./index-HbPZ4wUM.js";import{r as s}from"./vendor-DjjtZf4i.js";const m=({particleCount:e=12,particleColor:o="bg-yellow-300",opacity:i="opacity-60"})=>{const n=s.useMemo(()=>Array.from({length:e},(t,r)=>({id:r,left:Math.random()*100,top:Math.random()*100,delay:Math.random()*3,duration:3+Math.random()*2,size:Math.random()*2+1,opacityVariation:.3+Math.random()*.4})),[e]);return a.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none particle-container",children:[n.map(t=>a.jsx("div",{className:`absolute ${o} rounded-full optimized-particle ${i}`,style:{left:`${t.left}%`,top:`${t.top}%`,width:`${t.size}px`,height:`${t.size}px`,opacity:t.opacityVariation,animation:`float ${t.duration}s ease-in-out infinite`,animationDelay:`${t.delay}s`}},t.id)),a.jsx("style",{jsx:!0,children:`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-10px) translateX(5px); 
          }
        }
        
        .optimized-particle {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `})]})};export{m as O};

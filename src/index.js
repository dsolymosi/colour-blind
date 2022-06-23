import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


function ImgCanvas({draw, filter}) {
  const canvasRef = useRef(null);
  useEffect( () => {
    const ctx = canvasRef.current.getContext('2d');
    draw(ctx);

    if(img.complete){
      ctx.drawImage(img, 0, 0);
      var imgData = ctx.getImageData(0,0,ctx.canvas.width, ctx.canvas.height);
      for(let i = 0; i < imgData.data.length; i += 4){
        [imgData.data[i], imgData.data[i+1], imgData.data[i+2], imgData.data[i+3]] = pixelFilter(imgData.data[i], imgData.data[i+1], imgData.data[i+2], imgData.data[i+3], filter);
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [draw, filter] );

  

  return (
    <canvas ref={canvasRef} width='800' height='800' />
  )
}

function Controls(p){
  return (
    <form >
      <input type="radio" label="None" checked={p.filter===0} value="None" onChange={() => p.setFilter(0)} /> None
      <input type="radio" label="None" checked={p.filter===1} value="None" onChange={() => p.setFilter(1)} /> Protanopia (No L Cones)
      <input type="radio" label="None" checked={p.filter===2} value="None" onChange={() => p.setFilter(2)} /> Deuteranopia (No M Cones)
      <input type="radio" label="None" checked={p.filter===3} value="None" onChange={() => p.setFilter(3)} /> Tritanopia (No S Cones)
    </form>
  );
}

function pixelFilter(r,g,b,a, type){
  if(type>0) {
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);
    const [l, m, s] = LinearToLMS([lr,lg,lb]);
    let nr, ng, nb;
    if(type===1){
      [nr, ng, nb] = LMSToLinear([1.05118294*m + -0.05116099*s,m,s]);
    } else if(type===2){
      [nr, ng, nb] = LMSToLinear([l,0.9513092*l + 0.0486692*s,s]);
    } else if(type===3){
      [nr, ng, nb] = LMSToLinear([l,m,-0.86744736*l + 1.86727089*m]);
    }
    return [fromLinear(nr),fromLinear(ng),fromLinear(nb),a];
  } else {
    return [r, g, b, a];
  }
}

function toLinear(v){
  return v<=10?((v/255.0)/12.92):(((v/255.0) + 0.055)/1.055)**2.4;
}

function fromLinear(v){
  return v<=0.0031308? Math.round(255*12.92*v) : Math.round(255*(1.055*(v**0.41666)-0.055));
}

function LinearToLMS([r,g,b]){
  return [r*0.31399022 + g*0.63951294 + b*0.04649755,
          r*0.15537241 + g*0.75789446 + b*0.08670142,
          r*0.01775239 + g*0.10944209 + b*0.87256922];
}

function LMSToLinear([r,g,b]){
  return [r*5.47221206 + g*-4.6419601 + b*0.16963708,
          r*-1.1252419 + g*2.29317094 + b*-0.1678952,
          r*0.02980165 + g*-0.19318073 + b*1.16364789];
}

function App(){

  const [filter, setFilter] = useState(0);
  
  return (
    <div>
    <Controls filter={filter} setFilter={setFilter}/>
    <input type="file" onChange={(e) => {let r = new FileReader(); r.onload = (f) => {img.src = f.target.result;}; r.readAsDataURL(e.target.files[0]); setFilter(0);}}/><br/>
    <ImgCanvas filter={filter} draw={(ctx) => {
      img.onload = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } } />
    </div>
  )
}


let img = new Image();
img.src = 'img.webp';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



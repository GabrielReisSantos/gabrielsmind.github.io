export type RunResult={ok:boolean;output:string};
let activeWorker:Worker|null=null;
/** Dispose the worker on every timeout: runaway loops must not freeze the UI. */
export function stopPython(){activeWorker?.terminate();activeWorker=null;}
export function runPython(code:string,tests:string[]):Promise<RunResult>{
 stopPython();
 if(typeof Worker==='undefined')return Promise.resolve({ok:false,output:'This browser does not support Web Workers.'});
 return new Promise(resolve=>{
  const worker=new Worker(`${import.meta.env.BASE_URL}python-worker.js`);activeWorker=worker;
  let finished=false;
  const done=(result:RunResult)=>{if(finished)return;finished=true;clearTimeout(timer);stopPython();resolve(result);};
  // First use downloads the browser-local CPython/WASM runtime; subsequent runs reload the worker for clean isolation.
  let timer=window.setTimeout(()=>done({ok:false,output:'Could not load the Python runtime in time. Check your connection.'}),75_000);
  worker.onmessage=(event:MessageEvent<{id:number;phase?:string;ok:boolean;output:string}>)=>{if(event.data?.id!==1)return;if(event.data.phase==='ready'){clearTimeout(timer);timer=window.setTimeout(()=>done({ok:false,output:'Python code exceeded the 8-second execution limit; worker stopped.'}),8_000);return;}done({ok:event.data.ok,output:event.data.output});};
  worker.onerror=()=>done({ok:false,output:'Could not start the Python runtime. Pyodide needs a one-time CDN download.'});
  worker.postMessage({id:1,code,tests});
 });
}

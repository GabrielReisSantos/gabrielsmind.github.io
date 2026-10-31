/* Python runs in a dedicated, disposable worker. Runtime binaries load from the pinned Pyodide CDN.
 * Never use this execution path for untrusted third-party lab submissions or public grading.
 */
let runtimePromise;
self.onmessage = async (event) => {
  const {id, code, tests} = event.data || {};
  if (typeof id !== 'number' || typeof code !== 'string' || !Array.isArray(tests) || code.length > 12000) return;
  try {
    if (!runtimePromise) {
      runtimePromise = (async () => {
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.js');
        return await self.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/'});
      })();
    }
    const pyodide = await runtimePromise;
    self.postMessage({id,phase:'ready'});
    const script = `import contextlib, io\n__cyberlab_buffer = io.StringIO()\n__cyberlab_scope = {"__name__":"__main__"}\nwith contextlib.redirect_stdout(__cyberlab_buffer):\n    exec(${JSON.stringify(code)}, __cyberlab_scope)\n    for __cyberlab_test in ${JSON.stringify(tests)}:\n        exec(__cyberlab_test, __cyberlab_scope)\n__cyberlab_buffer.getvalue()`;
    const output = String(await pyodide.runPythonAsync(script));
    self.postMessage({id,ok:true,output:output.slice(0,4000)});
  } catch (error) {
    self.postMessage({id,ok:false,output:String(error).slice(0,2000)});
  }
};

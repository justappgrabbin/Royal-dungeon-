import synthia, { embodiment } from "../src/synthia/synthiaRuntime.mjs";
import { bindYouNIVerseHosts } from "../host/you-n-i-verse-host.mjs";

const permissions = globalThis.SynthiaPermissions ||= {
  allowExecution: false,
  allowNetwork: false,
  allowFiles: false,
};

bindYouNIVerseHosts({ permissions });
globalThis.Synthia = synthia;
globalThis.SynthiaEmbodiment = embodiment;

document.querySelector("#send")?.addEventListener("click", async () => {
  const input=document.querySelector("#input");
  const output=document.querySelector("#output");
  const text=input?.value?.trim(); if(!text) return;
  output.textContent="working…";
  try {
    const result=await synthia.talk(text,{surface:"yni-extension"});
    output.textContent=result.text + "\n\n" + result.runtime.summary;
  } catch (error) { output.textContent=error?.stack || String(error); }
});

document.querySelector("#network")?.addEventListener("change", e => permissions.allowNetwork=Boolean(e.target.checked));
document.querySelector("#execution")?.addEventListener("change", e => permissions.allowExecution=Boolean(e.target.checked));
document.querySelector("#files")?.addEventListener("change", e => permissions.allowFiles=Boolean(e.target.checked));

const status=document.querySelector("#status");
if(status) status.textContent=`Synthia ${synthia.snapshot().version} awake · ${embodiment.snapshot().components.length} body components`;

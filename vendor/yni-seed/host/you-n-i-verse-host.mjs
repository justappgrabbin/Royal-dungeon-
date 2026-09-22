import embodiment from "../src/synthia/embodiment/embodimentRuntime.mjs";

function validHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

/**
 * YOU-N-I-VERSE host adapter.
 * The host is injected; Synthia never assumes a browser/device capability exists.
 * Expected optional host methods:
 *   open(url), navigate(url), click(selector), focus(selector), fill(selector,value),
 *   inspect(), request(url, options), save(name, bytes), read(name)
 */
export function bindYouNIVerseHosts({
  host = globalThis.YNIHost || {},
  permissions = globalThis.SynthiaPermissions || {},
  document = globalThis.document,
  fetchImpl = globalThis.fetch?.bind(globalThis),
} = {}) {
  const allowed = (name) => permissions[name] === true;
  const registered = [];
  const bindOnce = (definition) => {
    if (embodiment.body.components.has(definition.id)) return;
    embodiment.bindHost(definition);
    registered.push(definition.id);
  };

  bindOnce({
    id: "synthia-yni-hands",
    capabilities: ["device.dom.click", "device.dom.focus", "device.dom.fill", "device.dom.inspect"],
    available: () => Boolean(host.click || host.fill || document?.querySelector),
    permitted: (_operation, task) => allowed("allowExecution") && ["click","focus","fill","inspect"].includes(task?.op),
    execute: async (task) => {
      if (task.op === "inspect") {
        if (host.inspect) return host.inspect(task);
        return { title: document?.title || null, url: globalThis.location?.href || null };
      }
      if (task.op === "click") {
        if (host.click) return host.click(task.selector);
        const el=document?.querySelector(task.selector); if(!el) throw new Error(`No element matches ${task.selector}`); el.click();
        return { performed:"click", selector:task.selector };
      }
      if (task.op === "focus") {
        if (host.focus) return host.focus(task.selector);
        const el=document?.querySelector(task.selector); if(!el) throw new Error(`No element matches ${task.selector}`); el.focus();
        return { performed:"focus", selector:task.selector };
      }
      if (task.op === "fill") {
        if (host.fill) return host.fill(task.selector, task.value);
        const el=document?.querySelector(task.selector); if(!el) throw new Error(`No element matches ${task.selector}`);
        el.value = task.value; el.dispatchEvent?.(new Event("input", { bubbles:true })); el.dispatchEvent?.(new Event("change", { bubbles:true }));
        return { performed:"fill", selector:task.selector };
      }
    },
  });

  bindOnce({
    id: "synthia-yni-browser",
    capabilities: ["browser.open", "browser.navigate"],
    available: () => Boolean(host.open || host.navigate || globalThis.open),
    permitted: (_operation, task) => allowed("allowNetwork") && Boolean(validHttpUrl(task?.url)),
    execute: async (task) => {
      const url=validHttpUrl(task.url); if(!url) throw new Error("Invalid URL");
      if (task.op === "navigate" && host.navigate) return host.navigate(url);
      if (host.open) return host.open(url);
      globalThis.open?.(url,"_blank");
      return { opened:url };
    },
  });

  bindOnce({
    id: "synthia-yni-network",
    capabilities: ["network.request", "network.download"],
    available: () => Boolean(host.request || fetchImpl),
    permitted: (_operation, task) => allowed("allowNetwork") && Boolean(validHttpUrl(task?.url)),
    execute: async (task) => {
      const url=validHttpUrl(task.url); if(!url) throw new Error("Invalid URL");
      if (host.request) return host.request(url, task);
      const r=await fetchImpl(url,{method:task.method||"GET",headers:task.headers,body:task.data});
      if(!r.ok) throw new Error(`Network request failed: ${r.status}`);
      return {status:r.status,data:task.responseType==="text"?await r.text():await r.arrayBuffer()};
    },
  });

  bindOnce({
    id: "synthia-yni-files",
    capabilities: ["file.read", "file.write"],
    available: () => Boolean(host.read || host.save),
    permitted: (_operation, task) => allowed("allowFiles") && typeof task?.op === "string",
    execute: (task) => {
      if(task.op==="read" && host.read) return host.read(task.name);
      if(task.op==="write" && host.save) return host.save(task.name, task.data);
      throw new Error(`File operation unavailable: ${task.op}`);
    },
  });

  return Object.freeze({registered:Object.freeze(registered), snapshot:embodiment.snapshot()});
}

export default bindYouNIVerseHosts;

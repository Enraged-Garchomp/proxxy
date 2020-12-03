const DEBUGGING_PROXY_URL = "https://proxy-staging.cloudflareclient.com:8001";
const PRODUCTION_PROXY_URL = "https://firefox.factor11.cloudflareclient.com:2486";

const DEBUGGING_FXA_OPENID = "https://accounts.stage.mozaws.net/.well-known/openid-configuration";
const PRODUCTION_FXA_OPENID = "https://accounts.firefox.com/.well-known/openid-configuration";

const DEBUGGING_SPS = "https://stage-browser.guardian.nonprod.cloudops.mozgcp.net/";
const PRODUCTION_SPS = "https://fpn.firefox.com/";

class Page {
  constructor() {
    const els = [...document.querySelectorAll("[data-l10n]")];
    for (let el of els) {
      el.textContent = this.getTranslation(el.getAttribute("data-l10n"));
    }
  }

  async init() {
    let config = await browser.runtime.sendMessage({ type: "getCurrentConfig" });
    if (!config) config = {};

    const version = document.getElementById("version");
    if (config.version) {
      version.innerText = config.version;
    } else {
      version.innerText = this.getTranslation("olderThanV10");
      config.version = 0;
    }

    const reloadButton = document.getElementById("reload");
    reloadButton.onclick = _ => {
      browser.runtime.sendMessage({ type: "reload" });
    };
    if (config.version < 10) {
      reloadButton.disabled = true;
    }

    const clearButton = document.getElementById("clear");
    clearButton.onclick = _ => {
      browser.runtime.sendMessage({ type: "clear" });
    };
    if (config.version < 12) {
      clearButton.disabled = true;
    }

    const proxyState = document.getElementById("proxyState");
    const proxyStates = config.proxyStates || [];
    proxyStates.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.selected = state == config.proxyState;
      option.textContent = state;
      proxyState.append(option);
    });
    proxyState.onchange = _ => {
      browser.runtime.sendMessage({ type: "setProxyState", value: proxyState.value });
    };
    if (config.version < 22) {
      proxyState.disabled = true;
    }

    const debuggingEnabled = document.getElementById("debuggingEnabled");
    debuggingEnabled.checked = config.debuggingEnabled || false;
    debuggingEnabled.onchange = _ => {
      browser.runtime.sendMessage({ type: "setDebuggingEnabled", value: debuggingEnabled.checked });
    };

    const onboardingShown = document.getElementById("onboardingShown");
    onboardingShown.checked = config.onboardingShown || false;

    const proxyURL = document.getElementById("proxyURL");
    proxyURL.value = config.proxyURL || "";
    proxyURL.onchange = _ => {
      browser.runtime.sendMessage({ type: "setProxyURL", value: proxyURL.value });
    };
    if (config.version < 10) {
      proxyURL.disabled = true;
    }

    const debuggingProxyURL = document.getElementById("debuggingProxyURL");
    debuggingProxyURL.onclick = _ => {
      proxyURL.value = DEBUGGING_PROXY_URL;
      browser.runtime.sendMessage({ type: "setProxyURL", value: DEBUGGING_PROXY_URL });
    };

    const productionProxyURL = document.getElementById("productionProxyURL");
    productionProxyURL.onclick = _ => {
      proxyURL.value = PRODUCTION_PROXY_URL;
      browser.runtime.sendMessage({ type: "setProxyURL", value: PRODUCTION_PROXY_URL });
    };

    const proxyMode = document.getElementById("proxyMode");
    proxyMode.value = config.proxyMode || "";
    proxyMode.onchange = _ => {
      browser.runtime.sendMessage({ type: "setProxyMode", value: proxyMode.value });
    };
    if (config.version < 15) {
      proxyMode.disabled = true;
    }

    const sps = document.getElementById("sps");
    sps.value = config.sps || "";
    sps.onchange = _ => {
      browser.runtime.sendMessage({ type: "setSPService", value: sps.value });
    };
    if (config.version < 10) {
      sps.disabled = true;
    }

    const debuggingSPService = document.getElementById("debuggingSPService");
    debuggingSPService.onclick = _ => {
      sps.value = DEBUGGING_SPS;
      browser.runtime.sendMessage({ type: "setSPService", value: DEBUGGING_SPS });
    };

    const productionSPService = document.getElementById("productionSPService");
    productionSPService.onclick = _ => {
      sps.value = PRODUCTION_SPS;
      browser.runtime.sendMessage({ type: "setSPService", value: PRODUCTION_SPS });
    };

    const fxaOpenID = document.getElementById("fxaOpenID");
    fxaOpenID.value = config.fxaOpenID || "";
    fxaOpenID.onchange = _ => {
      browser.runtime.sendMessage({ type: "setFxaOpenID", value: fxaOpenID.value });
    };
    if (config.version < 10) {
      fxaOpenID.disabled = true;
    }

    const debuggingFxaOpenID = document.getElementById("debuggingFxaOpenID");
    debuggingFxaOpenID.onclick = _ => {
      fxaOpenID.value = DEBUGGING_FXA_OPENID;
      browser.runtime.sendMessage({ type: "setFxaOpenID", value: DEBUGGING_FXA_OPENID });
    };

    const productionFxaOpenID = document.getElementById("productionFxaOpenID");
    productionFxaOpenID.onclick = _ => {
      fxaOpenID.value = PRODUCTION_FXA_OPENID;
      browser.runtime.sendMessage({ type: "setFxaOpenID", value: PRODUCTION_FXA_OPENID });
    };

    const token = await browser.runtime.sendMessage({ type: "getProxyToken" });
    const proxyToken = document.getElementById("proxyToken");
    proxyToken.value = JSON.stringify(token);
    if (config.version < 10) {
      proxyToken.disabled = true;
    }

    const proxySubmitButton = document.getElementById("proxySubmit");
    proxySubmitButton.onclick = _ => {
      try {
        const value = JSON.parse(proxyToken.value);
        browser.runtime.sendMessage({ type: "setProxyToken", value });
      } catch (e) {
        alert("Syntax invalid: " + e);
      }
    };
    if (config.version < 10) {
      proxySubmitButton.disabled = true;
    }

    const messageServiceInterval = document.getElementById("messageServiceInterval");
    messageServiceInterval.value = config.messageServiceInterval;
    messageServiceInterval.onchange = _ => {
      browser.runtime.sendMessage({ type: "setMessageServiceInterval", value: messageServiceInterval.value });
    };
    if (config.version < 22) {
      messageServiceInterval.disabled = true;
    }
  }

  getTranslation(stringName, ...args) {
    if (args.length > 0) {
      return browser.i18n.getMessage(stringName, ...args);
    }
    return browser.i18n.getMessage(stringName);
  }
}

const p = new Page();
p.init();

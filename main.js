import initSwc, { transformSync } from "@swc/wasm-web";

// Initialize SWC WASM
let initialized = false;

async function initializeSwc() {
  if (!initialized) {
    try {
      await initSwc();
      initialized = true;
      console.log("SWC WASM initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SWC WASM:", error);
      throw error;
    }
  }
}

window.transformCode = async function () {
  const input = document.getElementById("input").value;
  const result = document.getElementById("result");

  try {
    await initializeSwc();
    
    if (!initialized) {
      result.textContent = "SWC not initialized yet";
      return;
    }
    
    const transformed = transformSync(input, {
      jsc: {
        target: "es5",
        parser: {
          syntax: "ecmascript",
        },
        transform: {
          react: {
            pragma: "React.createElement",
            pragmaFrag: "React.Fragment"
          }
        },
      },
    });

    result.textContent = transformed.code;
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
  }
};

window.clearResults = function () {
  document.getElementById("result").textContent = "";
};

console.log("SWC WASM Demo loaded");

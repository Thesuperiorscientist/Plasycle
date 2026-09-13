

let model = null;
let wasteData = null;

const MODEL_URL = "model/model.json";
const METADATA_URL = "model/metadata.json";

async function loadModel() {
  try {
    console.log("⏳ Loading Plasycle plastic model...");
    model = await tmImage.load(MODEL_URL, METADATA_URL);
    console.log("✅ Model loaded");

    const response = await fetch("data/waste_data.json");
    wasteData = await response.json();
    console.log("✅ Waste data loaded");

    const btn = document.getElementById("classifyBtn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🔍 Scan Plastic";
    }
    return true;
  } catch (err) {
    console.error("❌ Model loading failed:", err);
    const btn = document.getElementById("classifyBtn");
    if (btn) {
      btn.textContent = "Model failed to load";
      btn.disabled = true;
    }
    return false;
  }
}

async function classifyImage(imgElement) {
  if (!model || !imgElement || !imgElement.src) return null;
  try {
    const predictions = await model.predict(imgElement);
    console.log("Raw predictions:", predictions);

    let top = predictions[0];
    for (const p of predictions) {
      if (p.probability > top.probability) top = p;
    }

    const className = top.className;
    const confidence = (top.probability * 100).toFixed(1);

    const data = wasteData[className] || wasteData["Others"];

    return {
      detectedItem: className,
      confidence: confidence,
      category: data.category,
      fullName: data.fullName,
      examples: data.examples,
      filamentReady: data.filamentReady,
      filamentQuality: data.filamentQuality,
      pricePerKg: data.pricePerKg,
      filamentYield: data.filamentYield,
      carbonPerKg: data.carbonPerKg,
      printedProducts: data.printedProducts,
      location: data.location,
      earningsExample: data.earningsExample
    };
  } catch (err) {
    console.error("Classification error:", err);
    return null;
  }
}

loadModel();
/* PLASYCLE – ui.js (FINAL with all animations) */

let uploadArea, uploadInput, preview, uploadPlaceholder;
let classifyBtn, resetBtn, loadingIndicator;
let resultsEmpty, resultsContent;
let pipeline, splitViewPanel, splitContainer, splitHandle;
let carouselPanel, carouselTrack, carouselDots;
let printerPanel, printerProduct, printerProgressText, printerStatus;
let currentLang = "en";
let productsData = null;
let currentProducts = [];
let currentProductIndex = 0;

const NARRATION = {
  en: {
    detected: "Detected plastic type",
    fullName: "Full name",
    filamentReady: "Filament ready",
    filamentQuality: "Filament quality",
    filamentYield: "Filament yield",
    marketValue: "Market value",
    carbon: "Carbon saved",
    collection: "Collection point",
    products: "What it can become",
    earnings: "Earnings example",
    confidence: "Confidence",
    yes: "yes", no: "no", limited: "limited",
    perKg: "ringgit per kilogram"
  },
  ms: {
    detected: "Jenis plastik dikesan",
    fullName: "Nama penuh",
    filamentReady: "Sedia untuk filamen",
    filamentQuality: "Kualiti filamen",
    filamentYield: "Hasil filamen",
    marketValue: "Nilai pasaran",
    carbon: "Karbon dijatuhkan",
    collection: "Titik pengumpulan",
    products: "Apa ia boleh jadi",
    earnings: "Contoh pendapatan",
    confidence: "Keyakinan",
    yes: "ya", no: "tidak", limited: "terhad",
    perKg: "ringgit sekilogram"
  }
};

fetch("data/products.json")
  .then((res) => res.json())
  .then((data) => { productsData = data; console.log("✅ Products loaded"); })
  .catch((err) => console.error("Failed to load products:", err));

document.addEventListener("DOMContentLoaded", () => {
  uploadArea = document.getElementById("uploadArea");
  uploadInput = document.getElementById("imageUpload");
  preview = document.getElementById("preview");
  uploadPlaceholder = document.getElementById("uploadPlaceholder");
  classifyBtn = document.getElementById("classifyBtn");
  resetBtn = document.getElementById("resetBtn");
  loadingIndicator = document.getElementById("loadingIndicator");
  resultsEmpty = document.getElementById("resultsEmpty");
  resultsContent = document.getElementById("resultsContent");
  pipeline = document.getElementById("pipeline");
  splitViewPanel = document.getElementById("splitViewPanel");
  splitContainer = document.getElementById("splitContainer");
  splitHandle = document.getElementById("splitHandle");
  carouselPanel = document.getElementById("carouselPanel");
  carouselTrack = document.getElementById("carouselTrack");
  carouselDots = document.getElementById("carouselDots");
  printerPanel = document.getElementById("printerPanel");
  printerProduct = document.getElementById("printerProduct");
  printerProgressText = document.getElementById("printerProgressText");
  printerStatus = document.getElementById("printerStatus");

  if (!uploadArea || !uploadInput) return;

  uploadArea.addEventListener("click", () => uploadInput.click());

  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "#16a34a";
    uploadArea.style.transform = "scale(1.02)";
  });
  uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "";
    uploadArea.style.transform = "";
  });
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "";
    uploadArea.style.transform = "";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  });

  if (classifyBtn) classifyBtn.addEventListener("click", handleClassify);
  if (resetBtn) resetBtn.addEventListener("click", resetDemo);

  const langBtns = document.querySelectorAll(".lang-btn");
  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      langBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentLang = btn.dataset.lang;
      speak(
        currentLang === "en"
          ? "Voice narration set to English."
          : "Narasi suara ditetapkan ke Bahasa Malaysia.",
        currentLang
      );
    });
  });

  if (splitContainer && splitHandle) {
    let isDragging = false;
    const startDrag = () => { isDragging = true; };
    const stopDrag = () => { isDragging = false; };
    const doDrag = (e) => {
      if (!isDragging) return;
      const rect = splitContainer.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let percent = ((clientX - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      updateSplit(percent);
    };
    splitHandle.addEventListener("mousedown", startDrag);
    splitHandle.addEventListener("touchstart", startDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("touchmove", doDrag);
    splitContainer.addEventListener("click", (e) => {
      const rect = splitContainer.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      updateSplit(Math.max(0, Math.min(100, percent)));
    });
  }

  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  if (prevBtn) prevBtn.addEventListener("click", () => moveCarousel(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => moveCarousel(1));
});

function updateSplit(percent) {
  const afterWrapper = document.getElementById("splitAfterWrapper");
  if (afterWrapper) afterWrapper.style.width = percent + "%";
  if (splitHandle) splitHandle.style.left = percent + "%";
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    if (uploadPlaceholder) uploadPlaceholder.style.display = "none";
    if (classifyBtn) {
      classifyBtn.disabled = false;
      classifyBtn.textContent = "🔍 Scan Plastic";
    }
    if (resultsEmpty) resultsEmpty.style.display = "block";
    if (resultsContent) resultsContent.style.display = "none";
    if (resetBtn) resetBtn.style.display = "none";
    if (splitViewPanel) splitViewPanel.style.display = "none";
    if (carouselPanel) carouselPanel.style.display = "none";
    if (printerPanel) printerPanel.style.display = "none";
    resetPipeline();
  };
  reader.readAsDataURL(file);
}

function resetPipeline() {
  document.querySelectorAll(".pipeline-step").forEach((s) => s.classList.remove("active"));
  document.querySelectorAll(".pipeline-arrow").forEach((a) => a.classList.remove("active"));
  const fill = document.getElementById("pipelineProgressFill");
  if (fill) fill.style.width = "0%";
}

function animatePipeline() {
  const steps = document.querySelectorAll(".pipeline-step");
  const arrows = document.querySelectorAll(".pipeline-arrow");
  const fill = document.getElementById("pipelineProgressFill");

  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add("active");
      if (arrows[i - 1]) arrows[i - 1].classList.add("active");
      if (fill) fill.style.width = ((i + 1) / steps.length * 100) + "%";
    }, i * 400);
  });
}

async function handleClassify() {
  if (!preview || !preview.src) return;
  if (loadingIndicator) loadingIndicator.style.display = "block";
  if (classifyBtn) classifyBtn.disabled = true;
  if (resultsEmpty) resultsEmpty.style.display = "none";
  if (resultsContent) resultsContent.style.display = "none";
  if (splitViewPanel) splitViewPanel.style.display = "none";
  if (carouselPanel) carouselPanel.style.display = "none";
  if (printerPanel) printerPanel.style.display = "none";

  try {
    const result = await classifyImage(preview);
    if (result) {
      displayResults(result);
      narrateResult(result);
      if (resetBtn) resetBtn.style.display = "block";

      resetPipeline();
      animatePipeline();

      setTimeout(() => showPrinter(result), 2000);
      setTimeout(() => showSplitView(result), 2400);
      setTimeout(() => showCarousel(result), 2800);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = "none";
    if (classifyBtn) classifyBtn.disabled = false;
  }
}

function displayResults(result) {
  if (!resultsContent) return;
  resultsContent.style.display = "block";
  resultsContent.innerHTML = `
    <div class="result-block result-item-block">
      <span class="result-label">Detected Plastic</span>
      <span class="result-value">${result.detectedItem}</span>
      <span class="result-confidence">(${result.confidence}% confidence)</span>
    </div>
    <div class="result-block result-category-block">
      <span class="result-label">Full Name</span>
      <span class="result-value">${result.fullName}</span>
    </div>
    <div class="result-block result-recyclable-block">
      <span class="result-label">Filament Ready</span>
      <span class="result-value" style="color:${result.filamentReady === 'Yes' ? '#15803d' : result.filamentReady === 'Limited' ? '#65a30d' : '#dc2626'};">${result.filamentReady}</span>
    </div>
    <div class="result-block result-value-block">
      <span class="result-label">Filament Quality</span>
      <span class="result-value">${result.filamentQuality}</span>
    </div>
    <div class="result-block result-carbon-block">
      <span class="result-label">Filament Yield</span>
      <span class="result-value">${result.filamentYield}</span>
    </div>
    <div class="result-block result-value-block">
      <span class="result-label">Market Value</span>
      <span class="result-value">${result.pricePerKg > 0 ? 'RM ' + result.pricePerKg.toFixed(2) + '/kg' : 'No market value'}</span>
    </div>
    <div class="result-block result-carbon-block">
      <span class="result-label">CO₂ Saved</span>
      <span class="result-value">${result.carbonPerKg > 0 ? result.carbonPerKg + ' kg CO₂ per kg' : '—'}</span>
    </div>
    <div class="result-block result-location-block">
      <span class="result-label">Collection Point</span>
      <span class="result-value">${result.location}</span>
    </div>
    <div class="result-block result-earnings-block">
      <span class="result-label">Becomes STEM Learning Aid</span>
      <span class="result-value">${result.printedProducts}</span>
    </div>
    <div class="result-block result-earnings-block">
      <span class="result-label">Earnings Example</span>
      <span class="result-value">${result.earningsExample}</span>
    </div>
  `;
}

/* ============ 3D PRINTER SIMULATION ============ */
function showPrinter(result) {
  if (!printerPanel) return;
  printerPanel.style.display = "block";
  if (printerProduct) printerProduct.classList.remove("printing");
  if (printerProgressText) printerProgressText.textContent = "0%";
  if (printerStatus) {
    printerStatus.textContent = "Printing...";
    printerStatus.classList.remove("complete");
  }

  setTimeout(() => {
    if (printerProduct) printerProduct.classList.add("printing");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (printerProgressText) printerProgressText.textContent = progress + "%";
      if (progress >= 100) {
        clearInterval(interval);
        if (printerStatus) {
          printerStatus.textContent = "✅ Print complete — STEM aid ready!";
          printerStatus.classList.add("complete");
        }
      }
    }, 300);
  }, 300);
}

function showSplitView(result) {
  if (!splitViewPanel) return;
  const beforeImg = document.getElementById("splitBeforeImg");
  const afterImg = document.getElementById("splitAfterImg");

  if (beforeImg && preview) beforeImg.src = preview.src;

  const products = productsData && productsData[result.detectedItem];
  if (afterImg && products && products.length > 0) {
    afterImg.src = products[0].image;
    afterImg.onerror = () => {
      afterImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%23dcfce7'/><text x='200' y='200' font-size='24' text-anchor='middle' fill='%2315803d'>STEM Learning Aid</text></svg>";
    };
  }

  splitViewPanel.style.display = "block";
  updateSplit(50);
}

function showCarousel(result) {
  if (!carouselPanel || !carouselTrack) return;
  currentProducts = (productsData && productsData[result.detectedItem]) || [];
  if (currentProducts.length === 0) return;

  currentProductIndex = 0;
  renderCarousel();
  carouselPanel.style.display = "block";
}

function renderCarousel() {
  if (!carouselTrack || !carouselDots) return;

  carouselTrack.innerHTML = currentProducts.map((p) => `
    <div class="carousel-card">
      <div class="carousel-img-wrapper">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect width=%22300%22 height=%22200%22 fill=%22%23dcfce7%22/><text x=%22150%22 y=%22110%22 font-size=%2218%22 text-anchor=%22middle%22 fill=%22%2315803d%22>${p.name}</text></svg>'" />
      </div>
      <h3>${p.name}</h3>
      <p class="carousel-detail">🧵 ${p.filamentUsed} filament</p>
      <p class="carousel-detail">🌍 ${p.carbonSaved} saved</p>
      <p class="carousel-detail">🎓 ${p.useCase}</p>
      <p class="carousel-detail">👥 ${p.beneficiary}</p>
      <p class="carousel-price">${p.price}</p>
    </div>
  `).join("");

  carouselDots.innerHTML = currentProducts.map((_, i) =>
    `<span class="carousel-dot ${i === currentProductIndex ? 'active' : ''}" data-index="${i}"></span>`
  ).join("");

  document.querySelectorAll(".carousel-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      currentProductIndex = parseInt(dot.dataset.index);
      updateCarousel();
    });
  });

  updateCarousel();
}

function updateCarousel() {
  if (!carouselTrack) return;
  const cardWidth = 320;
  carouselTrack.style.transform = `translateX(-${currentProductIndex * cardWidth}px)`;

  document.querySelectorAll(".carousel-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentProductIndex);
  });
}

function moveCarousel(direction) {
  if (currentProducts.length === 0) return;
  currentProductIndex += direction;
  if (currentProductIndex < 0) currentProductIndex = currentProducts.length - 1;
  if (currentProductIndex >= currentProducts.length) currentProductIndex = 0;
  updateCarousel();
}

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "ms" ? "ms-MY" : "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function narrateResult(result) {
  const t = NARRATION[currentLang];
  let readyValue = result.filamentReady;
  if (currentLang === "ms") {
    if (readyValue === "Yes") readyValue = t.yes;
    else if (readyValue === "No") readyValue = t.no;
    else if (readyValue === "Limited") readyValue = t.limited;
  }

  let speech = "";
  if (currentLang === "en") {
    speech = `Scan complete. ${t.detected}: ${result.detectedItem}, with ${result.confidence} percent ${t.confidence}. ${t.fullName}: ${result.fullName}. ${t.filamentReady}: ${readyValue}. ${t.filamentYield}: ${result.filamentYield}. ${t.marketValue}: ${result.pricePerKg > 0 ? "RM " + result.pricePerKg.toFixed(2) + " " + t.perKg : "no market value"}. ${t.carbon}: ${result.carbonPerKg > 0 ? result.carbonPerKg + " kilograms of CO2 per kilogram" : "not applicable"}. This plastic can become STEM learning aids for rural schools.`;
  } else {
    speech = `Imbasan selesai. ${t.detected}: ${result.detectedItem}, dengan ${result.confidence} peratus ${t.confidence}. ${t.fullName}: ${result.fullName}. ${t.filamentReady}: ${readyValue}. ${t.filamentYield}: ${result.filamentYield}. ${t.marketValue}: ${result.pricePerKg > 0 ? "RM " + result.pricePerKg.toFixed(2) + " " + t.perKg : "tiada nilai pasaran"}. ${t.carbon}: ${result.carbonPerKg > 0 ? result.carbonPerKg + " kilogram CO2 sekilogram" : "tidak berkenaan"}. Plastik ini boleh menjadi alat pembelajaran STEM untuk sekolah luar bandar.`;
  }

  speak(speech, currentLang);
}

function resetDemo() {
  if (preview) { preview.src = ""; preview.style.display = "none"; }
  if (uploadPlaceholder) uploadPlaceholder.style.display = "block";
  if (uploadInput) uploadInput.value = "";
  if (classifyBtn) {
    classifyBtn.disabled = true;
    classifyBtn.textContent = "🔍 Scan Plastic";
  }
  if (resetBtn) resetBtn.style.display = "none";
  if (resultsEmpty) resultsEmpty.style.display = "block";
  if (resultsContent) resultsContent.style.display = "none";
  if (loadingIndicator) loadingIndicator.style.display = "none";
  if (splitViewPanel) splitViewPanel.style.display = "none";
  if (carouselPanel) carouselPanel.style.display = "none";
  if (printerPanel) printerPanel.style.display = "none";
  resetPipeline();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
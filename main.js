window.addEventListener("DOMContentLoaded", () => {
  const aboutBtn = document.getElementById("aboutBtn");
  const contactBtn = document.getElementById("contactBtn");
  const aboutSection = document.getElementById("about");
  const contactSection = document.getElementById("contact");
  const backToTop = document.getElementById("backToTop");
  const form = document.getElementById("leadForm");
  const searchInput = document.getElementById("productSearch");
  const searchButton = document.getElementById("searchButton");
 
  const modelViewer = document.getElementById("mobileModel");
const bottles = [
  "assets/models/corona.glb",
  "assets/models/cocacola.glb",
  "assets/models/jager.glb",
  "assets/models/baylis.glb",
  "assets/models/heiniken.glb"
];
let currentIndex = 0;

// Initial model load
function loadModel(index) {
  modelViewer.setAttribute("src", bottles[index]);
}

if (window.innerWidth < 768) {
  loadModel(currentIndex);

  document.getElementById("nextBtn").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % bottles.length;
    loadModel(currentIndex);
  });

  document.getElementById("prevBtn").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + bottles.length) % bottles.length;
    loadModel(currentIndex);
  });
}


  // Smooth scroll for nav
  aboutBtn?.addEventListener("click", () => aboutSection.scrollIntoView({ behavior: "smooth" }));
  contactBtn?.addEventListener("click", () => contactSection.scrollIntoView({ behavior: "smooth" }));

  // Show/hide floating buttons
  function toggleButtons() {
    const aboutPos = aboutSection.getBoundingClientRect();
    const contactPos = contactSection.getBoundingClientRect();

    if (aboutPos.top < window.innerHeight * 0.6 && aboutPos.bottom > window.innerHeight * 0.4) {
      aboutBtn.classList.add("hidden-btn");
    } else {
      aboutBtn.classList.remove("hidden-btn");
    }

    if (contactPos.top < window.innerHeight * 0.6 && contactPos.bottom > window.innerHeight * 0.4) {
      contactBtn.classList.add("hidden-btn");
    } else {
      contactBtn.classList.remove("hidden-btn");
    }
  }
  window.addEventListener("scroll", toggleButtons);
  toggleButtons();

  // Back to top button
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("show", window.scrollY > 400);
  });

  // 🔍 Handle search automation → pre-fill contact form
  function handleSearch() {
    const product = searchInput.value.trim();
    if (!product) return;

    const msg = `Hello! I would like to discuss a price offer for ${product}.`;
    const orderField = document.querySelector('textarea[name="order"]');
    if (orderField) orderField.value = msg;

    contactSection?.scrollIntoView({ behavior: "smooth" });
  }

  searchButton?.addEventListener("click", handleSearch);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  });

  // 📤 Firebase form submission
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
      alert("⚠️ Please complete the CAPTCHA.");
      return;
    }
  
    const data = {
      company: form.company.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      order: form.order.value.trim(),
      captchaToken: captchaToken
    };
  
    try {
      const res = await fetch("https://handleform-gg7jkylt7q-uc.a.run.app/submit", { // ✅ include /submit
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
  
      const result = await res.json();

      // Create the popup container
      const successPopup = document.createElement("div");
      successPopup.className = "custom-popup";
      successPopup.innerHTML = `
        <div class="popup-content">
          <span class="popup-close">&times;</span>
          <p>✅ <strong>Thank you!</strong> Our agent will get back to you within the next 24 hours 🍾</p>
        </div>
      `;
      
      document.body.appendChild(successPopup);
      
      // Close on click
      successPopup.querySelector(".popup-close").addEventListener("click", () => {
        successPopup.remove();
      });      



// Reset form and CAPTCHA
form.reset();
grecaptcha.reset();
    } catch (err) {
      console.error("⚠️ Submit Error:", err);
      alert("⚠️ Submission failed. Please try again.");
    }
  });
  
  // 🎥 3D Canvas Setup
  if (document.getElementById("bottle-canvas")) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.4, 3);

    const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("bottle-canvas"),
      alpha: true,
      antialias: true
    });
    renderer.setSize(300, 300);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(2, 4, 2);
    scene.add(light);

    const loader = new THREE.GLTFLoader();
    loader.load("assets/models/bottle1.gltf", function (gltf) {
      const model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      scene.add(model);

      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    }, undefined, function (error) {
      console.error("Model load failed:", error);
    });
  }
});

// 🍪 Cookie Consent Logic
const cookieBanner = document.getElementById("cookie-banner");
const acceptBtn = document.getElementById("acceptCookies");

if (!localStorage.getItem("cookiesAccepted")) {
  cookieBanner.classList.remove("hidden");
}

acceptBtn?.addEventListener("click", () => {
  localStorage.setItem("cookiesAccepted", "true");
  cookieBanner.classList.add("hidden");
});

if (localStorage.getItem("cookiesAccepted")) {
  // load analytics scripts
}

// Mobile 

if (window.innerWidth <= 768) {
  let lastScroll = window.scrollY;
  const footer = document.querySelector(".main-footer");

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll) {
      // Scrolling down
      footer.classList.add("hide-footer");
    } else {
      // Scrolling up
      footer.classList.remove("hide-footer");
    }

    lastScroll = currentScroll;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Hamburger Menu
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("is-active");
    mobileMenu.classList.toggle("is-active");
    document.body.style.overflow = mobileMenu.classList.contains("is-active")
      ? "hidden"
      : "";
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("is-active");
      mobileMenu.classList.remove("is-active");
      document.body.style.overflow = "";
    });
  });

  // Typing Effect for Hero
  const nameElement = document.getElementById("hero-name");
  if (nameElement) {
    const originalText = nameElement.textContent;
    nameElement.innerHTML = ""; // Clear text
    let i = 0;

    function typeWriter() {
      if (i < originalText.length) {
        nameElement.innerHTML += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      } else {
        // Add cursor at the end
        const cursor = document.createElement("span");
        cursor.className = "typing-cursor";
        nameElement.appendChild(cursor);
      }
    }
    setTimeout(typeWriter, 500); // Start after a short delay
  }

  // Game Tabs Logic
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".game-panel");

  function showPanel(targetId) {
    panels.forEach((p) => {
      p.classList.remove("active");
      if (p.id === targetId) {
        p.classList.add("active");
      }
    });

    // Pause all games when switching tabs
    if (window.Snake && typeof window.Snake.pause === "function")
      window.Snake.pause();
    if (window.Flappy && typeof window.Flappy.pause === "function")
      window.Flappy.pause();
    if (window.Tetris && typeof window.Tetris.pause === "function")
      window.Tetris.pause();

    const panel = document.getElementById(targetId);
    // Lazy-load games only when they are first clicked
    if (panel && panel.getAttribute("data-loaded") === "false") {
      panel.setAttribute("data-loaded", "true");
      const gameType = panel.id.replace("game-", "");
      if (gameType === "flappy" && typeof initFlappy === "function") {
        initFlappy();
      }
      if (gameType === "tetris" && typeof initTetris === "function") {
        initTetris();
      }
    }
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      tabs.forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const targetId = `game-${e.currentTarget.dataset.target}`;
      showPanel(targetId);
    });
  });

  // Animate on Scroll
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Animate skill bars if they are in the skills section
        if (entry.target.id === "skills") {
          entry.target.querySelectorAll(".skillbar").forEach((skillbar) => {
            const bar = skillbar.querySelector(".skillbar-bar");
            bar.style.width = skillbar.getAttribute("data-percent");
          });
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in").forEach((section) => {
    observer.observe(section);
  });

  // --- GANTI BLOK CONTACT FORM LAMA DENGAN INI ---
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    // Inisialisasi EmailJS dengan Public Key Anda
    emailjs.init({
      publicKey: "ejApSth_w178VnL9M",
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Mencegah form melakukan submit standar

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = "Mengirim...";
      submitBtn.disabled = true;

      // Ambil ID dari akun EmailJS Anda
      const serviceID = "service_f993dgv";
      const templateID = "template_37k2f3h";

      // Siapkan parameter untuk dikirim
      const templateParams = {
        from_name: document.getElementById("cname").value,
        from_email: document.getElementById("cemail").value,
        message: document.getElementById("cmessage").value,
      };

      // Kirim email menggunakan EmailJS
      emailjs
        .send(serviceID, templateID, templateParams)
        .then((res) => {
          alert("Pesan berhasil terkirim! Terima kasih.");
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          contactForm.reset(); // Kosongkan form setelah berhasil
        })
        .catch((err) => {
          alert(
            "Gagal mengirim pesan. Silakan coba lagi. Error: " +
              JSON.stringify(err)
          );
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        });
    });
  }
});

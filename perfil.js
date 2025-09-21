// Menú lateral
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.querySelector('.overlay');
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('show');
  sidebarOverlay.classList.toggle('show');
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('show');
  sidebarOverlay.classList.remove('show');
});

/* ===== Firebase ===== */
const firebaseConfig = {
      apiKey: "AIzaSyAu0WbdAi8_yA2S6qKMUCLfty5w0PxgKVE",
      authDomain: "anime-offis.firebaseapp.com",
      projectId: "anime-offis",
      storageBucket: "anime-offis.appspot.com",
      messagingSenderId: "377121993034",
      appId: "1:377121993034:web:a4ba7995e827bcbea411b3"
    };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ===== UI refs ===== */
const verifyButton = document.getElementById('verify-button');
const badgeTextElement = document.getElementById('verified-badge-text');
const framesContainerWrapper = document.getElementById('photo-frames-container');
const animationOptions = document.querySelectorAll('.animation-option');
const insigniasContainer = document.querySelector('.insignias');
const moonOverlay = document.getElementById('moon-animation');
const planeContainer = document.querySelector('.plane-container');
const planeElement = planeContainer?.querySelector('.plane');

/* ===== Helpers ===== */
function canShowAnimationByVerification(verifiedArray) {
  const arr = Array.isArray(verifiedArray) ? verifiedArray : [verifiedArray];
  return arr.some(v => ["creador","beta","platinum","imperial","colaborador","aportador","soporte"].includes(v));
}

function showAnimation(type, allowed) {
  if (moonOverlay) moonOverlay.style.display = "none";
  if (planeContainer) planeContainer.style.display = "none";

  if (!allowed) return;

  if (type === "moon") {
    if (moonOverlay) {
      moonOverlay.style.display = "flex";
      setTimeout(() => { moonOverlay.style.display = "none"; }, 6000);
    }
  } else if (type === "plane") {
    if (planeContainer && planeElement) {
      planeContainer.style.display = "flex";

      planeElement.addEventListener('animationend', () => {
        planeContainer.style.display = 'none';
        planeElement.style.left = '-150px';
      }, { once: true });
    }
  }
  
  if (type === "mexico") {
  startMexicoAnimation();
}
  
 if (type === "fireworks") {
  startFireworksVideo();
}
if (type === "sakura") {
    overlay = document.getElementById("sakura-animation");
    overlay.style.display = "block";
    startSakura();
    setTimeout(() => overlay.style.display = "none", 8000);
  }
}

function setAnimationOptionSelected(type) {
  animationOptions.forEach(o => {
    o.classList.toggle('selected', o.getAttribute('data-animation') === type);
  });
}

function renderInsignias(insignias) {
  insigniasContainer.innerHTML = '';
  if (!insignias) return;
  insignias.forEach(i => {
    const span = document.createElement('span');
    span.classList.add('insignia');
    span.innerHTML = `<img src="${i.src}" alt="insignia"> ${i.text}`;
    insigniasContainer.appendChild(span);
  });
}

/* ===== Cargar datos usuario ===== */
auth.onAuthStateChanged(async (user) => {
  if (!user) return window.location.href = "https://www.animeoffis.com/dashboard.html";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdToFetch = urlParams.get('usuario') || user.uid;
    const doc = await db.collection('users').doc(userIdToFetch).get();
    if (!doc.exists) return alert("Usuario no encontrado");

    const data = doc.data();

    // Nombre, fecha y foto
    document.getElementById('user-name').textContent = data.username || "Sin nombre";
    document.getElementById('user-registration-date').textContent = data.registrationDate
      ? new Date(data.registrationDate).toLocaleDateString() : "";
    const profilePhoto = document.getElementById('profile-photo');
    if (data.profilePhoto) profilePhoto.src = data.profilePhoto;

    // Biografía
    document.getElementById('bio').value = data.bio || "Amante del anime con Anime Offis...";

    // Insignias múltiples
    const insigniasMap = {
      "creador": {src:"crea.png", text:"Creador ❄️"},
      "beta": {src:"beta.png", text:"Usuario Beta ⚙️"},
      "platinum": {src:"plat.png", text:"Platinum 👑"},
      "imperial": {src:"imperial.png", text:"Imperial 🏆"},
      "colaborador": {src:"cola.png", text:"Colaborador 🤝"},
      "aportador": {src:"aportador.png", text:"Aportador ⚡"},
      "soporte": {src:"soport.png", text:"Soporte ✅"},
      "dora": {src:"verif.png", text:"Verificado Premium ✅"},
      "azul": {src:"azul.png", text:"Fan Anime Offis ✅"},
      "verde": {src:"verde.png", text:"Fan Básico ✅"}
    };
    

    const userVerifications = Array.isArray(data.verified) ? data.verified : [data.verified];
    // Mostrar u ocultar opciones de animación según verificación
const animationContainer = document.getElementById("animation-options-container");
if (animationContainer) {
  if (canShowAnimationByVerification(userVerifications)) {
    animationContainer.style.display = "block"; // las muestra
  } else {
    animationContainer.style.display = "none"; // las oculta
  }
}
    const insigniasToRender = userVerifications.map(v => insigniasMap[v.toLowerCase()]).filter(Boolean);
    renderInsignias(insigniasToRender);

    // Botón de verificación y marcos
    const hasBadge = insigniasToRender.length > 0;
    verifyButton.style.display = hasBadge ? "none" : "inline-block";
    framesContainerWrapper.style.display = hasBadge ? "block" : "none";

    // Desbloquear marcos especiales
    if (userVerifications.some(v => ["creador","beta","soporte"].includes(v.toLowerCase()))) {
      document.querySelectorAll(".photo-frame.locked").forEach(f => f.classList.remove("locked"));
      document.querySelectorAll(".frame-option .frame-text").forEach(t => {
        if (t.textContent.includes("Exclusivo")) t.textContent = "✅ Desbloqueado";
        t.classList.remove('locked'); t.classList.add('unlocked');
      });
    }

    // Mostrar marco seleccionado
    if (data.profileFrame) {
      document.querySelectorAll('.frame').forEach(f => f.style.display = 'none');
      const current = document.getElementById(data.profileFrame);
      if (current) current.style.display = 'block';
    }

    // Animaciones
    const savedAnimation = data.profileAnimation || "moon";
    setAnimationOptionSelected(savedAnimation);
    showAnimation(savedAnimation, canShowAnimationByVerification(userVerifications));

  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
});

/* ===== Selector de animación ===== */
animationOptions.forEach(option => {
  option.addEventListener('click', async () => {
    const selectedAnimation = option.getAttribute('data-animation');
    setAnimationOptionSelected(selectedAnimation);

    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      await db.collection('users').doc(user.uid).update({ profileAnimation: selectedAnimation });
      const doc = await db.collection('users').doc(user.uid).get();
      const allowed = canShowAnimationByVerification(doc.data().verified);
      showAnimation(selectedAnimation, allowed);
    } catch (e) {
      console.error("Error al guardar animación:", e);
    }
  });
});

/* ===== Lógica marcos ===== */
document.querySelectorAll('.photo-frame').forEach(frame => {
  frame.addEventListener('click', async function () {
    if (this.classList.contains("locked")) return alert("❌ Este marco está disponible solo para usuarios Beta.");

    const selectedFrame = this.getAttribute('data-frame');
    document.querySelectorAll('.frame').forEach(f => f.style.display = 'none');
    const current = document.getElementById(selectedFrame);
    if (current) current.style.display = 'block';

    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      await db.collection('users').doc(user.uid).update({ profileFrame: selectedFrame });
    } catch (e) { console.error("Error al guardar el marco:", e); }
  });
});

/* ===== Subida de foto ===== */
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  fetch('https://api.imgbb.com/1/upload?key=5b0931fc3792f2069b046ef7eed268da', {
    method: 'POST', body: formData
  })
  .then(r => r.json())
  .then(async data => {
    if (!data.success) return console.error('Error al subir la imagen', data.error?.message);
    const imageUrl = data.data.url;
    document.getElementById('profile-photo').src = imageUrl;

    const user = firebase.auth().currentUser;
    if (!user) return;
    try { await db.collection('users').doc(user.uid).update({ profilePhoto: imageUrl }); }
    catch (e) { console.error("Error al actualizar foto:", e); }
  })
.catch(err => console.error('Error al cargar la imagen a ImgBB:', err));
});

/* ===== Guardar Bio ===== */
document.getElementById('save-bio').addEventListener('click', async () => {
  const bio = document.getElementById('bio').value;
  const user = firebase.auth().currentUser;
  if (!user) return;

  try {
    await db.collection('users').doc(user.uid).update({ bio });
    alert('✅ Biografía guardada correctamente.');
  } catch (e) {
    console.error("Error al guardar la biografía:", e);
  }
});

function createPetal() {
  const petal = document.createElement("div");
  petal.classList.add("petal");
  petal.textContent = "🌸";
  petal.style.left = Math.random() * window.innerWidth + "px";
  petal.style.fontSize = (Math.random() * 10 + 15) + "px";
  petal.style.animationDuration = (Math.random() * 3 + 6) + "s";
  document.getElementById("sakura-animation").appendChild(petal);
  setTimeout(() => petal.remove(), 10000);
}

function startSakura() {
  const interval = setInterval(createPetal, 300);
  setTimeout(() => clearInterval(interval), 6000); // dura 6s
}

function createConfetti() {
  const confetti = document.createElement("div");
  confetti.classList.add("confetti");

  // Colores patrios 🇲🇽
  const colors = ["#006847", "#ffffff", "#ce1126"];
  confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

  confetti.style.left = Math.random() * window.innerWidth + "px";
  confetti.style.animationDuration = (Math.random() * 2 + 3) + "s";
  document.getElementById("mexico-animation").appendChild(confetti);
  setTimeout(() => confetti.remove(), 5000);
}

function createFlag() {
  const flag = document.createElement("div");
  flag.classList.add("flag");
  flag.textContent = "🇲🇽";
  flag.style.left = Math.random() * window.innerWidth + "px";
  flag.style.animationDuration = "4s";
  document.getElementById("mexico-animation").appendChild(flag);
  setTimeout(() => flag.remove(), 4000);
}

function startMexicoAnimation() {
  const overlay = document.getElementById("mexico-animation");
  overlay.style.display = "block";

  // Generar confeti y banderas
  const confettiInterval = setInterval(createConfetti, 100);
  const flagInterval = setInterval(createFlag, 800);

  // Detener después de 5s
  setTimeout(() => {
    clearInterval(confettiInterval);
    clearInterval(flagInterval);
    setTimeout(() => overlay.style.display = "none", 3000);
  }, 5000);
}

function launchFireworkVideo() {
  const overlay = document.getElementById("fireworks-animation");

  // Crear un video nuevo
  const video = document.createElement("video");
  video.src = "fuegos.mp4"; // 🎆 tu archivo mp4
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.classList.add("firework-video");

  // Posición aleatoria en pantalla
  video.style.top = Math.random() * (window.innerHeight - 200) + "px";
  video.style.left = Math.random() * (window.innerWidth - 200) + "px";

  overlay.appendChild(video);

  // Eliminar cuando termine
  video.onended = () => video.remove();
}

function startFireworksVideo() {
  const overlay = document.getElementById("fireworks-animation");
  overlay.style.display = "block";

  // Generar explosiones cada medio segundo
  const interval = setInterval(launchFireworkVideo, 500);

  // Detener después de 6s
  setTimeout(() => {
    clearInterval(interval);
    setTimeout(() => { overlay.style.display = "none"; }, 2000); // esperar que acaben los videos
  }, 6000);
}


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove
} from "https://firebase.google.com/docs/web/setup#available-libraries";

const firebaseConfig = {
  apiKey: "AIzaSyAzoVzg0KbJ9m_NYiOwBpIQKN5hflmu1t4",
  authDomain: "karaoke-ua-inre.firebaseapp.com",
  databaseURL: "https://karaoke-ua-inre-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "karaoke-ua-inre",
  storageBucket: "karaoke-ua-inre.firebasestorage.app",
  messagingSenderId: "527250822840",
  appId: "1:527250822840:web:000d6ac7e80e7a2c3ac64d"
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Находим ваш селект <select id="u-songs">
const selectElement = document.getElementById("u-songs");

// Ссылка на вашу папку u-songs в базе
const uSongsRef = ref(db, 'u-songs');

// Загружаем песни в селект в реальном времени
onValue(uSongsRef, (snapshot) => {
  const songsData = snapshot.val();
  
  // Очищаем селект и ставим начальное значение
  selectElement.innerHTML = '<option value="">-- Выберите песню --</option>';

  if (songsData) {
    Object.keys(songsData).forEach((key) => {
      const songName = songsData[key]; // Получаем текст песни (например, "ADAM – Повільно")

      const option = document.createElement("option");
      option.value = songName; 
      option.textContent = songName; 

      selectElement.appendChild(option);
    });
  } else {
    selectElement.innerHTML = '<option value="">Песен нет в базе</option>';
  }
});
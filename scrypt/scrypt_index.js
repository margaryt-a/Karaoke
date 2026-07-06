
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove
} from "firebase/database";

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
// Находим все селекты
const selectU = document.getElementById("u-songs");
const selectR = document.getElementById("r-songs");
const selectE = document.getElementById("e-songs");
const selectM = document.getElementById("m-songs");

// Ссылки на папки в базе
const uSongsRef = ref(db, 'u-songs');
const rSongsRef = ref(db, 'r-songs');
const eSongsRef = ref(db, 'e-songs');
const mSongsRef = ref(db, 'm-songs');


const selects = [
    document.getElementById("u-songs"),
    document.getElementById("r-songs"),
    document.getElementById("e-songs"),
    document.getElementById("m-songs")
];

const SendBtn = document.getElementById("send_btn")

// Универсальная функция для заполнения любого селекта
function fillSelect(refPath, selectElement) {
    onValue(refPath, (snapshot) => {
        const data = snapshot.val();
        selectElement.innerHTML = '<option value="">Оберіть пісню</option>';
        if (data) {
            Object.keys(data).forEach((key) => {
                const songName = data[key];
                const option = document.createElement("option");
                option.value = songName;
                option.textContent = songName;
                selectElement.appendChild(option);
            });
        }
    });
}



function selectSong() {
  const uSong = document.getElementById("u-songs").value;
  const eSong = document.getElementById("e-songs").value;
  const rSong = document.getElementById("r-songs").value;
  const mSong = document.getElementById("m-songs").value;

  return uSong || rSong || eSong || mSong;
}
// проверка на корректность имени
function validateName(name){
  const regeln = /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ]+$/u;
  if (!regeln.test(name)) {
    return false;
  }
  else { return true; }
}

SendBtn.addEventListener("click", () => {
  const userName = document.getElementById("users_name").value;
  const fromList = selectSong();
  const inputSongs = document.getElementById("inputSong").value;
  const songName = fromList||inputSongs;

  if (!validateName(userName)){
    alert("imya soderjit zifry");
    return;
  }

  if (userName&&songName) {
    push(ref(db, "songsList"), {
      name: userName,
      song: songName
    }); 
    alert("Пісня додана до списку");
  } else { 
    alert("sorry ne poluchilos"); } 

});




selects.forEach(select => {
    select.addEventListener("change", () => {
        // Если выбрали в этом, очистить все остальные
        selects.forEach(other => {
            if (other !== select) other.value = "";
        });
    });
});

// Запускаем заполнение для каждого
fillSelect(uSongsRef, selectU);
fillSelect(rSongsRef, selectR);
fillSelect(eSongsRef, selectE);
fillSelect(mSongsRef, selectM);
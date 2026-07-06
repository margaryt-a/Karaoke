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

const queueContainer = document.getElementById("queue-container");

onValue(ref(db, 'songsList'), (snapshot) => {
    const data = snapshot.val();
    
    // 1. Очищаем старую таблицу
    queueContainer.innerHTML = ""; 

    if (data) {
        // 2. Превращаем объект из Firebase в массив, чтобы можно было перебирать
        let index = 1;
        Object.values(data).forEach((item) => {
            // Создаем строку
            const row = document.createElement("div");
            row.className = "row";
            
            // Вставляем данные: ${index++} автоматически делает 1, 2, 3...
            row.innerHTML = `
                <div class="col-left">${index++}</div>
                <div class="col-medium">${item.song}</div>
                <div class="col-rechts">${item.name}</div>
            `;
            
            queueContainer.appendChild(row);
        });
    } else {
        queueContainer.innerHTML = "<p>Очередь пока пуста</p>";
    }
});
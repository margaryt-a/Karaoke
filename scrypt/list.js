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
    queueContainer.innerHTML = ""; 

    if (data) {
        let index = 1;
        // Используем entries, чтобы получить ID (key) и сам объект (item)
        Object.entries(data).forEach(([id, item]) => {
            const row = document.createElement("div");
            row.className = "row";
            
            // Если статус "done" — показываем галочку, иначе пустоту
            const statusIcon = item.status === "done" ? "✅" : "❌";
            
            row.innerHTML = `
                <div class="col-left">${index++}</div>
                <div class="col-medium">${item.song}</div>
                <div class="col-rechts">${item.name}</div>
                <div class="col-status">${statusIcon}</div>
            `;
            // ВИЗУАЛ: Если в базе стоит priority: true — красим строку
                if (item.priority) {
                    row.style.backgroundColor = "#98e8aa"; // Зеленоватый фон
                    row.style.border = "1px solid #28a745"; // Зеленая рамка
                    row.style.color = "#000000";
                }
            queueContainer.appendChild(row);
        });
    } else {
        queueContainer.innerHTML = "<p>Очередь пока пуста</p>";
    }
});
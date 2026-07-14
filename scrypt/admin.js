// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  onValue,
  remove,
  update
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    // 1. Управление видимостью списка
    const editClick = document.getElementById("edit-click");
    const editList = document.getElementById("edit-list");
    if (editClick && editList) {
        editClick.addEventListener("click", () => {
            editList.hidden = !editList.hidden;
        });
    }

    // 2. Отображение очереди (songsList)
   // 2. Отображение очереди (songsList)
    const queueContainer = document.getElementById("queue-container");
    onValue(ref(db, 'songsList'), (snapshot) => {
        const data = snapshot.val();
        queueContainer.innerHTML = "";
        if (data) {
            let index = 1;
            Object.entries(data).forEach(([id, item]) => {
                const row = document.createElement("div");
                row.className = "queue-row";
                
                // Определяем иконку: если status == 'done', то галочка, иначе пустой квадрат
                const isDone = item.status === "done";
                const icon = isDone ? "✅" : "❌";

                row.innerHTML = `
                    <div class="col-left">${index++}</div>
                    <div class="col-medium">${item.song}</div>
                    <div class="col-rechts">${item.name}</div>
                    <div class="col-status" data-id="${id}" style="cursor:pointer; font-size: 20px;">${icon}</div>
                `;

                // Обработчик клика для смены статуса
                row.querySelector(".col-status").addEventListener("click", () => {
                    const newStatus = isDone ? "" : "done";
                    update(ref(db, `songsList/${id}`), { status: newStatus });
                });

                // НОВЫЙ ФУНКЦИОНАЛ: Двойной клик для смены цвета
                row.addEventListener("dblclick", () => {
                    // Инвертируем статус "вне очереди" в базе
                    const newPriority = !item.priority;
                    update(ref(db, `songsList/${id}`), { priority: newPriority });
                });

                // ВИЗУАЛ: Если в базе стоит priority: true — красим строку
                if (item.priority) {
                    row.style.backgroundColor = "#98e8aa"; // Зеленоватый фон
                    row.style.border = "1px solid #28a745"; // Зеленая рамка
                    row.style.color = "#000000";
                }

                queueContainer.appendChild(row);
            });
        }
    });

    // 3. Отображение библиотеки (все категории сразу)
    const editSongsContainer = document.getElementById("edit-songs");
    const categories = {
    "u-songs": "Укр",
    "r-songs": "Рос",
    "e-songs": "Англ",
    "m-songs": "Мульт"
};

// Используем один слушатель на корень базы для стабильности
onValue(ref(db), (snapshot) => {
    const allData = snapshot.val();
    editSongsContainer.innerHTML = "";

    // 1. Берем только ключи нашего объекта: ['u-songs', 'r-songs', ...]
    Object.keys(categories).forEach(cat => {
        const songs = allData ? allData[cat] : null; // Безопасная проверка данных
        
        if (songs) {
            Object.entries(songs).forEach(([id, songName]) => {
                const row = document.createElement("div");
                row.className = "edit-row";
                
                // 2. Подставляем "красивое" название из словаря categories[cat]
                row.innerHTML = `
                    <div class="col-types">${categories[cat]}</div>
                    <div class="col-song">${songName}</div>
                    <div class="col-add" data-id="${id}" data-cat="${cat}" style="cursor:pointer">🗑️</div>
                `;
                editSongsContainer.appendChild(row);
            });
        }
    });
});

    // 4. Удаление песни
    editSongsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("col-add")) {
            const id = e.target.getAttribute("data-id");
            const cat = e.target.getAttribute("data-cat");
            if (confirm("Видалити пісню?")) {
                remove(ref(db, `${cat}/${id}`));
            }
        }
    });

    // 5. Логика добавления новой песни
    const addBtn = document.getElementById("song-add");
    const addForm = document.getElementById("add-form");
    const saveBtn = document.getElementById("save-song-btn");

    addBtn.addEventListener("click", () => {
        addForm.hidden = !addForm.hidden;
    });

    saveBtn.addEventListener("click", () => {
        const type = document.getElementById("new-song-type").value;
        const name = document.getElementById("new-song-name").value.trim();

        if (!name) {
            alert("Введіть назву пісні!");
            return;
        }

        const categoryRef = ref(db, type);

        // Проверка на дубликат
        get(categoryRef).then((snapshot) => {
            const data = snapshot.val();
            let exists = false;
            if (data) {
                Object.values(data).forEach((songName) => {
                    if (songName.toLowerCase() === name.toLowerCase()) exists = true;
                });
            }

            if (exists) {
                alert("Така пісня вже є в цій категорії!");
            } else {
                push(categoryRef, name).then(() => {
                    alert("Пісню додано!");
                    document.getElementById("new-song-name").value = "";
                    addForm.hidden = true;
                });
            }
        });
    });

    const alllDelete = document.getElementById("all-delete");

    alllDelete.addEventListener("click", () => {

        if (confirm("Очищення співаючих та списку пісень")) {
        remove(ref(db, 'songsList'));
        remove(ref(db, 'users'));
        set(ref(db, 'system/lastReset'), Date.now());
        }
    });

});

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


// 1. Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. Константы элементов
const loginScreen = document.querySelector(".first_datei");
const mainScreen = document.querySelector(".main");
const loginBtn = document.getElementById("login-btn");
const SendBtn = document.getElementById("send_btn");

const selectU = document.getElementById("u-songs");
const selectR = document.getElementById("r-songs");
const selectE = document.getElementById("e-songs");
const selectM = document.getElementById("m-songs");
const inputSong = document.getElementById("inputSong");

const selects = [selectU, selectR, selectE, selectM, inputSong];

// В самом начале файла или там, где проверяешь логин
onValue(ref(db, 'system/lastReset'), (snapshot) => {
    const lastReset = snapshot.val();
    const storedReset = localStorage.getItem('lastReset');

    if (lastReset && lastReset != storedReset) {
        // Если база была очищена, а у нас в памяти старый статус — сбрасываемся
        localStorage.clear();
        localStorage.setItem('lastReset', lastReset); // Запоминаем новый номер сброса
        location.reload(); // Перезагружаем страницу, чтобы отправить пользователя на экран логина
    }
});

// 3. Логика Авторизации
window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
        loginScreen.style.display = "none";
        mainScreen.classList.remove("hidden");
        //document.getElementById("users_name").value = localStorage.getItem("userName") || "";
    }
});

loginBtn.addEventListener("click", () => {
    const codeInput = document.getElementById("input-code").value.trim();
    const nameInput = document.getElementById("input-name").value.trim();

    if (!codeInput || !nameInput) {
        alert("Введите код и имя");
        return;
    }

    // Получаем сразу весь корень базы, чтобы достать и коды, и adminName
    get(ref(db)).then((snapshot) => {
        if (!snapshot.exists()) {
            alert("Помилка системи: дані не знайдені!");
            return;
        }

        const data = snapshot.val();
        const dbAdminName = data.adminName; 
        const dbCodes = data.codes; // Объект с adminCode и userCode

        // 1. ПРОВЕРКА АДМИНА
        if (codeInput === dbCodes.adminCode && nameInput === dbAdminName) {
            localStorage.setItem("isAdmin", "true");
            window.open("admin.html", "_blank");

            return;
        }

        // 2. ПРОВЕРКА ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
        if (codeInput !== dbCodes.userCode) {
            alert("Неверный код доступа!");
            return;
        }

        if (!validateName(nameInput)) {
            alert("Имя может содержать только буквы!");
            return;
        }

        // 3. ПРОВЕРКА УНИКАЛЬНОСТИ ИМЕНИ
        const usersRef = ref(db, "users");
        get(usersRef).then((userSnapshot) => {
            const users = userSnapshot.val();
            let nameTaken = false;

            if (users) {
                Object.values(users).forEach(user => {
                    if (user.name.toLowerCase() === nameInput.toLowerCase()) {
                        nameTaken = true;
                    }
                });
            }

            if (nameTaken) {
                alert("Это имя было уже зарегистрировано, попрбуйте другое!");
            } else {
                push(usersRef, { name: nameInput }).then(() => {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", nameInput);
                    
                    loginScreen.style.display = "none";
                    mainScreen.classList.remove("hidden");
                    console.log("Регестрация прошла успешно, хорошего вечера!");
                }).catch((error) => {
                    alert("Ошибка регистрации: " + error.message);
                });
            }
        });
    });
});

// 4. Логика Очереди и Отправки
SendBtn.addEventListener("click", () => {
    // БЕРЕМ ИМЯ ИЗ ПАМЯТИ (localStorage), а не из HTML-инпута
    const userName = localStorage.getItem("userName"); 
    
    // Если по какой-то причине имени нет (например, стерли кеш), просим зайти заново
    if (!userName) {
        alert("Помилка: Ви не авторизовані. Будь ласка, оновіть сторінку.");
        return;
    }

    const fromList = selectSong();
    const inputSongs = document.getElementById("inputSong").value;
    const songName = fromList || inputSongs;

    if (!songName) {
        alert("Выберите или запишите песню!");
        return;
    }

    const songsRef = ref(db, "songsList");
    
    get(songsRef).then((snapshot) => {
        const data = snapshot.val();
        let alreadyInQueue = false;

        if (data) {
            Object.values(data).forEach((item) => {
                // Проверяем, есть ли уже этот человек с активной песней
                if (item.name === userName && item.status === "pending") {
                    alreadyInQueue = true;
                }
            });
        }

        if (alreadyInQueue) {
            alert("Вы уже добавлены в очередь, дождитесь своего исполнения.");
        } else {

              push(songsRef, {
                  name: userName,
                  song: songName,
                  status: "pending"
              }).then(() => {
                  alert("Песня добавлена в список!");
              }).catch((error) => {
                  console.error("ОШИБКА отправки:", error); // Если ошибка здесь — база нас не пускает!
                  alert("Помилка бази даних: " + error.message);
              });
        }
    });
});

// 5. Вспомогательные функции
function validateName(name) {
    const regeln = /^[ a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ]+$/u;
    return regeln.test(name);
}

function selectSong() {
    return selectU.value || selectR.value || selectE.value || selectM.value;
}

function fillSelect(refPath, selectElement) {
    onValue(refPath, (snapshot) => {
        const data = snapshot.val();
        selectElement.innerHTML = '<option value="">Выберите песню</option>';
        if (data) {
            Object.keys(data).forEach((key) => {
                const option = document.createElement("option");
                option.value = data[key];
                option.textContent = data[key];
                selectElement.appendChild(option);
            });
        }
    });
}

// 6. Инициализация селектов
selects.forEach(select => {
    select.addEventListener("change", () => {
        selects.forEach(other => {
            if (other !== select) other.value = "";
        });
    });
});

fillSelect(ref(db, 'u-songs'), selectU);
fillSelect(ref(db, 'r-songs'), selectR);
fillSelect(ref(db, 'e-songs'), selectE);
fillSelect(ref(db, 'm-songs'), selectM);
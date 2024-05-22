let mainContainer = document.getElementById("main-container");

let contentContainer = document.getElementById("content-container");
let bookContainer = document.querySelector(".book-container");

let logOutBtn = document.getElementById("log-out-btn");
let loggedInContainer = document.querySelector("#loggedIn-container");
let welcomeH2 = document.querySelector("#welcome-h2");

let mainPageBody = document.querySelector("body");
let sortingDropdown = document.getElementById("sorting-dropdown");
let selectedSort = sortingDropdown.value;
let showSortingBtn = document.getElementById("show-sorting-btn");

let unSaveBookBtn = document.getElementById("un-save-btn");
let homeBtn = document.getElementById("home-btn");

let loggedInStatus = () => {
    let user = JSON.parse(sessionStorage.getItem("user")); 

    if (sessionStorage.getItem("token")) { 
        
        loggedInContainer.classList.remove("hidden");
       // welcomeH2.innerHTML+=`<h2> ${user.username}!</h2>`

         bookContainer.innerHTML = "";
        
         getSavedBooks();
     }

};

let getSavedBooks = async () => {
    try {
        let response = await axios.get("http://localhost:1337/api/users?populate=deep,3", {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        bookContainer.innerHTML = "";

        let user = response.data.find(user => user.id === JSON.parse(sessionStorage.getItem("user")).id);

        user.books.forEach(book => {
            let bookCard = document.createElement("div");
            bookCard.classList.add("book-card");

            bookCard.innerHTML = `
                <img src="http://localhost:1337${book.cover.url}"/>
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Language: ${book.language}</p>
                <p>Published: ${book.releaseDate}</p>
                <p>Pages: ${book.pages}</p>
                <button class="un-save-btn" data-book-id="${book.id}">Delete</button>
            `;

            bookContainer.appendChild(bookCard);
        });

        document.querySelectorAll('.un-save-btn').forEach(button => {
            button.addEventListener('click', unSaveBook);
        });

    } catch (error) {
        console.error("Error fetching saved books:", error);
    }
};

let unSaveBook = async (event) => {
    let bookId = event.target.getAttribute('data-book-id');
    let userId = JSON.parse(sessionStorage.getItem("user")).id;
    
    try {
        let userResponse = await axios.get(`http://localhost:1337/api/users/${userId}?populate=deep,3`, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        let userBooks = userResponse.data.books || [];
        
        userBooks = userBooks.filter(book => book.id != bookId);

        //uppdaterar användarens boklista
        await axios.put(`http://localhost:1337/api/users/${userId}`, {
            books: userBooks
        }, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        });

        //uppdaterar DOM
        event.target.parentElement.remove();


    } catch (error) {
        console.error("Error unsaving book:", error);
        alert("Failed to unsave the book. Please try again.");
    }
};


let logOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    loggedInContainer.classList.add("hidden");
    welcomeH2.innerHTML = "";

    //omdirigerar användaren till startsidan
    window.location.href = 'index.html';
};

logOutBtn.addEventListener("click", logOut);

homeBtn.addEventListener("click", () => {
    window.location.href = 'index.html';
});

let renderColorTheme = async () => {
    try {
        let response = await axios.get("http://localhost:1337/api/color-theme");
        let theme = response.data.data.attributes.theme;

        if (theme === "spring") {
           mainPageBody.classList.add("theme-spring");
        } else if(theme === "summer") {
            mainPageBody.classList.add("theme-summer");
        } else if(theme === "autumn") {
            mainPageBody.classList.add("theme-autumn");
        } else if (theme === "winter") {
            mainPageBody.classList.add("theme-winter");
        } else {
            console.error("Unknown theme:", theme);
        };
        

    } catch (error) {
        console.error("Error fetching color theme:", error);
    }
};

//sorteringsfunktion
let sortBooks = (sortBy) => {
    let books = Array.from(bookContainer.querySelectorAll('.book-card'));
    
    books.sort((a, b) => {
        let titleA = a.querySelector('h3').textContent.toLowerCase();
        let titleB = b.querySelector('h3').textContent.toLowerCase();

        let authorA = a.querySelector('p:nth-of-type(1)').textContent.split(":")[1].trim().toLowerCase();
        let authorB = b.querySelector('p:nth-of-type(1)').textContent.split(":")[1].trim().toLowerCase();

        if (sortBy === 'title') {
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
            return 0;
        } else if (sortBy === 'author') {
            if (authorA < authorB) return -1;
            if (authorA > authorB) return 1;
            return 0;
        }
    });

    bookContainer.innerHTML = '';

    //lägger till de sorterade böckerna i DOM
    books.forEach(book => {
        bookContainer.appendChild(book);
    });
};

showSortingBtn.addEventListener('click', () => {
    //hämtar det valda sorteringsalternativet från dropdown-menyn
    let selectedSort = sortingDropdown.value;
    //anropar sortBooks-funktionen med det aktuella sorteringsvalet
    sortBooks(selectedSort);
});

window.addEventListener("load", loggedInStatus);
window.addEventListener("load", renderColorTheme);



getSavedBooks();
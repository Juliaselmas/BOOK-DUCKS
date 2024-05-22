///api/auth/local/register
///api/color-theme
//http://localhost:1337/api/books
//http://localhost:1337//api/users

let mainContainer = document.getElementById("main-container");
let mainPageBody = document.querySelector("body");

let loginBtn = document.getElementById("login-btn");
let loginUsername = document.querySelector("#login-user");
let loginPassword = document.querySelector("#login-password");

let registerBtn = document.getElementById("register-btn");
let registerUser = document.querySelector("#register-username");
let registerEmail = document.querySelector("#register-email");
let registerPassword = document.querySelector("#register-password");

let contentContainer = document.getElementById("content-container");
let bookContainer = document.querySelector(".book-container");

let logOutBtn = document.getElementById("log-out-btn");
let loggedInContainer = document.querySelector("#loggedIn-container");
let loginContainer = document.querySelector("#login-container");
let welcomeH2 = document.querySelector("#welcome-h2");

let saveBookBtn = document.getElementById("save-btn");



let newUser = async () => {
    console.log("User registered!");

    //axios
    let response = await axios.post("http://localhost:1337/api/auth/local/register", 
    {
        username: registerUser.value,
        email: registerEmail.value,
        password: registerPassword.value
    });

    registerBtn.innerText = "Registered!";
    registerUser.value = "";
    registerEmail.value = "";
    registerPassword.value = "";

};

registerBtn.addEventListener("click", newUser);

let logIn = async () => {
    try {
        let response = await axios.post("http://localhost:1337/api/auth/local", {
            identifier: loginUsername.value,
            password: loginPassword.value
        });
        
        let user = response.data.user;

        sessionStorage.setItem("token", response.data.jwt);
        sessionStorage.setItem("user", JSON.stringify(user)); 

        loggedInStatus(user);
        loginUsername.value = "";
        loginPassword.value = "";
        loginContainer.classList.add("hidden");

    } catch (error) {
        console.error("Error logging in:", error);
        alert("Unable to log in! Invalid usernamer or password. Please try again or register a new user.");
    }
};

let loggedInStatus = () => {
    let user = JSON.parse(sessionStorage.getItem("user")); 

    if (sessionStorage.getItem("token")) { 
        loginContainer.classList.add("hidden");
        loggedInContainer.classList.remove("hidden");
        welcomeH2.innerHTML+=`<h2>Welcome, <br>${user.username}!</h2>`

         bookContainer.innerHTML = "";
        
         getBooksLoggedIn();
     }

};

loginBtn.addEventListener("click", logIn);


let getBooks = async () => {
    let response = await axios.get("http://localhost:1337/api/books?populate=*"
    );

    bookContainer.innerHTML = "";

    response.data.data.forEach(book => {
        let bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        bookCard.innerHTML = `
        <img src="http://localhost:1337${book.attributes.cover.data?.attributes.url}"/>
        <h3>${book.attributes.title}</h3>
        <p>Author: ${book.attributes.author}</p>
        <p>Language: ${book.attributes.language}</p>
        <p>Published: ${book.attributes.releaseDate}</p>
        <p>Pages: ${book.attributes.pages}</p>
        <button id="save-btn" class="hidden"><i class="fa-solid fa-heart"></i></button>
        `;
        
        bookContainer.appendChild(bookCard);
    });

};

let getBooksLoggedIn = async () => {
    let response = await axios.get("http://localhost:1337/api/books?populate=*"
    /* config: Behövs om böcker enbart ska visas i inloggat läge. 
    ,{
        headers:{
            Authorization:`Bearer ${sessionStorage.getItem("token")}`
        }
    }*/
    );
    
    bookContainer.innerHTML = "";

    response.data.data.forEach(book => {
        let bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        bookCard.innerHTML = `
        <img src="http://localhost:1337${book.attributes.cover.data?.attributes.url}"/>
        <h3>${book.attributes.title}</h3>
        <p>Author: ${book.attributes.author}</p>
        <p>Language: ${book.attributes.language}</p>
        <p>Published: ${book.attributes.releaseDate}</p>
        <p>Pages: ${book.attributes.pages}</p>
        <button class="save-btn" data-book-id="${book.id}">Save for Later!</button>
        `;

        bookContainer.appendChild(bookCard);
    });

    // Lägg till event listeners för alla "Save for Later" knappar
    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', saveBook);
    });
};


let saveBook = async (event) => {
        let bookId = event.target.getAttribute('data-book-id');
        let userId = JSON.parse(sessionStorage.getItem("user")).id;
        
        try {
            // Först hämta användarens nuvarande boklista
            let userResponse = await axios.get(`http://localhost:1337/api/users/${userId}?populate=deep,3`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });
    
            let userBooks = userResponse.data.books || [];
            
            // Lägg till den nya boken i listan
            userBooks.push(bookId);
    
            // Uppdatera användarens boklista
            await axios.put(`http://localhost:1337/api/users/${userId}`, {
                books: userBooks
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });
    
            alert("Book saved for later!");
        } catch (error) {
            console.error("Error saving book:", error);
            alert("Failed to save the book. Please try again.");
        }
};



let logOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    loginContainer.classList.remove("hidden");
    loggedInContainer.classList.add("hidden");
    
    welcomeH2.innerHTML = "";

    registerUser.value = "";
    registerEmail.value = "";
    registerPassword.value = "";

    getBooks();

};

logOutBtn.addEventListener("click", logOut);


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


window.addEventListener("load", loggedInStatus);
window.addEventListener("load", renderColorTheme);


getBooks();


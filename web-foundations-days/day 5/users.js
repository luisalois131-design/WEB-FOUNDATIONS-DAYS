
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];

// Fetch users from the API.
async function loadUsers() {
    loadButton.disabled = true;
    statusMessage.textContent = "Loading users...";
    usersList.replaceChildren();

    try {
        const response = await fetch(API_URL);

        // fetch() does not reject automatically for HTTP errors.
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        users = data;

        renderUsers(users);

        statusMessage.textContent =
            `Successfully loaded ${users.length} users.`;
    } catch (error) {
        users = [];
        usersList.replaceChildren();

        statusMessage.textContent =
            "Failed to load users. Please check your connection and try again.";

        console.error("Error loading users:", error);
    } finally {
        loadButton.disabled = false;
    }
}

// Display any array of users.
function renderUsers(list) {
    usersList.replaceChildren();

    if (list.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No users match your filter.";
        usersList.appendChild(item);
        return;
    }

    list.forEach(function (user) {
        const item = document.createElement("li");
        const name = document.createElement("h3");
        const email = document.createElement("p");
        const city = document.createElement("p");
        const company = document.createElement("p");

        name.textContent = user.name;
        email.textContent = `Email: ${user.email}`;
        city.textContent = `City: ${user.address.city}`;
        company.textContent = `Company: ${user.company.name}`;

        item.appendChild(name);
        item.appendChild(email);
        item.appendChild(city);
        item.appendChild(company);

        usersList.appendChild(item);
    });
}

// Load users when the button is clicked.
loadButton.addEventListener("click", loadUsers);

// Filter the stored users without making another API request.
filterInput.addEventListener("input", function () {
    const searchText = filterInput.value.trim().toLowerCase();

    const filteredUsers = users.filter(function (user) {
        return user.name.toLowerCase().includes(searchText);
    });

    renderUsers(filteredUsers);

    if (filteredUsers.length === 0) {
        statusMessage.textContent = "No users match your filter.";
    } else {
        statusMessage.textContent =
            `Showing ${filteredUsers.length} of ${users.length} users.`;
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const dropdownMenu = document.getElementById("your-dropdown-id"); // Change to correct ID
    
    if (!dropdownMenu) {
        console.error("Dropdown menu not found!");
        return; // Stop execution to prevent errors
    }

    fetch("https://expertalent7.github.io/Structure_V2/data/drawings_data.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(drawing => {
                let option = document.createElement("option");
                option.value = drawing.id;
                option.textContent = drawing.name;
                dropdownMenu.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching drawings data:", error));
});

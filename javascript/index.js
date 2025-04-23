document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const allButtons = document.querySelectorAll(".button-2");

    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            button.style.display = text.includes(searchTerm) ? "" : "none";
        });
    });
});

document.addEventListener("DOMContentLoaded", initializeFormPage);

function initializeFormPage() {
    initializeAppData();
    bindPostForm();
}

function bindPostForm() {
    var form = document.getElementById("post-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", handlePostFormSubmit);
}

function handlePostFormSubmit(event) {
    event.preventDefault();

    var authorInput = document.getElementById("author");
    var contentInput = document.getElementById("content");
    var imageInput = document.getElementById("image");

    var author = authorInput.value.trim();
    var content = contentInput.value.trim();
    var image = imageInput.value.trim();

    if (!author) {
        alert("Введите имя автора.");
        authorInput.focus();
        return;
    }

    if (!content) {
        alert("Введите текст поста.");
        contentInput.focus();
        return;
    }

    if (!image) {
        alert("Введите ссылку на изображение.");
        imageInput.focus();
        return;
    }

    addPost({
        author: author,
        content: content,
        image: image
    });

    window.location.href = "index.html";
}

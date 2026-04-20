if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", preparePageAnimation);
} else {
    preparePageAnimation();
}

function preparePageAnimation() {
    window.setTimeout(function () {
        document.body.classList.add("page-ready");
    }, 30);
}

function formatDate(dateString) {
    var date = new Date(dateString);

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getInitials(name) {
    return String(name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
            return part.charAt(0).toUpperCase();
        })
        .join("") || "IB";
}

function normalizeLink(url) {
    var value = String(url || "").trim();

    if (!value) {
        return "#";
    }

    if (/^(https?:|mailto:|tel:|#|\/)/i.test(value)) {
        return value;
    }

    return "https://" + value;
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function createElement(tagName, className, text) {
    var element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (typeof text === "string") {
        element.textContent = text;
    }

    return element;
}

function appendChildren(parent, children) {
    children.forEach(function (child) {
        if (child) {
            parent.appendChild(child);
        }
    });

    return parent;
}

function setMultilineText(element, value) {
    element.textContent = String(value || "");
}

function createAdBadge() {
    return createElement("span", "ad-marker", "Реклама");
}

function createAdButton(text, link) {
    var button = createElement("a", "ad-button", text || "Перейти");
    button.href = normalizeLink(link);
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    return button;
}

function createImageBox(wrapperClass, imageClass, src, alt) {
    var wrapper = createElement("div", wrapperClass);
    var image = document.createElement("img");

    image.className = imageClass || "";
    image.src = src;
    image.alt = alt;

    wrapper.appendChild(image);

    return wrapper;
}

document.addEventListener("DOMContentLoaded", initializeAdsPage);

function initializeAdsPage() {
    initializeAppData();
    fillAdForms();
    bindAdForms();
    renderAdPreviews();
}

function bindAdForms() {
    var sideForm = document.getElementById("side-ad-form");
    var feedForm = document.getElementById("feed-ad-form");
    var resetButton = document.getElementById("reset-ads");

    if (sideForm) {
        sideForm.addEventListener("submit", handleSideAdSubmit);
    }

    if (feedForm) {
        feedForm.addEventListener("submit", handleFeedAdSubmit);
    }

    if (resetButton) {
        resetButton.addEventListener("click", handleResetAds);
    }
}

function fillAdForms() {
    var ads = getAdsData();

    fillFormByPrefix("side", ads.sideAd);
    fillFormByPrefix("feed", ads.feedAd);
}

function fillFormByPrefix(prefix, data) {
    setInputValue(prefix + "-title", data.title);
    setInputValue(prefix + "-content", data.content);
    setInputValue(prefix + "-image", data.image);
    setInputValue(prefix + "-button", data.buttonText);
    setInputValue(prefix + "-link", data.link);
}

function setInputValue(id, value) {
    var element = document.getElementById(id);

    if (element) {
        element.value = value || "";
    }
}

function getInputValue(id) {
    var element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function collectAdData(prefix) {
    return {
        title: getInputValue(prefix + "-title"),
        content: getInputValue(prefix + "-content"),
        image: getInputValue(prefix + "-image"),
        buttonText: getInputValue(prefix + "-button"),
        link: getInputValue(prefix + "-link")
    };
}

function handleSideAdSubmit(event) {
    event.preventDefault();
    updateSideAd(collectAdData("side"));
    renderAdPreviews();
    setStatus("Правая реклама сохранена.");
}

function handleFeedAdSubmit(event) {
    event.preventDefault();
    updateFeedAd(collectAdData("feed"));
    renderAdPreviews();
    setStatus("Рекламный пост сохранен.");
}

function handleResetAds() {
    resetAdsData();
    fillAdForms();
    renderAdPreviews();
    setStatus("Стандартная реклама восстановлена.");
}

function renderAdPreviews() {
    var ads = getAdsData();
    var sidePreview = document.getElementById("side-ad-preview");
    var feedPreview = document.getElementById("feed-ad-preview");

    if (sidePreview) {
        clearElement(sidePreview);
        sidePreview.appendChild(createSideAdPreviewCard(ads.sideAd));
    }

    if (feedPreview) {
        clearElement(feedPreview);
        feedPreview.appendChild(createFeedAdPreviewCard(ads.feedAd));
    }
}

function createSideAdPreviewCard(ad) {
    var wrapper = createElement("div", "side-ad-card");
    var header = createElement("div", "ad-header");
    var titleLabel = createElement("div", "widget-title", "Рекомендация");
    var imageBox = createImageBox("ad-image", "", ad.image, "Предпросмотр правой рекламы");
    var title = createElement("h3", "ad-title", ad.title);
    var text = createElement("p", "ad-text text-block", "");
    var button = createAdButton(ad.buttonText, ad.link);

    setMultilineText(text, ad.content);
    appendChildren(header, [titleLabel, createAdBadge()]);
    appendChildren(wrapper, [header, imageBox, title, text, button]);

    return wrapper;
}

function createFeedAdPreviewCard(ad) {
    var article = createElement("article", "panel post-card ad-card feed-ad-card");
    var header = createElement("div", "ad-header");
    var title = createElement("h2", "ad-title", ad.title);
    var text = createElement("p", "ad-text text-block", "");
    var imageBox = createImageBox("post-image", "", ad.image, "Предпросмотр рекламного поста");
    var button = createAdButton(ad.buttonText, ad.link);

    setMultilineText(text, ad.content);
    header.appendChild(createAdBadge());
    appendChildren(article, [header, title, text, imageBox, button]);

    return article;
}

function setStatus(message) {
    var status = document.getElementById("ads-status");

    if (status) {
        status.textContent = message;
    }
}

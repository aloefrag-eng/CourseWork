var pageState = {
    openComments: {},
    searchQuery: ""
};

document.addEventListener("DOMContentLoaded", initializeMainPage);

function initializeMainPage() {
    initializeAppData();
    bindSearch();
    bindFeedEvents();
    renderSideAd();
    renderFeed();
}

function bindSearch() {
    var searchInput = document.getElementById("post-search");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", handleSearchInput);
}

function handleSearchInput(event) {
    pageState.searchQuery = event.target.value.trim().toLowerCase();
    renderFeed();
}

function bindFeedEvents() {
    var feed = document.getElementById("feed");

    if (!feed) {
        return;
    }

    feed.addEventListener("click", handleFeedClick);
    feed.addEventListener("keydown", handleFeedKeydown);
}

function handleFeedClick(event) {
    var actionElement = event.target.closest("[data-action]");

    if (!actionElement) {
        return;
    }

    var action = actionElement.getAttribute("data-action");
    var postCard = actionElement.closest("[data-post-id]");
    var postId = postCard ? postCard.getAttribute("data-post-id") : "";

    if (!postId && action !== "toggle-comments") {
        return;
    }

    if (action === "like") {
        updateLikeState(postId, postCard);
        return;
    }

    if (action === "toggle-comments") {
        toggleCommentsPanel(postId, postCard);
        return;
    }

    if (action === "delete") {
        deletePostCard(postId, postCard);
        return;
    }

    if (action === "add-comment") {
        submitComment(postId, postCard);
    }
}

function handleFeedKeydown(event) {
    if (event.key !== "Enter" || !event.target.classList.contains("comment-input")) {
        return;
    }

    var postCard = event.target.closest("[data-post-id]");

    if (!postCard) {
        return;
    }

    event.preventDefault();
    submitComment(postCard.getAttribute("data-post-id"), postCard);
}

function updateLikeState(postId, postCard) {
    var updatedPost = toggleLikeById(postId);

    if (!updatedPost || !postCard) {
        return;
    }

    updatePostCardState(postCard, updatedPost);
}

function toggleCommentsPanel(postId, postCard) {
    var commentsPanel = postCard ? postCard.querySelector(".comments-panel") : null;
    var toggleButton = postCard ? postCard.querySelector(".comment-toggle") : null;

    if (!commentsPanel || !toggleButton) {
        return;
    }

    pageState.openComments[postId] = !pageState.openComments[postId];
    commentsPanel.classList.toggle("open", pageState.openComments[postId]);
    toggleButton.classList.toggle("open", pageState.openComments[postId]);
}

function deletePostCard(postId, postCard) {
    if (!confirm("Удалить этот пост?")) {
        return;
    }

    deletePostById(postId);
    delete pageState.openComments[postId];

    if (postCard) {
        postCard.remove();
    }

    if (pageState.searchQuery) {
        renderFeed();
        return;
    }

    ensureFeedState();
}

function submitComment(postId, postCard) {
    var input = postCard ? postCard.querySelector(".comment-input") : null;

    if (!input) {
        return;
    }

    var commentText = input.value.trim();

    if (!commentText) {
        alert("Введите комментарий.");
        return;
    }

    var updatedPost = addCommentById(postId, commentText);

    if (!updatedPost) {
        return;
    }

    input.value = "";
    pageState.openComments[postId] = true;
    updatePostCardState(postCard, updatedPost);
}

function renderFeed() {
    var feed = document.getElementById("feed");
    var posts = getFilteredPosts();
    var feedAd = getAdsData().feedAd;
    var adInsertIndex = posts.length > 1 ? 1 : 0;

    if (!feed) {
        return;
    }

    clearElement(feed);
    updateSearchStatus(posts.length);

    if (!posts.length) {
        feed.appendChild(createEmptyStateElement(pageState.searchQuery));
        return;
    }

    posts.forEach(function (post, index) {
        feed.appendChild(createPostCard(post));

        if (index === adInsertIndex - 1) {
            feed.appendChild(createFeedAdCard(feedAd));
        }
    });

    if (posts.length === 1) {
        feed.appendChild(createFeedAdCard(feedAd));
    }
}

function renderSideAd() {
    var container = document.getElementById("side-ad");
    var ad = getAdsData().sideAd;

    if (!container) {
        return;
    }

    clearElement(container);
    container.appendChild(createSideAdCard(ad));
}

function getFilteredPosts() {
    var posts = getPosts();

    if (!pageState.searchQuery) {
        return posts;
    }

    return posts.filter(function (post) {
        var haystack = [post.author, post.content].join(" ").toLowerCase();
        return haystack.indexOf(pageState.searchQuery) !== -1;
    });
}

function updateSearchStatus(count) {
    var status = document.getElementById("search-status");

    if (!status) {
        return;
    }

    if (!pageState.searchQuery) {
        status.textContent = "Показаны все публикации";
        return;
    }

    status.textContent = "Найдено публикаций: " + count;
}

function ensureFeedState() {
    var feed = document.getElementById("feed");
    var postCards = feed ? feed.querySelectorAll(".post-card:not(.ad-card)") : [];

    if (!postCards.length) {
        renderFeed();
    }
}

function updatePostCardState(postCard, post) {
    if (!postCard || !post) {
        return;
    }

    updateLikeControls(postCard, post);
    updateCommentControls(postCard, post);
}

function updateLikeControls(postCard, post) {
    var likeButton = postCard.querySelector(".like-btn");
    var likeCount = postCard.querySelector(".like-count");

    if (!likeButton || !likeCount) {
        return;
    }

    likeButton.classList.toggle("liked", post.liked);
    likeCount.textContent = String(post.likes);
}

function updateCommentControls(postCard, post) {
    var commentsPanel = postCard.querySelector(".comments-panel");
    var commentsList = postCard.querySelector(".comments-list");
    var commentsCount = postCard.querySelector(".comments-count");
    var toggleButton = postCard.querySelector(".comment-toggle");

    if (!commentsPanel || !commentsList || !commentsCount || !toggleButton) {
        return;
    }

    commentsCount.textContent = String(post.comments.length);
    clearElement(commentsList);
    appendComments(commentsList, post.comments);
    commentsPanel.classList.toggle("open", true);
    toggleButton.classList.toggle("open", true);
}

function createPostCard(post) {
    var article = createElement("article", "panel post-card");
    article.setAttribute("data-post-id", post.id);

    var header = createPostHeader(post);
    var text = createElement("div", "post-text text-block");
    setMultilineText(text, post.content);

    var imageBox = createImageBox("post-image", "", post.image, "Изображение поста");
    var actions = createPostActions(post);
    var commentsPanel = createCommentsPanel(post);

    appendChildren(article, [header, text, imageBox, actions, commentsPanel]);

    return article;
}

function createPostHeader(post) {
    var header = createElement("div", "post-header");
    var authorBox = createElement("div", "post-author-box");
    var avatar = createElement("div", "avatar", getInitials(post.author));
    var meta = createElement("div", "post-meta");
    var author = createElement("h2", "post-author", post.author);
    var date = createElement("p", "post-date", formatDate(post.date));
    var deleteButton = createElement("button", "action-btn delete-btn", "Удалить");

    deleteButton.type = "button";
    deleteButton.setAttribute("data-action", "delete");

    appendChildren(meta, [author, date]);
    appendChildren(authorBox, [avatar, meta]);
    header.appendChild(authorBox);
    header.appendChild(deleteButton);

    return header;
}

function createPostActions(post) {
    var actions = createElement("div", "post-actions");
    var likeButton = createElement("button", "action-btn like-btn", "");
    var likeIcon = createElement("span", "action-icon", "❤");
    var likeLabel = createElement("span", "", "Нравится");
    var likeCount = createElement("span", "action-count like-count", String(post.likes));
    var commentButton = createElement("button", "action-btn comment-toggle", "");
    var commentLabel = createElement("span", "", "Комментарии");
    var commentCount = createElement("span", "action-count comments-count", String(post.comments.length));

    likeButton.type = "button";
    likeButton.setAttribute("data-action", "like");
    likeButton.classList.toggle("liked", post.liked);
    appendChildren(likeButton, [likeIcon, likeLabel, likeCount]);

    commentButton.type = "button";
    commentButton.setAttribute("data-action", "toggle-comments");
    commentButton.classList.toggle("open", Boolean(pageState.openComments[post.id]));
    appendChildren(commentButton, [commentLabel, commentCount]);

    appendChildren(actions, [likeButton, commentButton]);

    return actions;
}

function createCommentsPanel(post) {
    var panel = createElement("div", "comments-panel");
    var list = createElement("div", "comments-list");
    var form = createElement("div", "comment-form");
    var input = document.createElement("input");
    var button = createElement("button", "small-btn", "Отправить");

    panel.classList.toggle("open", Boolean(pageState.openComments[post.id]));

    input.className = "comment-input";
    input.type = "text";
    input.placeholder = "Написать комментарий...";

    button.type = "button";
    button.setAttribute("data-action", "add-comment");

    appendComments(list, post.comments);
    appendChildren(form, [input, button]);
    appendChildren(panel, [list, form]);

    return panel;
}

function appendComments(container, comments) {
    if (!comments.length) {
        container.appendChild(createElement("div", "comment-empty", "Комментариев пока нет."));
        return;
    }

    comments.forEach(function (comment) {
        container.appendChild(createCommentItem(comment));
    });
}

function createCommentItem(comment) {
    var item = createElement("div", "comment-item");
    var author = createElement("div", "comment-author", comment.author);
    var date = createElement("span", "comment-date", formatDate(comment.date));
    var text = createElement("div", "comment-text text-block");

    setMultilineText(text, comment.text);
    appendChildren(item, [author, date, text]);

    return item;
}

function createFeedAdCard(ad) {
    var article = createElement("article", "panel post-card ad-card feed-ad-card");
    var header = createElement("div", "ad-header");
    var title = createElement("h2", "ad-title", ad.title);
    var text = createElement("p", "ad-text text-block", "");
    var imageBox = createImageBox("post-image", "", ad.image, "Рекламный пост");
    var button = createAdButton(ad.buttonText, ad.link);

    setMultilineText(text, ad.content);
    header.appendChild(createAdBadge());
    appendChildren(article, [header, title, text, imageBox, button]);

    return article;
}

function createSideAdCard(ad) {
    var wrapper = createElement("div", "side-ad-card");
    var header = createElement("div", "ad-header");
    var titleLabel = createElement("div", "widget-title", "Рекомендация");
    var imageBox = createImageBox("ad-image", "", ad.image, "Правая реклама");
    var title = createElement("h3", "ad-title", ad.title);
    var text = createElement("p", "ad-text text-block", "");
    var button = createAdButton(ad.buttonText, ad.link);

    setMultilineText(text, ad.content);
    appendChildren(header, [titleLabel, createAdBadge()]);
    appendChildren(wrapper, [header, imageBox, title, text, button]);

    return wrapper;
}

function createEmptyStateElement(hasSearch) {
    var wrapper = createElement("div", "panel empty-state");
    var title = createElement("h2", "empty-state-title", hasSearch ? "Ничего не найдено" : "Лента пока пустая");
    var text = createElement(
        "p",
        "empty-state-text",
        hasSearch ? "Попробуйте изменить запрос поиска по публикациям." : "Создайте новый пост"
    );

    wrapper.appendChild(title);
    wrapper.appendChild(text);

    if (!hasSearch) {
        wrapper.appendChild(createEmptyStateButton());
    }

    return wrapper;
}

function createEmptyStateButton() {
    var button = createElement("a", "primary-btn", "Создать пост");
    button.href = "form.html";
    return button;
}

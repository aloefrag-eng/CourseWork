var STORAGE_KEYS = {
    posts: "miniSocialPosts",
    ads: "miniSocialAds"
};

function initializeAppData() {
    if (!localStorage.getItem(STORAGE_KEYS.posts)) {
        savePosts(getDefaultPosts());
    }

    if (!localStorage.getItem(STORAGE_KEYS.ads)) {
        saveAdsData(getDefaultAds());
    }
}

function getPosts() {
    initializeAppData();

    try {
        var posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.posts));
        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        return [];
    }
}

function getPostById(postId) {
    var posts = getPosts();

    return posts.find(function (post) {
        return post.id === postId;
    }) || null;
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

function addPost(data) {
    var posts = getPosts();

    var newPost = {
        id: createStorageId("post"),
        author: data.author,
        content: data.content,
        image: data.image,
        date: new Date().toISOString(),
        likes: 0,
        liked: false,
        comments: []
    };

    posts.unshift(newPost);
    savePosts(posts);

    return newPost;
}

function deletePostById(postId) {
    var posts = getPosts().filter(function (post) {
        return post.id !== postId;
    });

    savePosts(posts);
}

function toggleLikeById(postId) {
    var updatedPost = null;
    var posts = getPosts().map(function (post) {
        if (post.id !== postId) {
            return post;
        }

        var nextPost = Object.assign({}, post);
        nextPost.liked = !nextPost.liked;
        nextPost.likes = nextPost.liked ? nextPost.likes + 1 : Math.max(0, nextPost.likes - 1);
        updatedPost = nextPost;

        return nextPost;
    });

    savePosts(posts);

    return updatedPost;
}

function addCommentById(postId, commentText) {
    var updatedPost = null;
    var posts = getPosts().map(function (post) {
        if (post.id !== postId) {
            return post;
        }

        var nextPost = Object.assign({}, post);
        nextPost.comments = Array.isArray(post.comments) ? post.comments.slice() : [];
        nextPost.comments.push({
            id: createStorageId("comment"),
            author: "Гость",
            text: commentText,
            date: new Date().toISOString()
        });
        updatedPost = nextPost;

        return nextPost;
    });

    savePosts(posts);

    return updatedPost;
}

function getAdsData() {
    initializeAppData();

    try {
        var ads = JSON.parse(localStorage.getItem(STORAGE_KEYS.ads));
        return ads && ads.sideAd && ads.feedAd ? ads : getDefaultAds();
    } catch (error) {
        return getDefaultAds();
    }
}

function saveAdsData(ads) {
    localStorage.setItem(STORAGE_KEYS.ads, JSON.stringify(ads));
}

function updateSideAd(data) {
    var ads = getAdsData();

    ads.sideAd = {
        title: data.title,
        content: data.content,
        image: data.image,
        buttonText: data.buttonText,
        link: data.link
    };

    saveAdsData(ads);
}

function updateFeedAd(data) {
    var ads = getAdsData();

    ads.feedAd = {
        title: data.title,
        content: data.content,
        image: data.image,
        buttonText: data.buttonText,
        link: data.link
    };

    saveAdsData(ads);
}

function resetAdsData() {
    saveAdsData(getDefaultAds());
}

function getDefaultPosts() {
    return [
        {
            id: createStorageId("post"),
            author: "Аноним",
            content: "Привет",
            image: "https://i.ibb.co.com/0pH76WPq/b543f97d-0d0e-4a61-80dc-cca400500fab.jpg",
            date: createDateOffset(55),
            likes: 11,
            liked: false,
            comments: []
        }
    ];
}

function getDefaultAds() {
    return {
        sideAd: {
            title: "VPN Сервис",
            content: "Безопасный и быстрый VPN для защиты вашей онлайн-активности. Скрывайте свой IP-адрес и обходите блокировки.",
            image: "https://i.ibb.co.com/qLymZcdp/b4a9cc77-0c07-4a0a-86a2-fa0bfc6c9df8.jpg",
            buttonText: "Подключиться",
            link: "https://trahovvpn.ru"
        },
        feedAd: {
            title: "VPN Сервис",
            content: "VPN для всех устройств. Защитите свою конфиденциальность и получите доступ к заблокированным сайтам с помощью нашего надежного VPN-сервиса.",
            image: "https://i.ibb.co.com/qLymZcdp/b4a9cc77-0c07-4a0a-86a2-fa0bfc6c9df8.jpg",
            buttonText: "Узнать подробнее",
            link: "https://trahovvpn.ru"
        }
    };
}

function createStorageId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function createDateOffset(minutesAgo) {
    return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

// Funkcje dla zakładki społeczności

// Inicjalizacja funkcji społeczności
function initCommunityFeatures() {
    loadPosts();
    setupPostForm();
    setupBeeButtons();
}

// Ustawienie przycisków pszczółek na podstawie danych użytkownika
function setupBeeButtons() {
    const userBees = JSON.parse(sessionStorage.getItem('userBees') || '{}');
    
    // Znajdź wszystkie przyciski pszczółek i ustaw odpowiedni stan
    const beeButtons = document.querySelectorAll('.bee-button');
    beeButtons.forEach(button => {
        const postId = button.closest('.post-card').dataset.postId;
        if (userBees[postId]) {
            button.classList.add('active');
        }
    });
}

// Pobieranie postów z localStorage
function getPosts() {
    const posts = sessionStorage.getItem('community_posts');
    return posts ? JSON.parse(posts) : [];
}

// Zapisywanie postów do localStorage
function savePosts(posts) {
    sessionStorage.setItem('community_posts', JSON.stringify(posts));
}

// Dodawanie nowego posta
function addPost(content, imageData = null) {
    const username = sessionStorage.getItem('username') || 'Anonimowy';
    const posts = getPosts();
    
    const newPost = {
        id: generateId(),
        author: username,
        content: content,
        image: imageData,
        date: new Date().toISOString(),
        bees: 0,
        comments: []
    };
    
    posts.unshift(newPost); // Dodaj na początek tablicy, aby najnowsze posty były na górze
    savePosts(posts);
    loadPosts(); // Odśwież listę postów
    
    return newPost;
}

// Wczytywanie i wyświetlanie postów
function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    const posts = getPosts();
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts-message">Brak postów. Bądź pierwszy i dodaj coś od siebie!</div>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Tworzenie elementu posta
function createPostElement(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.dataset.postId = post.id;
    
    const postHeader = document.createElement('div');
    postHeader.className = 'post-header';
    
    const postAuthor = document.createElement('div');
    postAuthor.className = 'post-author';
    postAuthor.textContent = post.author;
    
    const postDate = document.createElement('div');
    postDate.className = 'post-date';
    postDate.textContent = formatDate(new Date(post.date));
    
    postHeader.appendChild(postAuthor);
    postHeader.appendChild(postDate);
    
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    postContent.textContent = post.content;
    
    postCard.appendChild(postHeader);
    postCard.appendChild(postContent);
    
    // Dodaj obraz, jeśli istnieje
    if (post.image) {
        const postImage = document.createElement('img');
        postImage.className = 'post-image';
        postImage.src = post.image;
        postImage.alt = 'Zdjęcie do posta';
        postCard.appendChild(postImage);
    }
    
    // Dodaj sekcję akcji (pszczółki i komentarze)
    const postActions = document.createElement('div');
    postActions.className = 'post-actions';
    
    // Przycisk pszczółki
    const beeButton = document.createElement('button');
    beeButton.className = 'bee-button';
    beeButton.innerHTML = `&#128029; <span class="bee-count">${post.bees || 0}</span>`;
    beeButton.addEventListener('click', () => addBee(post.id));
    
    postActions.appendChild(beeButton);
    
    // Przycisk komentarzy
    const commentButton = document.createElement('button');
    commentButton.className = 'comment-button';
    commentButton.innerHTML = `<i class="fas fa-comment"></i> <span class="comment-count">${post.comments ? post.comments.length : 0}</span>`;
    commentButton.addEventListener('click', () => toggleCommentForm(post.id));
    
    postActions.appendChild(commentButton);
    
    postCard.appendChild(postActions);
    
    // Sekcja komentarzy
    const commentsSection = document.createElement('div');
    commentsSection.className = 'comments-section';
    commentsSection.style.display = 'none';
    commentsSection.dataset.postId = post.id;
    
    // Formularz dodawania komentarza
    const commentForm = document.createElement('form');
    commentForm.className = 'comment-form';
    commentForm.innerHTML = `
        <textarea class="comment-input" placeholder="Dodaj komentarz..."></textarea>
        <button type="submit" class="button small">Dodaj</button>
    `;
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = commentForm.querySelector('.comment-input');
        if (commentInput.value.trim()) {
            addComment(post.id, commentInput.value);
            commentInput.value = '';
        }
    });
    
    commentsSection.appendChild(commentForm);
    
    // Lista komentarzy
    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';
    
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    } else {
        commentsList.innerHTML = '<p class="no-comments">Brak komentarzy. Dodaj pierwszy!</p>';
    }
    
    commentsSection.appendChild(commentsList);
    postCard.appendChild(commentsSection);
    
    return postCard;
}

// Formatowanie daty
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // Mniej niż minuta
    if (diff < 60 * 1000) {
        return 'przed chwilą';
    }
    
    // Mniej niż godzina
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} ${minutes === 1 ? 'minutę' : minutes < 5 ? 'minuty' : 'minut'} temu`;
    }
    
    // Mniej niż dzień
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} ${hours === 1 ? 'godzinę' : hours < 5 ? 'godziny' : 'godzin'} temu`;
    }
    
    // Mniej niż tydzień
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} ${days === 1 ? 'dzień' : 'dni'} temu`;
    }
    
    // Formatuj datę
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Dodawanie pszczółki (polubienia) do posta
function addBee(postId) {
    const posts = getPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
        // Sprawdź, czy użytkownik już dodał pszczółkę
        const username = sessionStorage.getItem('username') || 'Anonimowy';
        const userBees = JSON.parse(sessionStorage.getItem('userBees') || '{}');
        
        if (userBees[postId]) {
            // Użytkownik już dodał pszczółkę - usuń ją
            posts[postIndex].bees--;
            delete userBees[postId];
            
            // Aktualizuj przycisk
            const beeButton = document.querySelector(`.post-card[data-post-id="${postId}"] .bee-button`);
            if (beeButton) {
                beeButton.classList.remove('active');
                const beeCount = beeButton.querySelector('.bee-count');
                if (beeCount) {
                    beeCount.textContent = posts[postIndex].bees;
                }
            }
        } else {
            // Dodaj pszczółkę
            posts[postIndex].bees++;
            userBees[postId] = true;
            
            // Aktualizuj przycisk
            const beeButton = document.querySelector(`.post-card[data-post-id="${postId}"] .bee-button`);
            if (beeButton) {
                beeButton.classList.add('active');
                const beeCount = beeButton.querySelector('.bee-count');
                if (beeCount) {
                    beeCount.textContent = posts[postIndex].bees;
                }
            }
        }
        
        // Zapisz zmiany
        sessionStorage.setItem('userBees', JSON.stringify(userBees));
        savePosts(posts);
    }
}

// Dodawanie komentarza do posta
function addComment(postId, content) {
    const posts = getPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
        const username = sessionStorage.getItem('username') || 'Anonimowy';
        
        const newComment = {
            id: generateId(),
            author: username,
            content: content,
            date: new Date().toISOString()
        };
        
        // Dodaj komentarz do posta
        if (!posts[postIndex].comments) {
            posts[postIndex].comments = [];
        }
        
        posts[postIndex].comments.push(newComment);
        savePosts(posts);
        
        // Aktualizuj widok komentarzy
        const commentsList = document.querySelector(`.comments-section[data-post-id="${postId}"] .comments-list`);
        if (commentsList) {
            // Usuń komunikat o braku komentarzy, jeśli istnieje
            const noComments = commentsList.querySelector('.no-comments');
            if (noComments) {
                noComments.remove();
            }
            
            // Dodaj nowy komentarz do listy
            const commentElement = createCommentElement(newComment);
            commentsList.appendChild(commentElement);
        }
        
        // Aktualizuj licznik komentarzy
        const commentCount = document.querySelector(`.post-card[data-post-id="${postId}"] .comment-count`);
        if (commentCount) {
            commentCount.textContent = posts[postIndex].comments.length;
        }
    }
}

// Tworzenie elementu komentarza
function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.commentId = comment.id;
    
    const commentHeader = document.createElement('div');
    commentHeader.className = 'comment-header';
    
    const commentAuthor = document.createElement('div');
    commentAuthor.className = 'comment-author';
    commentAuthor.textContent = comment.author;
    
    const commentDate = document.createElement('div');
    commentDate.className = 'comment-date';
    commentDate.textContent = formatDate(new Date(comment.date));
    
    commentHeader.appendChild(commentAuthor);
    commentHeader.appendChild(commentDate);
    
    const commentContent = document.createElement('div');
    commentContent.className = 'comment-content';
    commentContent.textContent = comment.content;
    
    commentElement.appendChild(commentHeader);
    commentElement.appendChild(commentContent);
    
    return commentElement;
}

// Przełączanie widoczności formularza komentarzy
function toggleCommentForm(postId) {
    const commentsSection = document.querySelector(`.comments-section[data-post-id="${postId}"]`);
    if (commentsSection) {
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
        } else {
            commentsSection.style.display = 'none';
        }
    }
}

// Konfiguracja formularza dodawania postów
function setupPostForm() {
    const postForm = document.getElementById('post-form');
    const postContent = document.getElementById('post-content');
    const charCount = document.getElementById('char-count');
    const imageUpload = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const removeImageBtn = document.getElementById('remove-image');
    const maxLength = 200;
    
    if (!postForm || !postContent || !charCount) return;
    
    // Obsługa licznika znaków
    postContent.addEventListener('input', () => {
        const currentLength = postContent.value.length;
        charCount.textContent = currentLength;
        
        if (currentLength > 180) {
            charCount.style.color = 'var(--danger-color)';
        } else {
            charCount.style.color = '';
        }
        
        // Ograniczenie długości tekstu
        if (currentLength > maxLength) {
            postContent.value = postContent.value.substring(0, maxLength);
            charCount.textContent = maxLength;
        }
    });
    
    // Obsługa podglądu obrazu
    if (imageUpload && imagePreview && imagePreviewContainer) {
        imageUpload.addEventListener('change', () => {
            const file = imageUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Obsługa usuwania obrazu
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                imageUpload.value = '';
                imagePreviewContainer.style.display = 'none';
                imagePreview.src = '#';
            });
        }
    }
    
    // Obsługa wysyłania formularza
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (postContent.value.trim() === '') {
            alert('Treść posta nie może być pusta!');
            return;
        }
        
        let imageData = null;
        if (imageUpload && imageUpload.files.length > 0) {
            imageData = imagePreview.src;
        }
        
        addPost(postContent.value, imageData);
        
        // Resetuj formularz
        postContent.value = '';
        charCount.textContent = '0';
        charCount.style.color = '';
        if (imageUpload) imageUpload.value = '';
        if (imagePreviewContainer) {
            imagePreviewContainer.style.display = 'none';
        }
        if (imagePreview) {
            imagePreview.src = '#';
        }
    });
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    // Sprawdź, czy jesteśmy na stronie społeczności
    if (document.getElementById('community')) {
        initCommunityFeatures();
    }
});
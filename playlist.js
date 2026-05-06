// Load YouTube IFrame API
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let videos = [
    { href: "https://www.youtube.com/watch?v=HwAPLk_sQ3w", name: "digital circus ep1" },
    { href: "https://www.youtube.com/watch?v=4ofJpOEXrZs&list=PLHovnlOusNLgvAbnxluXCVB3KLj8e4QB-&index=2", name: "digital circus ep2" },
    { href: "https://www.youtube.com/watch?v=bKjfw77cxeQ&list=PLHovnlOusNLgvAbnxluXCVB3KLj8e4QB-&index=3", name: "digital circus ep3" },
    { href: "https://www.youtube.com/watch?v=Q9KWcWKo2T8&list=PLHovnlOusNLgvAbnxluXCVB3KLj8e4QB-&index=4", name: "digital circus ep4" },
    { href: "https://www.youtube.com/watch?v=L4p2gN2CzsA&list=PLHovnlOusNLgvAbnxluXCVB3KLj8e4QB-&index=5", name: "digital circus ep5" },
    { href: "https://www.youtube.com/watch?v=mOvhHim78YA&list=PLHovnlOusNLgvAbnxluXCVB3KLj8e4QB-&index=6", name: "digital circus ep6" },
    { href: "https://www.youtube.com/watch?v=oaOG1xOk7XY&list=PLHovnlOusNLgvAbnxluXCVB3KLj8e4QB-&index=7", name: "digital circus ep7" },
    { href: "https://www.youtube.com/watch?v=DMNlzf8PiEM", name: "digital circus ep8" },
];

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

let player;

let videoTitle = document.getElementById("video-title");
let list = document.getElementById("list");
let play = document.getElementById("play");
let pause = document.getElementById("pause");
let prev = document.getElementById("prev");
let next = document.getElementById("next");

let currentVideoIndex = 0;
let completedVideos = new Set();

// Load completed videos from localStorage
function loadCompletedVideos() {
    const saved = localStorage.getItem('completedVideos');
    if (saved) {
        try {
            const array = JSON.parse(saved);
            completedVideos = new Set(array);
        } catch (e) {
            console.error('Error loading completed videos:', e);
            completedVideos = new Set();
        }
    }
}

// Save completed videos to localStorage
function saveCompletedVideos() {
    const array = Array.from(completedVideos);
    localStorage.setItem('completedVideos', JSON.stringify(array));
}

// Load completed videos on page load
loadCompletedVideos();

// YouTube IFrame API callback - called when API is ready
function onYouTubeIframeAPIReady() {
    loadVideo(0);
}

// Load video using YouTube IFrame API
function loadVideo(index) {
    currentVideoIndex = index;
    const videoId = getYouTubeVideoId(videos[index].href);
    videoTitle.textContent = videos[index].name;
    
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('video', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            events: {
                'onStateChange': onPlayerStateChange
            },
            playerVars: {
                'autoplay': 1,
                'controls': 1
            }
        });
    }
}

// Handle player state changes
function onPlayerStateChange(event) {
    // 0 = ENDED, 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 5 = CUED
    if (event.data === YT.PlayerState.ENDED) {
        // Mark current video as completed
        completedVideos.add(currentVideoIndex);
        markVideoCompleted(currentVideoIndex);
        
        // Play next video when current one ends
        let nextIndex = (currentVideoIndex + 1) % videos.length;
        loadVideo(nextIndex);
        updateActiveItem(nextIndex);
    }
}

// Mark a video as completed with green checkmark
function markVideoCompleted(index) {
    const videoItems = document.querySelectorAll(".videolist div");
    if (videoItems[index]) {
        videoItems[index].classList.add("completed");
    }
    // Save to localStorage
    saveCompletedVideos();
}

for(let i=0; i<videos.length; i++){
    let item = document.createElement("div");
    item.innerText = videos[i].name;
    // Restore completed state if video was previously completed
    if (completedVideos.has(i)) {
        item.classList.add("completed");
    }
    item.addEventListener("click", function(){
        loadVideo(i);
        // Remove active class from all items
        document.querySelectorAll(".videolist div").forEach(el => el.classList.remove("active"));
        // Add active class to clicked item
        item.classList.add("active");
    });
    list.appendChild(item);
}

// Load first video on page load
// (handled by onYouTubeIframeAPIReady callback)

// Helper function to update active item in list
function updateActiveItem(index) {
    document.querySelectorAll(".videolist div").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".videolist div")[index].classList.add("active");
}

// Set up event listeners for play/pause buttons
play.addEventListener("click", function(){
    if (player) {
        player.playVideo();
    }
});
pause.addEventListener("click", function(){
    if (player) {
        player.pauseVideo();
    }
});

// Set up event listeners for next/previous buttons
next.addEventListener("click", function(){
    let nextIndex = (currentVideoIndex + 1) % videos.length;
    loadVideo(nextIndex);
    updateActiveItem(nextIndex);
});

prev.addEventListener("click", function(){
    let prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    loadVideo(prevIndex);
    updateActiveItem(prevIndex);
});

// Scroll to top button functionality
const scrollToTopBtn = document.getElementById("scrollToTop");
const links = document.getElementById("link");
window.addEventListener("scroll", function() {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
});

scrollToTopBtn.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Navigation link click animation
const navLinks = document.querySelectorAll(".navlinks a");
navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        this.style.animation = "none";
        setTimeout(() => {
            this.style.animation = "linkClick 0.4s ease-out";
        }, 10);
    });
});

if (links) {
    links.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
// Comments functionality
const commentInput = document.getElementById("commentInput");
const submitCommentBtn = document.getElementById("submitComment");
const deleteCommentsBtn = document.getElementById("deleteComments");
const commentsList = document.getElementById("commentsList");
let comments = JSON.parse(localStorage.getItem("comments")) || [];

// Get or create user ID
let currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
    currentUser = prompt("Please enter your name:") || "Anonymous";
    localStorage.setItem("currentUser", currentUser);
}

function displayComments(animateIndex = -1) {
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #999;">No comments yet. Be the first to comment!</p>';
    } else {
        commentsList.innerHTML = "";
        comments.forEach((comment, index) => {
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.id = `comment-${index}`;
            const commentText = typeof comment === 'string' ? comment : comment.text;
            const likedBy = typeof comment === 'object' ? (comment.likedBy || []) : [];
            const dislikedBy = typeof comment === 'object' ? (comment.dislikedBy || []) : [];
            const userLiked = likedBy.includes(currentUser);
            const userDisliked = dislikedBy.includes(currentUser);
            
            commentDiv.innerHTML = `
                <div class="comment-author">${typeof comment === 'object' && comment.author ? comment.author : 'yasser'}</div>
                <div class="comment-text">${commentText}</div>
                <div class="comment-actions">
                    <button class="like-btn ${userLiked ? 'liked' : ''} ${animateIndex === index ? 'animate' : ''}" onclick="likeComment(${index})" title="${userLiked ? 'Unlike' : 'Like'}">👍 ${likedBy.length}</button>
                    <button class="dislike-btn ${userDisliked ? 'disliked' : ''} ${animateIndex === index ? 'animate' : ''}" onclick="dislikeComment(${index})" title="${userDisliked ? 'Remove dislike' : 'Dislike'}">👎 ${dislikedBy.length}</button>
                    <button class="delete-comment" onclick="deleteComment(${index})">Delete</button>
                </div>
            `;
            commentsList.appendChild(commentDiv);
        });
        
        if (animateIndex !== -1) {
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${animateIndex}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }
}

submitCommentBtn.addEventListener("click", function() {
    const commentText = commentInput.value.trim();
    if (commentText) {
        comments.push({ text: commentText, author: currentUser, likedBy: [], dislikedBy: [] });
        localStorage.setItem("comments", JSON.stringify(comments));
        commentInput.value = "";
        displayComments();
    } else {
        alert("Please enter a comment!");
    }
});
deleteCommentsBtn.addEventListener("click", function() {
    if (confirm("Are you sure you want to delete all comments?")) {
        comments = [];
        localStorage.setItem("comments", JSON.stringify(comments));
        displayComments();
    }
});


commentInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter" && event.ctrlKey) {
        submitCommentBtn.click();
    }
});

function deleteComment(index) {
    if (confirm("Are you sure you want to delete this comment?")) {
        comments.splice(index, 1);
        localStorage.setItem("comments", JSON.stringify(comments));
        displayComments();
    }
}

function likeComment(index) {
    if (typeof comments[index] === 'string') {
        comments[index] = { text: comments[index], author: 'yasser', likedBy: [], dislikedBy: [] };
    }
    if (!comments[index].likedBy) {
        comments[index].likedBy = [];
    }
    if (!comments[index].dislikedBy) {
        comments[index].dislikedBy = [];
    }
    
    const userIndex = comments[index].likedBy.indexOf(currentUser);
    if (userIndex > -1) {
        comments[index].likedBy.splice(userIndex, 1);
    } else {
        comments[index].likedBy.push(currentUser);
        const dislikeIndex = comments[index].dislikedBy.indexOf(currentUser);
        if (dislikeIndex > -1) {
            comments[index].dislikedBy.splice(dislikeIndex, 1);
        }
    }
    localStorage.setItem("comments", JSON.stringify(comments));
    displayComments(index);
}

function dislikeComment(index) {
    if (typeof comments[index] === 'string') {
        comments[index] = { text: comments[index], author: 'yasser', likedBy: [], dislikedBy: [] };
    }
    if (!comments[index].likedBy) {
        comments[index].likedBy = [];
    }
    if (!comments[index].dislikedBy) {
        comments[index].dislikedBy = [];
    }
    
    const userIndex = comments[index].dislikedBy.indexOf(currentUser);
    if (userIndex > -1) {
        comments[index].dislikedBy.splice(userIndex, 1);
    } else {
        comments[index].dislikedBy.push(currentUser);
        const likeIndex = comments[index].likedBy.indexOf(currentUser);
        if (likeIndex > -1) {
            comments[index].likedBy.splice(likeIndex, 1);
        }
    }
    localStorage.setItem("comments", JSON.stringify(comments));
    displayComments(index);
}

// Display comments on page load
displayComments();

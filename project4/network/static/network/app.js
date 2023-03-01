document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.all-posts').addEventListener('click', () => view_post('all'));
    document.querySelector('.following').addEventListener('click', () => view_following());
    document.querySelector('.profile').addEventListener('click', () => view_profile());
    document.querySelector('#create-post').addEventListener('submit', create_post);

    // By default, load the All Posts
    view_post('all');
});



function create_post() {

    let content = document.querySelector('.post-content').value;

    fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: content,
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        view_post('all');
    });
}


function view_post(type) {

    document.querySelector('#posts').style.display = 'block';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#followers').style.display = 'none';

    const heading = document.querySelector('.post-heading');

    if (type === 'all'){
        heading.innerHTML = 'All Posts';
    }
    else if (type === 'profile') {
        heading.innerHTML = 'My Posts';
    }

    const all_posts = document.querySelector('#posts');

    fetch(`/posts/${type}`)
    .then(response => response.json())
    .then(posts => { 
        posts.forEach(post => {
            
            const post_div = document.createElement('div');
            post_div.classList.add('post');

            const author = document.createElement('p');
            author.classList.add('post-author');
            author.innerHTML = post.author;

            const edit = document.createElement('a');
            edit.innerHTML = 'Edit';
            edit.href = '#';
            edit.classList.add('post-edit');

            const content = document.createElement('p');
            content.classList.add('post-content');
            content.innerHTML = post.content;

            const timestamp = document.createElement('p');
            timestamp.classList.add('post-timestamp');
            timestamp.innerHTML = post.timestamp;

            const likes = document.createElement('p');
            likes.classList.add('post-likes');
            if (post.liked === true) {
                likes.innerHTML = `Liked ${post.likes}`;
            }
            else {
                likes.innerHTML = `NotLiked ${post.likes}`;
            }


            // TODO
            const comment = document.createElement('p');
            comment.classList.add('post-comment');
            comment.innerHTML = 'comment';

            post_div.appendChild(author);
            post_div.appendChild(edit);
            post_div.appendChild(content);
            post_div.appendChild(timestamp);
            post_div.appendChild(likes);
            post_div.appendChild(comment);

            all_posts.appendChild(post_div)
        })
    })
}


function view_following() {
    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#followers').style.display = 'block';

}


function view_profile() {
    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    document.querySelector('#followers').style.display = 'none';

}

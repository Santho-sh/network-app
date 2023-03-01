document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.all-posts').addEventListener('click', () => view_post('all'));
    document.querySelector('.following').addEventListener('click', () => view_follow('following'));
    document.querySelector('.profile').addEventListener('click', () => view_profile(1));
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

    let all_posts = null

    if (type === 'all'){

        document.querySelector('#posts').style.display = 'block';
        document.querySelector('#profile').style.display = 'none';
        document.querySelector('#followers').style.display = 'none';

        const heading = document.querySelector('.page-heading');
        heading.innerHTML = 'All Posts';

        all_posts = document.querySelector('#posts');

    } else if (type === 'profile') {
        all_posts = document.querySelector('#profile-posts');
        all_posts.innerHTML='';
    }

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

            all_posts.appendChild(post_div);
        })
    })
}


function view_follow(type) {

    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#followers').style.display = 'block';

    const heading = document.querySelector('.page-heading');
    heading.innerHTML = 'Following';

    const followers = document.querySelector('#followers')
    followers.innerHTML = '';

    fetch(`/profile/followers`)
    .then(response => response.json())
    .then(users => {
        users.forEach(user => {
            const follow = document.createElement('p');
            follow.classList.add('follow');
            follow.innerHTML = user.name;

            followers.appendChild(follow);
        })
    })
}


function view_profile(id) {

    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    document.querySelector('#followers').style.display = 'none';

    // current user id
    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    const heading = document.querySelector('.page-heading');
    const followers = document.querySelector('.profile-followers');
    const following = document.querySelector('.profile-following');
    const button = document.querySelector('.profile-button');
    button.innerHTML = '';

    fetch(`/profile/${id}`)
    .then(response => response.json())
    .then(data => { 
        heading.innerHTML = data.name;
        followers.innerHTML = `<b>Followers:</b> ${data.followers_count}`;
        following.innerHTML = `<b>Following:</b> ${data.following_count}`;

        if (id !== user_id) {
            const follow = document.createElement('button');
            if (data.follow){
                follow.textContent = 'Unfollow';
            } else {
                follow.textContent = 'Follow';
            }
            button.appendChild(follow);
        }
    })

    view_post('profile')
}

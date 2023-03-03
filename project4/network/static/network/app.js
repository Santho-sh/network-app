document.addEventListener('DOMContentLoaded', () => {
    // Current users id
    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    // Actions
    document.querySelector('.all-posts').addEventListener('click', () => view_post('all'));
    document.querySelector('.new-post').addEventListener('click', () => new_post());
    document.querySelector('.following').addEventListener('click', () => view_follow('following'));
    document.querySelector('.profile').addEventListener('click', () => view_profile(user_id));

    // By default, load the All Posts
    view_post('all');
});


function new_post(id='new', old_content='') {
    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#followers').style.display = 'none';

    const heading = document.querySelector('.page-heading');
    

    document.querySelector('.post-content-new').value = old_content;

    if (id == 'new'){

        heading.innerHTML = 'New Post';
        document.querySelector('.post-button').value = 'Post';

        document.querySelector('#create-post').addEventListener('submit', ()=> {

            const content = document.querySelector('.post-content-new').value;

            fetch('/posts', {
                method: 'POST',
                body: JSON.stringify({  
                content: content,
                })
            })
            .then(response => response.json())
            .then(result => {
                view_post('all');
            })
        });
    } else {

        heading.innerHTML = 'Edit Post';
        document.querySelector('.post-button').value = 'Save';

        document.querySelector('#create-post').addEventListener('submit',() => {

            const content = document.querySelector('.post-content-new').value;

            fetch(`/postEdit/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    edit:content
                })
            });
            view_post('all');
        })
    }       
}


function view_post(type) {

    // type == all or profile

    let all_posts = null

    if (type === 'all'){

        document.querySelector('#posts').style.display = 'block';
        document.querySelector('#profile').style.display = 'none';
        document.querySelector('#new-post').style.display = 'none';
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
            
            if (post.can_edit){
                edit.innerHTML = 'Edit';
                edit.classList.add('post-edit');
            }

            const content = document.createElement('p');
            content.classList.add('post-content');
            content.innerHTML = post.content;

            const timestamp = document.createElement('p');
            timestamp.classList.add('post-timestamp');
            timestamp.innerHTML = post.timestamp;

            const likes = document.createElement('div');
            likes.classList.add('post-likes');

            const like_icon = document.createElement('a');
            like_icon.classList.add('like-icon');

            const like_count = document.createElement('p');
            like_count.classList.add('like-count');
            like_count.innerHTML = post.likes;


            const red_heart = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.5 47.5"><defs><clipPath id="a"><path d="M0 38h38V0H0v38Z"/></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path fill="#be1931" d="M36.885 25.166c0 5.45-4.418 9.868-9.867 9.868-3.308 0-6.227-1.633-8.018-4.129-1.79 2.496-4.71 4.129-8.017 4.129-5.45 0-9.868-4.418-9.868-9.868 0-.772.098-1.52.266-2.241C2.752 14.413 12.216 5.431 19 2.965c6.783 2.466 16.249 11.448 17.617 19.96.17.721.268 1.469.268 2.241"/></g></svg>';
            const grey_heart = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.5 47.5"><defs><clipPath id="a"><path d="M0 38h38V0H0v38Z"/></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path fill="#808080" d="M36.885 25.166c0 5.45-4.418 9.868-9.867 9.868-3.308 0-6.227-1.633-8.018-4.129-1.79 2.496-4.71 4.129-8.017 4.129-5.45 0-9.868-4.418-9.868-9.868 0-.772.098-1.52.266-2.241C2.752 14.413 12.216 5.431 19 2.965c6.783 2.466 16.249 11.448 17.617 19.96.17.721.268 1.469.268 2.241"/></g></svg>'; 

            if (post.liked === true) {
                like_icon.innerHTML =  red_heart;
            }
            else {
                like_icon.innerHTML =  grey_heart
            }

            likes.appendChild(like_icon);
            likes.appendChild(like_count);

            like_icon.addEventListener('click', () => {
                if (post.liked === true){
                    
                    fetch(`/postEdit/${post.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            liking:'dislike'
                        })
                    })
                    .then(response => response.json())
                    .then(new_data => {
                        like_count.innerHTML = new_data.like_count;
                    })
                    
                    like_icon.innerHTML = '';
                    like_icon.innerHTML = grey_heart;
                    post.liked = false;

                } else {
                    
                    fetch(`/postEdit/${post.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            liking:'like'
                        })
                    })
                    .then(response => response.json())
                    .then(new_data => {
                        like_count.innerHTML = new_data.like_count;
                    })
                    
                    like_icon.innerHTML = '';
                    like_icon.innerHTML = red_heart;
                    post.liked = true;
                }
            })

            
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

            author.addEventListener('click', () => {
                view_profile(post.author_id);
            });
            
            edit.addEventListener('click', () => {
                new_post(post.id, post.content);
            });

            all_posts.appendChild(post_div);
        })
    })
}


function view_follow(type) {

    // type = followers or following

    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#followers').style.display = 'block';

    const heading = document.querySelector('.page-heading');
    heading.innerHTML = 'Following';

    const followers = document.querySelector('#followers')
    followers.innerHTML = '';

    fetch(`/profile/${type}`)
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
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#followers').style.display = 'none';

    // current user id
    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    const heading = document.querySelector('.page-heading');
    const followers = document.querySelector('.profile-followers');
    const following = document.querySelector('.profile-following');
    const profile_button = document.querySelector('.profile-button');
    profile_button.innerHTML = '';

    fetch(`/profile/${id}`)
    .then(response => response.json())
    .then(data => { 
        heading.innerHTML = data.name;
        followers.innerHTML = `<b>Followers:</b> ${data.followers_count}`;
        following.innerHTML = `<b>Following:</b> ${data.following_count}`;

        if (id !== user_id) {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-primary', 'btn-sm');
            if (data.follow){
                button.classList.add('follow_button');
                button.textContent = 'Unfollow';
            } else {
                button.classList.add('unfollow_button');
                button.textContent = 'Follow';
            }
            profile_button.appendChild(button);

            // Follow and Unfollow button
            button.addEventListener('click', function() {
                if (data.follow) {

                    fetch(`/profile/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            action: 'unfollow'
                        })
                    })
                    .then(response => response.json())
                    .then(updated_data => {
                        followers.innerHTML = `<b>Followers:</b> ${updated_data.followers_count}`;
                        following.innerHTML = `<b>Following:</b> ${updated_data.following_count}`;
                    });

                    button.classList.remove('follow_button');
                    button.classList.add('unfollow_button');
                    button.textContent = 'Follow';
                    data.follow = false;

                } else {

                    fetch(`/profile/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            action: 'follow'
                        })
                    })
                    .then(response => response.json())
                    .then(updated_data => {
                        followers.innerHTML = `<b>Followers:</b> ${updated_data.followers_count}`;
                        following.innerHTML = `<b>Following:</b> ${updated_data.following_count}`;
                    });

                    button.classList.remove('unfollow_button');
                    button.classList.add('follow_button');
                    button.textContent = 'Unfollow';
                    data.follow = true;
                }
            });

        }
        view_post('profile');
    })
}

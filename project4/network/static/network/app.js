document.addEventListener('DOMContentLoaded', () => {
    // Current users id
    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    // Actions
    document.querySelector('.all-posts').addEventListener('click', () => view_posts());
    document.querySelector('.new-post').addEventListener('click', () => new_post());
    document.querySelector('.following').addEventListener('click', () => view_posts(user_id, 1, 'following'));
    document.querySelector('.profile').addEventListener('click', () => view_profile(user_id));

    // By default, load the All Posts
    view_posts();
});


function new_post(id='new', old_content='') {
    document.querySelector('#posts-page').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#follows').style.display = 'none';

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
            .then(_ => {
                view_posts();
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
            view_posts();
        })
    }       
}


function view_posts(id=0, page=1, type='all') {

    // id == 0 : all posts
    // id == -1: following posts

    let all_posts = null

    if (id === 0 || type === 'following'){

        document.querySelector('#posts-page').style.display = 'block';
        document.querySelector('#profile').style.display = 'none';
        document.querySelector('#new-post').style.display = 'none';
        document.querySelector('#follows').style.display = 'none';

        const heading = document.querySelector('.page-heading');
        
        if (type === 'following'){
            heading.innerHTML = 'Following';
        } else {
            heading.innerHTML = 'All Posts';
        }

        all_posts = document.querySelector('#posts');
    }
    
    else {
        all_posts = document.querySelector('#profile-posts');
    }
    all_posts.innerHTML='';

    fetch(`/posts/${id}/${page}/${type}`)
    .then(response => response.json())
    .then(data => { 
        data.posts.forEach(post => {

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

            post_div.appendChild(author);
            post_div.appendChild(edit);
            post_div.appendChild(content);
            post_div.appendChild(timestamp);
            post_div.appendChild(likes);

            author.addEventListener('click', () => {
                view_profile(post.author_id);
            });
            
            edit.addEventListener('click', () => {
                new_post(post.id, post.content);
            });

            all_posts.appendChild(post_div);
        })

        //Pages
        const page_change = document.querySelector('.page-change');
        page_change.innerHTML = '';

        if (data.no_pages > 1) {

        const previous = document.createElement('li');
        previous.classList.add('previous', 'page-item');
        previous.innerHTML = '<a class="page-link" href="#">Previous</a>';

        if (data.cur_page == 1){
            previous.classList.add('disabled')
        }
        page_change.appendChild(previous);


        if (data.no_pages > 0) {
            const nav = document.createElement('nav');
            nav.setAttribute('aria-label', 'Page navigation example');

            for(let i=1; i <= data.no_pages; i++) {
                let li = document.createElement('li');
                li.classList.add('page-item');
                if (i === data.cur_page){
                    li.classList.add('active');
                    li.setAttribute('aria-current',"page");
                }

                li.innerHTML = `<a class="page-link" href="#">${i}</a>`

                page_change.appendChild(li);
            }

            const next = document.createElement('li');
            next.classList.add('page-item', 'next');
            next.innerHTML = '<a class="page-link" href="#">Next</a>';
            if (data.cur_page == data.no_pages){
                next.classList.add('disabled');
            }
            page_change.appendChild(next);
            previous.addEventListener('click', () => {
                let prev = data.cur_page - 1
                if(prev > 0){
                    view_posts(id, prev);
                };
            })
    
            next.addEventListener('click', () => {
                let nxt = data.cur_page + 1
                if(nxt <= data.no_pages){
                    view_posts(id, nxt);
                };
            })
        
            }
        }
    })
}


function view_follow(type, id) {

    const user_id = JSON.parse(document.getElementById('user_id').textContent);

    // type = followers or following

    document.querySelector('#posts-page').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#follows').style.display = 'block';

    const heading = document.querySelector('.page-heading');

    const follows = document.querySelector('#follows');

    fetch(`/profile/${type}/${id}`)
    .then(response => response.json())
    .then(users => {
        follows.innerHTML = '';
        users.forEach(user => {

            if(id === user_id){
                if (type === 'following') {
                    heading.innerHTML = 'Following';
                }
                else if (type === 'followers') {
                    heading.innerHTML = 'Followers';
                }
            } else { 
                if (type === 'following') {
                    heading.innerHTML = `${user.main_user}'s Following`;
                }
                else if (type === 'followers') {
                    heading.innerHTML = `${user.main_user}'s Followers`;
                }
            }

            const follow = document.createElement('p');
            follow.classList.add('follow');
            follow.innerHTML = user.name;
            follows.appendChild(follow);

            follow.addEventListener('click', () => {
                view_profile(user.id);
            })
        })
    })
}


function view_profile(id) {

    document.querySelector('#posts-page').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#follows').style.display = 'none';

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

        followers.addEventListener('click', () => {
            view_follow('followers', id);
        });

        following.addEventListener('click', () => {
            view_follow('following', id);
        });

        view_posts(id);
    })
}
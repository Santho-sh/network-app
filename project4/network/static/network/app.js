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

    console.log(content);

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

    fetch(`/posts/all`)
    .then(response => response.json())
    .then(posts => { 
        posts.forEach(post => {
            console.log(post)
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

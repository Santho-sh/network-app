import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Profile, Post, Comment



def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")
    else:
        return redirect('/login')
    
    
    
@csrf_exempt
@login_required
def create_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    content = str(data.get("content", "")).strip()
    if content == '':
        return JsonResponse({"error": "content required."}, status=400)
    
    post = Post.objects.create(author=request.user, content=content)
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)



@csrf_exempt
@login_required
def get_posts(request, user_id, page=1, type='all'):
    if user_id == 0 and type == 'all':
        posts_all = Post.objects.all()
        
    elif type == 'following':
        
        following = Profile.objects.get(user=request.user).following.all()

        posts_all = Post.objects.filter(author__in=following)

    else:
        try:
            author = User.objects.get(pk=user_id)
        except:
            return JsonResponse({"error": "Invalid User Id."}, status=400)

        posts_all = Post.objects.filter(author=author)

    posts_all = posts_all.order_by("-timestamp")
    posts = Paginator(posts_all, 10)
    # Show 10 contacts per page.
    no_pages = posts.num_pages

    page_posts = posts.get_page(page)

    serialized_posts = []
    for post in page_posts:
        if post is not None:
            serialized_post = post.serialize()
            serialized_post['liked'] = post.liked(request.user)
            serialized_posts.append(serialized_post)
            if request.user == post.author:
                serialized_post['can_edit'] = True
            else:
                serialized_post['can_edit'] = False

    return JsonResponse({'posts':serialized_posts,
                         'no_pages':no_pages,
                         'cur_page':page}, safe=False)


@csrf_exempt
@login_required
def edit_post(request, id):
    try:
        post = Post.objects.get(pk=id)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.method == "PUT":
        
        data = json.loads(request.body)
        
        # Like or Dislike Post
        if data.get("liking") is not None:
            if data['liking'] == 'like':
                post.likes.add(request.user)
            elif data['liking'] == 'dislike':
                post.likes.remove(request.user)
                
            likes = post.likes.count()
            
            return JsonResponse({
                'like_count':likes,
            }, safe=False)
            
        # Edit Post
        elif data.get("edit") is not None:
            
            if post.author == request.user:
                post.content = data['edit']
                post.save()
                return JsonResponse({'message': 'Post updated successfully'}, status=200)
            
            else:
                return JsonResponse({'error': 'Invalid edit request'}, status=400)
        else:
            return JsonResponse({"error": "Invalid request."}, status=400)
    

@csrf_exempt
@login_required
def profile(request, id):
    try:
        profile = Profile.objects.get(user=id)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found."}, status=404)
    
    name = profile.user.username
    followers_count = profile.followers.count()
    following_count = profile.following.count()
    
    if request.user in profile.followers.all():
        follow = True
    else:
        follow = False
        
    if request.method == "GET":
        return JsonResponse({'name':name,
                            'followers_count':followers_count,'following_count':following_count,
                            'follow':follow,
                            }, safe=False)
    
    elif request.method == "PUT":
        
        cur_user = Profile.objects.get(user=request.user)
        
        data = json.loads(request.body)
        
        if data.get("action") is not None:
            profile_user = User.objects.get(pk=id)
            
            if data['action'] == 'follow':
                cur_user.following.add(profile_user)
                profile.followers.add(request.user)
            elif data['action'] == 'unfollow':
                cur_user.following.remove(profile_user)
                profile.followers.remove(request.user)
                
        followers_count = profile.followers.count()
        following_count = profile.following.count()

        return JsonResponse({'followers_count':followers_count,
                             'following_count':following_count,
                            }, safe=False)


@login_required
def profile_follows(request, users, id):
    try: 
        main_user = User.objects.get(pk=id)
    except:
        return JsonResponse({"error": "Invalid Request."}, status=400)
        
    profile = Profile.objects.get(user=main_user)
    if users == 'followers':
        users = profile.followers.all()
    elif users == 'following':
        users = profile.following.all()    
    else:
        return JsonResponse({"error": "Invalid Request."}, status=400)
    
    all = []
    for user in users:
        user = {
            'id':user.id,
            'name':user.username,
            'main_user':main_user.username
        }
        all.append(user)

    return JsonResponse(all, safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            profile = Profile.objects.create(user=user)
            profile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
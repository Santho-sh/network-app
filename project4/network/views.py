import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

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
    content = data.get("content", "")
    post = Post.objects.create(author=request.user, content=content)
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)


@csrf_exempt
@login_required
def get_posts(request, required):
    if required == 'all':
        posts = Post.objects.all()
    elif required == 'profile':
        posts = Post.objects.filter(author=request.user)
    else:
        return JsonResponse({"error": "Invalid Request."}, status=400)
    
    posts = posts.order_by("-timestamp").all()
    
    serialized_posts = []
    for post in posts:
        if post is not None:
            serialized_post = post.serialize()
            serialized_post['liked'] = post.liked(request.user)
            serialized_posts.append(serialized_post)
    
    return JsonResponse(serialized_posts, safe=False)




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

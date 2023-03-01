
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # API Routes
    path("posts", views.create_post, name="create"),
    path("posts/<str:required>", views.get_posts, name = "posts"),
    path("profile", views.profile, name = "profile"),
    path("profile/followers", views.profile_followers, name="followers"),
]


from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # API Routes
    path("posts", views.create_post, name="create"),
    path("postEdit/<int:id>", views.edit_post, name = "edit_post"),
    path("posts/<int:user_id>/<int:page>/<str:type>", views.get_posts, name = "posts"),

    path("profile/<int:id>", views.profile, name = "profile"),
    path("profile/<str:users>/<int:id>", views.profile_follows, name="follows"),
]
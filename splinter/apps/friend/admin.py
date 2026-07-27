from django.contrib import admin

from splinter.apps.friend.models import Friendship


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'created_at')
    search_fields = ('user1__username', 'user1__email', 'user2__username', 'user2__email')
    list_filter = ('created_at',)

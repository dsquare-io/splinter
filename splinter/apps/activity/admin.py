from django.contrib import admin

from splinter.apps.activity.models import Activity, ActivityAudience, Comment
from splinter.core.admin import ReadOnlyAdminMixin, ViewAndDeleteOnlyAdminMixin


class ActivityAudienceInline(ReadOnlyAdminMixin, admin.TabularInline):
    model = ActivityAudience
    extra = 0


@admin.register(Activity)
class ActivityAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('verb', 'actor', 'group', 'created_at')
    search_fields = ('actor__username', 'actor__email', 'verb')
    list_filter = ('verb',)
    inlines = (ActivityAudienceInline,)


@admin.register(ActivityAudience)
class ActivityAudienceAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('activity', 'user', 'delivered_at', 'read_at', 'created_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('created_at',)


@admin.register(Comment)
class CommentAdmin(ViewAndDeleteOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('user', 'activity', 'content', 'created_at')
    search_fields = ('user__username', 'user__email', 'content')
    list_filter = ('created_at',)

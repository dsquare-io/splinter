from django.contrib import admin

from splinter.apps.group.models import Group, GroupMembership


class GroupMembershipInline(admin.TabularInline):
    model = GroupMembership
    extra = 0


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    search_fields = ('name', 'created_by__username', 'created_by__email')
    list_filter = ('created_at',)
    inlines = (GroupMembershipInline,)

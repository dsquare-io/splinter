from django.contrib import admin

from splinter.apps.attachment.models import Avatar, FileAttachment
from splinter.core.admin import ViewAndDeleteOnlyAdminMixin


@admin.register(FileAttachment)
class FileAttachmentAdmin(ViewAndDeleteOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('file_name', 'content_type', 'file_size', 'is_processed', 'created_by', 'created_at')
    search_fields = ('file_name', 'created_by__username', 'created_by__email')
    list_filter = ('content_type', 'is_processed')


@admin.register(Avatar)
class AvatarAdmin(ViewAndDeleteOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('file_name', 'content_type', 'file_size', 'is_processed', 'created_by', 'created_at')
    search_fields = ('file_name', 'created_by__username', 'created_by__email')
    list_filter = ('content_type', 'is_processed')

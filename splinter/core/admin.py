class ViewAndDeleteOnlyAdminMixin:
    def has_add_permission(self, *args, **kwargs):
        return False

    def has_change_permission(self, *args, **kwargs):
        return False


class ReadOnlyAdminMixin(ViewAndDeleteOnlyAdminMixin):
    def has_delete_permission(self, *args, **kwargs):
        return False

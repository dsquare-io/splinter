from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from splinter.apps.media.models import MediaFile


class FileAttachmentMixin(serializers.Serializer):
    attachment_uids = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)

    def on_attach(self, obj, files):
        pass

    def on_detach(self, obj, files):
        pass

    def perform_create(self, validated_data):
        return super().create(validated_data)

    def perform_update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def _link_files(self, obj, uids):
        actor = self.context['request'].user
        files = list(MediaFile.objects.attachable().filter(public_id__in=uids, uploaded_by=actor))
        if not files:
            return

        ct = ContentType.objects.get_for_model(obj.__class__)
        for f in files:
            f.content_type_fk = ct
            f.object_id = obj.pk
            f.save(update_fields=['content_type_fk', 'object_id'])

        self.on_attach(obj, files)

    def _unlink_files(self, obj, files):
        for f in files:
            f.content_type_fk = None
            f.object_id = None
            f.save(update_fields=['content_type_fk', 'object_id'])

        self.on_detach(obj, files)

    def create(self, validated_data):
        desired_uids = validated_data.pop('attachment_uids', [])
        obj = self.perform_create(validated_data)
        if desired_uids:
            self._link_files(obj, desired_uids)
        return obj

    def update(self, instance, validated_data):
        desired_uids = set(validated_data.pop('attachment_uids', []))
        obj = self.perform_update(instance, validated_data)

        ct = ContentType.objects.get_for_model(obj.__class__)
        current_files = list(MediaFile.objects.filter(content_type_fk=ct, object_id=obj.pk))
        current_uids = {f.public_id for f in current_files}

        to_remove = [f for f in current_files if f.public_id not in desired_uids]
        if to_remove:
            self._unlink_files(obj, to_remove)

        new_uids = desired_uids - current_uids
        if new_uids:
            self._link_files(obj, new_uids)

        return obj

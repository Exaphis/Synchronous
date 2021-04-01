from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_401_UNAUTHORIZED, HTTP_400_BAD_REQUEST
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from workspaces.models import Workspace
from .models import TusdFileShare, TusdFile
from .serializers import TusdFileSerializer


@api_view(['POST'])
def hook(request):
    # TODO: deny requests not from tusd
    # TODO: https://stackoverflow.com/a/53495618
    hook_name = request.headers.get('Hook-Name', '')

    print(hook_name)
    print(request.data)
    upload = request.data['Upload']
    metadata = upload['MetaData']
    workspace_uuid = metadata['workspaceUniqueId']
    file_name = metadata['filename']

    if hook_name == 'pre-create':
        # TODO: verify authorization
        try:
            Workspace.objects.get(unique_id=workspace_uuid)
        except Workspace.DoesNotExist:
            return Response(status=HTTP_400_BAD_REQUEST)

        return Response()
    elif hook_name == 'post-finish':
        file_id = upload['ID']

        workspace = Workspace.objects.get(unique_id=workspace_uuid)
        tusd_file_share, _ = TusdFileShare.objects.get_or_create(workspace=workspace)
        TusdFile.objects.create(
            file_share=tusd_file_share,
            file_id=file_id,
            name=file_name
        )

        files = TusdFileSerializer(
            TusdFile.objects.filter(file_share=tusd_file_share).order_by('created_at'),
            many=True
        ).data

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user-list_{workspace_uuid}',
            {'type': 'file_list_changed', 'file_list': files}
        )
        return Response()
    elif hook_name in ('post-create', 'post-receive', 'post-terminate'):
        return Response()

    return Response(status=HTTP_400_BAD_REQUEST)

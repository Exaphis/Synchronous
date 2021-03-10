from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError, ParseError
from rest_framework.response import Response

from .models import Workspace
from .serializers import WorkspaceSerializer
from .permissions import IsReadableOrAuthenticated


class WorkspaceCreateView(generics.CreateAPIView):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer


# TODO: if readable but not authed, then return read-only links to the workspace apps
class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsReadableOrAuthenticated]
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    lookup_field = 'unique_id'


@api_view(['GET'])
def nickname_to_unique_id(request):
    if 'nickname' not in request.query_params:
        raise ParseError('nickname parameter must be set.')

    nickname = request.query_params['nickname']
    workspace = get_object_or_404(Workspace, nickname=nickname)
    return Response({'unique_id': workspace.unique_id})


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        data = request.data
        if 'unique_id' not in data:
            raise ValidationError('Must include "unique_id".',
                                  code='authorization')

        try:
            workspace = Workspace.objects.get(unique_id=data['unique_id'])
        except ObjectDoesNotExist:
            raise ValidationError('Workspace with given "unique_id" does not exist.',
                                  code='authorization')

        if workspace.user is None:
            raise ValidationError('Workspace is globally editable',
                                  code='authorization')

        # since username is the unique_id and the user serializer class expects the username field,
        # reassign the unique_id field
        updated_data = data.copy()  # copy since request.data is immutable
        updated_data['username'] = updated_data['unique_id']

        serializer = self.serializer_class(data=updated_data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        assert user.workspace == workspace

        return Response({
            'token': token.key,
            'unique_id': user.workspace.unique_id
        })

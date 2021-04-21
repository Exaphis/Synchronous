from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError, ParseError
from rest_framework.response import Response

from .models import Workspace
from .serializers import WorkspaceSerializer, WorkspacePasswordChangeSerializer
from .permissions import IsReadableOrAuthenticated, IsAuthenticated
from .inform_using_mail import send_mail_to


# https://stackoverflow.com/questions/38845051/how-to-update-user-password-in-django-rest-framework
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = WorkspacePasswordChangeSerializer
    model = Workspace
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, unique_id=None, **kwargs):
        if unique_id is None:
            return Response({"error": True, "detail": "No unique ID."},
                            status=status.HTTP_400_BAD_REQUEST)

        workspace = get_object_or_404(self.model, unique_id=unique_id)
        if workspace.user is None:
            return Response({"error": True, "detail": "Workspace has no password."},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            new_password = serializer.data['password']
            if not new_password:
                workspace.user.delete()
            else:
                workspace.user.set_password(new_password)
                workspace.user.save()

            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'Password updated successfully',
                'data': []
            }

            return Response(response)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkspaceCreateView(generics.CreateAPIView):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer


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


@api_view(['GET'])
def generate_workspace_zip(request, unique_id):
    workspace = get_object_or_404(Workspace, unique_id=unique_id)
    # TODO: generate zip for workspace
    pass


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


@api_view(['POST'])
def send_message(request):
    if 'email' not in request.data:
        raise ParseError('email parameter must be set.')
    if 'subject' not in request.data:
        raise ParseError('message parameter must be set.')
    if 'message' not in request.data:
        raise ParseError('message parameter must be set.')

    email = request.data['email']
    subject = request.data['subject']
    message = request.data['message']

    send_mail_to(subject, message, [email])

    return Response(status=status.HTTP_200_OK)


@api_view(['GET'])
def heartbeat(request):
    return Response()

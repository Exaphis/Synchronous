from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from rest_framework import generics

from .models import Workspace
from .forms import CreateWorkspaceForm
from .serializers import WorkspaceSerializer


class WorkspaceCreateView(generics.CreateAPIView):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer


class WorkspaceRetrieveView(generics.RetrieveAPIView):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    lookup_field = 'unique_id'


def main(request):
    if request.method != 'GET':
        return HttpResponse(status=405)

    context = {
        'form': CreateWorkspaceForm()
    }
    return HttpResponse(render(request, 'workspace/index.html', context))


def create_workspace(request):
    # respond to workspace creation form
    if request.method != 'POST':
        return HttpResponse(status=405)

    form = CreateWorkspaceForm(request.POST)
    if form.is_valid():
        workspace = Workspace()
        workspace.save()

        return redirect('get-workspace', workspace.unique_id)
    else:
        return redirect('main')


def get_workspace(request, unique_id):
    if request.method != 'GET':
        return HttpResponse(status=405)

    workspace = get_object_or_404(Workspace, unique_id=unique_id)
    workspace_json = serializers.serialize('json', [workspace])
    return JsonResponse(workspace_json, safe=False)

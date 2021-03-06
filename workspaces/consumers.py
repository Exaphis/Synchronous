from django.utils import timezone
from django.db import IntegrityError
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer
from rest_framework.authtoken.models import Token

# separate these into a separate file to avoid circular importing in consumers/models
from .api_types import AppType, ClientMsgType, ServerMsgType
from .models import (
    iter_specific_apps,
    Workspace,
    WorkspaceTab,
    WorkspaceApp,
    WorkspacePadApp,
    WorkspaceFileShareApp,
    WorkspaceWhiteboardApp,
)
from .serializers import (
    WorkspaceTabSerializer,
    WorkspacePadAppSerializer,
    WorkspaceFileShareAppSerializer,
    WorkspaceAppSerializer,
    WorkspaceWhiteboardAppSerializer,
)
from users.models import WorkspaceUser
from users.serializers import WorkspaceUserSerializer
from tusdfileshare.models import TusdFileShare, TusdFile
from tusdfileshare.serializers import TusdFileSerializer


class WorkspaceWebsocketConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.workspace_group_name = None
        self.workspace = None
        self.user = None

        # handling read only links
        self.is_read_only = False  # whether this connection should show read only links
        self.authenticated = False

        super().__init__(*args, **kwargs)

    def connect(self):
        print("connection request received!")
        unique_id = self.scope["url_route"]["kwargs"]["unique_id"]
        self.workspace_group_name = f"ws_{unique_id}"

        try:
            self.workspace = Workspace.objects.get(unique_id=unique_id)
        except Workspace.DoesNotExist:
            print("Workspace does not exist")
            self.close("Workspace does not exist")
            return

        if self.workspace.user is not None:
            print("pw protected workspace!")
            self.is_read_only = self.workspace.anonymous_readable
        else:
            self.authenticated = True

        # add user to groups so they receive all messages
        async_to_sync(self.channel_layer.group_add)(
            self.workspace_group_name, self.channel_name
        )

        self.user = WorkspaceUser.objects.create(workspace=self.workspace)
        self.user.save()

        self.accept()
        self.send_json({"type": ServerMsgType.CURRENT_USER, "user_id": self.user.id})
        self.send_user_list_to_all()

        self.send_json(
            {"type": ServerMsgType.TAB_LIST, "tab_list": self.get_tab_list()}
        )

    def get_app_list(self, tab_unique_id):
        tab = WorkspaceTab.objects.get(unique_id=tab_unique_id)
        apps = WorkspaceApp.objects.filter(tab=tab)

        app_list = []
        for app in iter_specific_apps(apps):
            if isinstance(app, WorkspacePadApp):
                app_type = AppType.PAD
                data = WorkspacePadAppSerializer(app).data
                if self.is_read_only:
                    data["iframe_url"] = data["iframe_url_read_only"]
            elif isinstance(app, WorkspaceFileShareApp):
                app_type = AppType.FILE_SHARE
                data = WorkspaceFileShareAppSerializer(app).data
            elif isinstance(app, WorkspaceWhiteboardApp):
                app_type = AppType.WHITEBOARD
                data = WorkspaceWhiteboardAppSerializer(app).data
                if self.is_read_only:
                    data["iframe_url"] = data["iframe_url_read_only"]
            elif str(app).find("Offline") != -1:
                app_type = AppType.OFFLINE_PAD
                data = WorkspaceAppSerializer(app).data
            else:
                print("Couldn't find child class of app, defaulting to example app")
                app_type = AppType.TEMPLATE
                data = WorkspaceAppSerializer(app).data

            app_list.append(
                {
                    "app_type": app_type,
                    "unique_id": data["unique_id"],
                    "name": data["name"],
                    "data": data,
                }
            )

        return app_list

    def get_tab_list(self):
        return WorkspaceTabSerializer(
            WorkspaceTab.objects.filter(workspace=self.workspace), many=True
        ).data

    def send_user_list_to_all(self):
        users = {}
        for user in WorkspaceUser.objects.filter(workspace=self.workspace):
            user_data = WorkspaceUserSerializer(user).data

            # redis does not like ints as keys
            users[str(user_data["id"])] = user_data

        async_to_sync(self.channel_layer.group_send)(
            self.workspace_group_name, {"type": "user_list_changed", "user_list": users}
        )

    def send_tab_list_to_all(self):
        async_to_sync(self.channel_layer.group_send)(
            self.workspace_group_name,
            {"type": "tab_list_changed", "tab_list": self.get_tab_list()},
        )

    def send_app_list_to_all(self, tab_unique_id):
        async_to_sync(self.channel_layer.group_send)(
            self.workspace_group_name,
            {
                "type": "app_list_changed",
                "tab_id": tab_unique_id,
                "app_list": self.get_app_list(tab_unique_id),
            },
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.workspace_group_name, self.channel_name
        )

        # handles invalid workspace id leading to no user being created
        if self.user is not None:
            self.user.delete()
            self.send_user_list_to_all()

    def user_list_changed(self, event):
        user_list = event["user_list"]
        self.send_json({"type": ServerMsgType.USER_LIST, "user_list": user_list})

    def file_list_changed(self, event):
        file_list = event["file_list"]
        self.send_json({"type": ServerMsgType.FILE_LIST, "file_list": file_list})

    def tab_list_changed(self, event):
        tab_list = event["tab_list"]
        self.send_json({"type": ServerMsgType.TAB_LIST, "tab_list": tab_list})

    def app_list_changed(self, event):
        self.send_json(
            {
                "type": ServerMsgType.APP_LIST,
                "tab_id": event["tab_id"],
                "app_list": event["app_list"],
            }
        )

    def handle_auth(self, content):
        if self.authenticated:
            return

        if "Authorization" in content:
            key = content["Authorization"]
            print(f"Authorizing with key {key}")
            try:
                self.authenticated = (
                    Token.objects.get(key=key).user == self.workspace.user
                )
            except Token.DoesNotExist:
                print("Token object not found for key")

        if self.authenticated:
            self.is_read_only = False

    """
    Types of messages:
    
    ClientMsgType.Activity:
        Sent when the user becomes active or inactive.
        
        isActive: boolean of new active state of the user.
    
    ClientMsgType.NICKNAME_CHANGE:
        Sent when the user requests a nickname change.
        
        nickname: new nickname of the user.
    
    ClientMsgType.FILE_LIST_REQUEST:
        Sent when the user wants a message containing the current files
        shared in a workspace's file share.
    
    ClientMsgType.NEW_TAB:
        Sent when the user wants to create a new tab.
        
        name: name of the new tab.
        
    ClientMsgType.DELETE_TAB:
        Sent when the user wants to delete a tab.
        
        uniqueId: UUID of the target tab.
    
    ClientMsgType.TAB_NAME_CHANGE:
        Sent when the user wants to change the name of a tab.
        
        uniqueId: UUID of the target tab. 
        name: new name of the tab.
        
    ClientMsgType.NEW_APP:
        Sent when the user creates a new app in a tab.
        
        tabId: UUID of the tag within which the app will be created.
        appType: AppType number of the new app.
        name: name of the new app.
        
    ClientMsgType.APP_LIST_REQUEST:
        Sent when the user needs the list of apps in the current tab.
        
        tabId: UUID of which tab's app list to return.
        
    ClientMsgType.DELETE_APP:
        Sent when the user closes an app.
        
        tabId: UUID of the tab that the app is contained in.
        appId: UUID of the app to close.
    """

    def receive_json(self, content, **kwargs):
        self.handle_auth(content)

        if not self.authenticated and not self.is_read_only:
            print("rejecting, unauthorized")
            self.send_json({"error": "Not authorized."})
            return

        # TODO: always send success/failure response

        msg_type = content["type"]
        if msg_type == ClientMsgType.ACTIVITY:
            new_active = content["isActive"]
            if new_active != self.user.active:
                self.user.active = new_active

                if not self.user.active:
                    self.user.went_inactive_at = timezone.now()

                self.user.save()

                self.send_user_list_to_all()
        elif msg_type == ClientMsgType.NICKNAME_CHANGE:
            old_nickname = self.user.nickname
            new_nickname = content["nickname"]
            try:
                self.user.nickname = new_nickname
                self.user.save()
                self.send_json({"type": ServerMsgType.NICKNAME_CHANGE, "success": True})

                self.send_user_list_to_all()
            except IntegrityError:
                self.user.nickname = old_nickname
                self.send_json(
                    {
                        "type": ServerMsgType.NICKNAME_CHANGE,
                        "success": False,
                        "details": "Duplicate nickname.",
                    }
                )
        elif msg_type == ClientMsgType.FILE_LIST_REQUEST:
            files = []

            try:
                tusd_file_share = TusdFileShare.objects.get(workspace=self.workspace)
                files = TusdFileSerializer(
                    TusdFile.objects.filter(file_share=tusd_file_share), many=True
                ).data
            except TusdFileShare.DoesNotExist:
                pass

            self.file_list_changed({"file_list": files})
        elif msg_type == ClientMsgType.NEW_TAB:
            WorkspaceTab.objects.create(workspace=self.workspace, name=content["name"])
            self.send_tab_list_to_all()
        elif msg_type == ClientMsgType.DELETE_TAB:
            # TODO: send error message if failure
            WorkspaceTab.objects.get(unique_id=content["uniqueId"]).delete()
            self.send_tab_list_to_all()
        # TODO: ClientMsgType.TAB_NAME_CHANGE
        elif msg_type == ClientMsgType.NEW_APP:
            if not self.authenticated:
                self.send_json({"error": "Not authorized."})
                return

            tab_unique_id = content["tabId"]
            try:
                tab = WorkspaceTab.objects.get(unique_id=tab_unique_id)
            except WorkspaceTab.DoesNotExist:
                self.send_json(
                    {
                        "type": ServerMsgType.NEW_APP,
                        "success": False,
                        "details": "Invalid tab ID.",
                    }
                )
                return

            app_type = content["appType"]
            name = content["name"]

            if app_type == AppType.PAD:
                WorkspacePadApp.objects.create_pad(tab=tab, name=name)
            elif app_type == AppType.FILE_SHARE:
                tusd_file_share, _ = TusdFileShare.objects.get_or_create(
                    workspace=self.workspace
                )

                WorkspaceFileShareApp.objects.create(
                    tab=tab, name=name, tusd_file_share=tusd_file_share
                )
            elif app_type == AppType.OFFLINE_PAD:
                WorkspaceApp.objects.create(tab=tab, name=name)
            elif app_type == AppType.WHITEBOARD:
                WorkspaceWhiteboardApp.objects.create_whiteboard(tab=tab, name=name)
            else:
                print("App type not found, defaulting to template")
                WorkspaceApp.objects.create(tab=tab, name=name)

            self.send_json({"type": ServerMsgType.NEW_APP, "success": True})

            print(f"New app of type {app_type} created.")
            self.send_app_list_to_all(tab_unique_id)
        elif msg_type == ClientMsgType.APP_LIST_REQUEST:
            tab_id = content["tabId"]
            self.app_list_changed(
                {"tab_id": tab_id, "app_list": self.get_app_list(tab_id)}
            )
        elif msg_type == ClientMsgType.DELETE_APP:
            if not self.authenticated:
                self.send_json({"error": "Not authorized."})
                return

            app_id = content["appId"]
            tab_id = content["tabId"]

            try:
                app = WorkspaceApp.objects.get(unique_id=app_id)
            except WorkspaceApp.DoesNotExist:
                print(f"App ID {app_id} does not exist")
                return

            app.delete()
            print("app deleted")

            self.send_app_list_to_all(tab_id)

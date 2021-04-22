# don't use enum because JSON can't serialize it
class AppType:
    TEMPLATE = 0
    PAD = 1
    FILE_SHARE = 2
    WHITEBOARD = 3
    OFFLINE_PAD = 4


# Client and Server message types must be unique
# to avoid pubsub topic mixups in the frontend
class ClientMsgType:
    ACTIVITY = 'activity'
    NICKNAME_CHANGE = 'nicknameChange'
    FILE_LIST_REQUEST = 'fileListRequest'
    NEW_TAB = 'newTab'
    DELETE_TAB = 'deleteTab'
    TAB_NAME_CHANGE = 'tabNameChange'
    NEW_APP = 'newApp'
    APP_LIST_REQUEST = 'appListRequest'
    DELETE_APP = 'deleteApp'


class ServerMsgType:
    USER_LIST = 'user_list'
    CURRENT_USER = 'current_user'
    NICKNAME_CHANGE = 'nickname_change'
    FILE_LIST = 'file_list'
    TAB_LIST = 'tab_list'
    NEW_APP = 'new_app'
    APP_LIST = 'app_list'

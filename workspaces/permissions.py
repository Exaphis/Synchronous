from rest_framework.permissions import BasePermission


class IsAuthenticated(BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.user is None:
            return True

        return obj.user == request.user


class IsReadableOrAuthenticated(BasePermission):
    """
    Allows access if the user has the correct token.
    Also allows access if the object is viewable without password.

    For each case of workspace object:
    if workspace.user is None: return edit-enabled links

    else if workspace.anonymous_readable:
        if authenticated: return edit-enabled links
        else: allow viewing without password, return read-only links

    else: redirect to login page
    """

    def has_object_permission(self, request, view, obj):
        if obj.user is None:
            return True

        if obj.anonymous_readable:
            return True

        return obj.user == request.user

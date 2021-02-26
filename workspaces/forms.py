from django import forms


class CreateWorkspaceForm(forms.Form):
    # TODO: hide fields that aren't needed (e.g. password if password_protected is not checked)
    password_protected = forms.BooleanField(required=False)
    viewable_without_password = forms.BooleanField(required=False)
    password = forms.CharField(widget=forms.PasswordInput)
